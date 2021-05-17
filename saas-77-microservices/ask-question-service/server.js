const app = require("./app");
const chalk = require("chalk");

const port = Number(4001);

app.listen(port, () => {
    console.log(chalk.green(`🚀 Ask Question Service running on port ${port}!`));
});