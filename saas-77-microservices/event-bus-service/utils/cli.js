const modController = require('../controllers/moderate');
const chalk = require('chalk');

process.stdin.resume();
process.stdin.setEncoding('utf8');

process.stdin.on('data', (text) => {
    if (text.trim() === 'commands --list') 
        console.log(`Commands List: 
        1. Subscribers --status`)
    else if (text.trim() === 'Subscribers --status') modController.moderate();
    else console.log(chalk.red(`Unknown CLI command. Use commands --list to see the available commands.`));
});