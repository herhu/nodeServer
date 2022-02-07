"use strict";

const CryptoJS = require("crypto-js");
const { SECRET } = require('../config')

module.exports = {
    decrypt: async ciphertext => {
        const bytes = await CryptoJS.AES.decrypt(ciphertext, SECRET);
        const decryptedData = await JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
        return decryptedData
    },
    encrypt: async data => {
        const ciphertext = await CryptoJS.AES.encrypt(JSON.stringify(data), SECRET).toString();
        return ciphertext
    },
};