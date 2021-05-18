const app = require("./app");
const chalk = require("chalk");

const port = Number(4006);

app.listen(port, () => {
    console.log(chalk.green(`Event 🚍 running on port ${port}!`));
});