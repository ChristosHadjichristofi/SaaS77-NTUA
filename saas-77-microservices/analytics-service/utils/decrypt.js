const crypto = require('crypto');
const algorithm = 'aes-256-cbc';

/**
 * function to decipher a text
 * @param {*} text (encrypted)
 * @returns decrypted text
 */

module.exports = (text) => {
    let iv = Buffer.from(text.iv, 'hex');
    let encryptedText = Buffer.from(text.encryptedData, 'hex');
    let decipher = crypto.createDecipheriv(algorithm, process.env.SECRET_ENCRYPT, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}