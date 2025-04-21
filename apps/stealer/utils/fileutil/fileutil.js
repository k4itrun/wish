const os = require('os');
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const program = require('../program/program.js');

const Tree = (dirPath, indent = '', isRootDir = true) => {
  let treeStructure = '';

  try {
    const directoryContents = fs.readdirSync(dirPath, { withFileTypes: true });

    directoryContents.forEach((entry, index) => {
      const isLastEntry = index === directoryContents.length - 1;
      let connector = isLastEntry ? `${indent}└── ` : `${indent}├── `;

      if (isRootDir) {
        connector = indent;
      }

      if (entry.isDirectory()) {
        treeStructure += `${connector}📂 - ${entry.name}\n`;

        const newIndent = isLastEntry ? `${indent}    ` : `${indent}│   `;
        treeStructure += Tree(path.join(dirPath, entry.name), newIndent, false);
      } else {
        const fileSizeKB = (fs.statSync(path.join(dirPath, entry.name)).size / 1024).toFixed(2);
        treeStructure += `${connector}📄 - ${entry.name} (${fileSizeKB} kb)\n`;
      }
    });
  } catch (error) {
    console.error(error);
  }

  if (treeStructure.length > 4090) {
    return 'Numerous files to explore.';
  }

  return treeStructure;
};

const WriteDataToFile = async (profilePath, fileName, data) => {
  if (data.length === 0) return;

  const filePath = path.join(profilePath, fileName);
  let writeData = '';

  try {
    writeData = data
      .filter((response) => response)
      .map((response) => {
        return typeof response.Write === 'function' ? response.Write() : response;
      })
      .join(fileName.toLowerCase().includes('cookies') ? '' : '\n');

    if (writeData.length > 0) {
      writeData = `${WishBanner()}\n\n${writeData}`;
      await fs.promises.writeFile(filePath, writeData);
    }
  } catch (error) {
    console.log(error);
  }
};

const WishTempDir = (createDir = '') => {
  const destWish = path.join(os.tmpdir(), 'wish', createDir);

  if (!fs.existsSync(destWish)) {
    fs.mkdirSync(destWish, { recursive: true });
  }

  return destWish;
};

const WishBanner = () => {
  return `
\t\`8.\`888b                 ,8'  8 8888    d888888o.   8 8888        8 
\t \`8.\`888b               ,8'   8 8888  .\`8888:' \`88. 8 8888        8 
\t  \`8.\`888b             ,8'    8 8888  8.\`8888.   Y8 8 8888        8 
\t   \`8.\`888b     .b    ,8'     8 8888  \`8.\`8888.     8 8888        8 
\t    \`8.\`888b    88b  ,8'      8 8888   \`8.\`8888.    8 8888        8 
\t     \`8.\`888b .\`888b,8'       8 8888    \`8.\`8888.   8 8888        8 
\t      \`8.\`888b8.\`8888'        8 8888     \`8.\`8888.  8 8888888888888 
\t       \`8.\`888\`8.\`88'         8 8888 8b   \`8.\`8888. 8 8888        8 
\t        \`8.\`8' \`8,\`'          8 8888 \`8b.  ;8.\`8888 8 8888        8 
\t         \`8.\`   \`8'           8 8888  \`Y8888P ,88P' 8 8888        8 
\n\n
\t               by k4itrun | https://github.com/k4itrun/wish
`;
};

const ZipDirectory = async ({ inputDir, outputZip }) => {
  if (typeof inputDir !== 'string' || typeof outputZip !== 'string') {
    throw new TypeError('Both "inputDir" and "outputZip" arguments must be strings.');
  }

  if (!fs.existsSync(inputDir)) {
    throw new Error(`The input directory "${inputDir}" does not exist.`);
  }

  return new Promise((resolve, reject) => {
    const outputStream = fs.createWriteStream(outputZip);
    const archive = archiver('zip', { zlib: { level: 9 } });

    outputStream.on('close', () => {
      resolve(outputZip);
    });

    outputStream.on('error', (error) => {
      reject(new Error(`Error writing ZIP file: ${error}`));
    });

    archive.on('error', (error) => {
      reject(new Error(`Error creating ZIP file: ${error}`));
    });

    archive.pipe(outputStream);
    archive.directory(inputDir, false);
    archive.finalize();
  });
};

const RemoveDir = async (dirPath, retries = 5) => {
  for (let i = 0; i < retries; i++) {
    try {
      await fs.promises.rm(dirPath, { recursive: true, force: true });
      return;
    } catch (error) {
      if (error.code === 'ENOTEMPTY' && i < retries - 1) {
        await program.Delay(1000);
      } else {
        throw error;
      }
    }
  }
};

const CopyFile = async (src, dest) => {
  const inStream = fs.createReadStream(src);
  const outStream = fs.createWriteStream(dest);

  return new Promise((resolve, reject) => {
    inStream.on('error', reject);
    outStream.on('error', reject);
    outStream.on('close', resolve);
    inStream.pipe(outStream);
  }).then(async () => {
    const srcStats = await fs.promises.stat(src);
    await fs.promises.chmod(dest, srcStats.mode);
  });
};

const CopyDir = async (src, dest) => {
  const srcStats = await fs.promises.stat(src);

  if (!srcStats.isDirectory()) {
    throw new Error('The source is not a directory');
  }

  await fs.promises.mkdir(dest, {
    recursive: true,
    mode: srcStats.mode,
  });

  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(src, entry.name);
      const dstPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        try {
          await fs.promises.stat(dstPath);
        } catch (error) {
          if (error.code === 'ENOENT') {
            await CopyDir(srcPath, dstPath);
          }
        }
      } else if (!entry.isSymbolicLink()) {
        try {
          await fs.promises.stat(dstPath);
        } catch (error) {
          if (error.code === 'ENOENT') {
            await CopyFile(srcPath, dstPath);
          }
        }
      }
    })
  );
};

const Copy = async (src, dest) => {
  try {
    const stats = await fs.promises.stat(src);

    if (stats.isDirectory()) {
      await CopyDir(src, dest);
    } else {
      await CopyFile(src, dest);
    }
  } catch (error) {
    console.error('Error copying:', error);
  }
};

module.exports = {
  RemoveDir,
  Copy,
  CopyFile,
  CopyDir,
  WriteDataToFile,
  ZipDirectory,
  WishBanner,
  WishTempDir,
  Tree,
};
