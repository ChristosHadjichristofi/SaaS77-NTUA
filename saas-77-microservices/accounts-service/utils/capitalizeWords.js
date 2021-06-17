/**
 * @param {*} word 
 * @returns wordCapitalized (first letter Capital and all others lowercase)
 */

module.exports = (word) => {

    const wordLowerCase = word.toLowerCase();
    const wordCapitalized = wordLowerCase[0].toUpperCase() + wordLowerCase.substring(1);

    return wordCapitalized;
}