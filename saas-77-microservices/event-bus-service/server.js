const app = require("./app");
const chalk = require("chalk");
require('custom-env').env('localhost')

const port = Number(4006);

app.listen(port, () => {
    console.log(chalk.green(`Event 🚍 running on port ${port}!`));
});