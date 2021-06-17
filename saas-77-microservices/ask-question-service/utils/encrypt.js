const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

/**
 * function to cipher a text
 * @param {*} text 
 * @returns cipher text and iv
 */

module.exports = (text) => {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(process.env.SECRET_ENCRYPT), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') };
}