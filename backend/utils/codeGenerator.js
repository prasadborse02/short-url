const { nanoid } = require('nanoid');
const urlService = require('../services/urlService');

const generateUniqueShortCode = async () => {
    let shortCode;
    let isUnique = false;
    
    while (!isUnique) {
        shortCode = nanoid(6);
        const exists = await urlService.getOriginalUrl(shortCode);
        if (!exists) {
            isUnique = true;
        }
    }
    return shortCode;
};

module.exports = {
    generateUniqueShortCode
};
