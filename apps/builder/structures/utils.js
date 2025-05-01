const gradient = require("gradient-string");

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

const applyGradient = (colors, text) => {
 if (!Array.isArray(colors) || colors.length === 0) {
  throw new Error('The "colors" parameter should be a non-empty array.');
 }

 if (typeof text !== "string" && typeof text !== "number") {
  throw new Error('The "text" parameter should be a string or a number.');
 }

 return gradient(colors)(text.toString());
};

const isLinkIcon = (url) => {
 const regex = /^(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\/\/=]*)$/i;
 return regex.test(url);
};

const isWebhookUrl = (url) => {
 const regex = /^(https:\/\/(discordapp\.com|discord\.com|canary\.discord\.com|ptb\.discord\.com)\/api\/webhooks\/\d+\/[a-zA-Z0-9_-]+)$/i;
 return regex.test(url);
};

module.exports = {
 WishBanner,
 applyGradient,
 isLinkIcon,
 isWebhookUrl,
};
