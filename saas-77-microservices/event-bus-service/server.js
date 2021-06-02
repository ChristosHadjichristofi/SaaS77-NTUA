const app = require("./app");
const chalk = require("chalk");
const cli = require('./utils/cli');

require('custom-env').env('localhost')

// for database
const sequelize = require('./utils/database');
var initModels = require("./models/init-models");
var models = initModels(sequelize);

const port = Number(4006);
initModels(sequelize);

// embed cli code
cli;

sequelize
    .sync({
        // delete if system is ready to deploy
        force: true,
        // end
    })
    .then(() => {
        app.listen(port, () => {
            console.log(chalk.green(`Event 🚍 running on port ${port}!`));
        });
    })
    .catch((err) => console.log(err));
