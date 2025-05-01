const child_process = require("child_process");
const path = require("path");
const fs = require("fs");
const os = require("os");

const program = require("./../../utils/program/program.js");

module.exports = () => {
 const vbsContent = `
        Set objShell = WScript.CreateObject("WScript.Shell")
        MsgBox "Windows Unexpected error...", vbInformation, "Error Code: 0x948548"
    `;

 const tempFile = path.join(os.tmpdir(), `${program.RandString(10)}.vbs`);
 fs.writeFileSync(tempFile, vbsContent);

 try {
  child_process.execSync(`cscript "${tempFile}"`);
 } catch (error) {
 } finally {
  fs.unlinkSync(tempFile);
 }
};
