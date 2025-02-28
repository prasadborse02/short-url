const PREVIEW_BOTS = [
    'whatsapp',
    'facebookexternalhit',
    'twitterbot',
    'telegrambot',
    'linkedinbot',
    'slackbot'
];

function isPreviewBot(userAgent) {
    if (!userAgent) return false;
    userAgent = userAgent.toLowerCase();
    return PREVIEW_BOTS.some(bot => userAgent.includes(bot));
}

module.exports = { isPreviewBot };
