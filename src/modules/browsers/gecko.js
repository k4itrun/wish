const fs = require("fs");
const path = require("path");
const iconv = require("iconv-lite");

const structures = require("./structures");
const cryptofy = require('./crypto.js');
const query = require("./query.js");

class Gecko {
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
            return rows.map(row => {
                const rowContentString = row.content;
                const matchFilePath = rowContentString.match(/file:\/\/\/(.*?),/);
                if (!matchFilePath) return null;
                const rowFilePath = matchFilePath[1];
                const jsonStringMatch = rowContentString.match(/,(.*)/);
                if (!jsonStringMatch || jsonStringMatch.length < 2) return null;
                let rowObjectJson;
                try {
                    rowObjectJson = JSON.parse(jsonStringMatch[1]);
                } catch (error) {
                    return null;
                }
                return new structures.Download(
                    row.url,
                    rowFilePath,
                    rowObjectJson.fileSize
                );
            }).filter(Boolean);
        } catch (error) {
            console.log(error)
            return [];
        }
    };

    GetHistorys = async (geckoPathProfile) => {
        const PlacesDbFilePath = path.join(geckoPathProfile, 'places.sqlite');
        if (!fs.existsSync(PlacesDbFilePath)) return [];
        const sqliteQuery = new query.SqliteQuery(PlacesDbFilePath);
        try {
            const rows = await sqliteQuery.execute('SELECT url, title, visit_count, last_visit_date FROM moz_places where title not null');
            return rows.map(row =>{
                return new structures.History(
                    row.url,
                    row.title,
                    row.visit_count,
                    row.last_visit_date
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
            const rows = await sqliteQuery.execute('SELECT url, title, dateAdded, id FROM (SELECT * FROM moz_bookmarks INNER JOIN moz_places ON moz_bookmarks.fk=moz_places.id)');
            return rows.map(row =>{
                return new structures.Bookmark(
                    row.url,
                    row.title,
                    row.dateAdded
                )
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    };

    GetLogins = async (geckoPathProfile, MasterKey) => {
        const LoginsFilePath = path.join(geckoPathProfile, "logins.json");
        const LoginsFileTempPath = path.join(geckoPathProfile, 'logins.temp.json');
        if (!fs.existsSync(LoginsFilePath)) return [];
        try {
            fs.copyFileSync(LoginsFilePath, LoginsFileTempPath);
            const loginsObjectJson = JSON.parse(fs.readFileSync(LoginsFileTempPath, "utf8"));
            return loginsObjectJson?.logins.map(({ encryptedUsername, encryptedPassword, hostname, timeLastUsed }) => {
                const username = cryptofy.decryptedData(
                    cryptofy.decodeB64ASN1Data(encryptedUsername).data,
                    cryptofy.decodeB64ASN1Data(encryptedUsername).iv,
                    MasterKey,
                    "3DES-CBC"
                );
                const password = cryptofy.decryptedData(
                    cryptofy.decodeB64ASN1Data(encryptedPassword).data,
                    cryptofy.decodeB64ASN1Data(encryptedPassword).iv,
                    MasterKey,
                    "3DES-CBC"
                );
                const [encodedUsername, encodedPassword] = [
                    iconv.encode(username.data, "latin1").toString(),
                    iconv.encode(password.data, "latin1").toString()
                ];
                return (username.data && password.data)
                    ? new structures.Login(hostname, encodedUsername, encodedPassword, timeLastUsed)
                    : null;
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
            const rows = await sqliteQuery.execute('SELECT host, path, isSecure, expiry, name, value FROM moz_cookies');
            return rows.map(row => {
                structures.BrowserStatistics.addCookies({
                    host_key: row.host,
                    path: row.path,
                    is_secure: row.isSecure,
                    expires_utc: row.expiry,
                    name: row.name,
                    value: row.value
                });
                return new structures.Cookie(
                    row.host,
                    row.path,
                    row.isSecure,
                    row.expiry,
                    row.name,
                    row.value
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