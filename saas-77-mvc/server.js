const app = require('./app');

// const postgres = require('./util/database');
const chalk = require('chalk');

const port = Number(8765);

app.listen(port, () => console.log(chalk.green(`🚀 Server running on port ${port}!`)))
