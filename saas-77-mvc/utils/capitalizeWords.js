// function to capitalize a word

module.exports = (word) => {

    const wordLowerCase = word.toLowerCase();
    const wordCapitalized = wordLowerCase[0].toUpperCase() + wordLowerCase.substring(1);

    return wordCapitalized;
}