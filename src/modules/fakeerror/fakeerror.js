const child_process = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const program = require('./../../utils/program/program.js');

module.exports = () => {
    try {
        const vbsPath = path.join(os.tmpdir(), `${program.randString(10)}.vbs`);
        const vbsContent = `
            Set objShell = WScript.CreateObject("WScript.Shell")
            MsgBox "Windows Unexpected error...", vbInformation, "Error Code: 0x948548"
        `;
        fs.writeFileSync(vbsPath, vbsContent, 'utf8');
        child_process.exec(`cscript "${vbsPath}"`);
    } catch (error) {

    }
};
