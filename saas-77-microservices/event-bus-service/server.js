const app = require("./app");
const chalk = require("chalk");
require('custom-env').env('localhost')

// for database
const sequelize = require('./utils/database');
var initModels = require("./models/init-models");
var models = initModels(sequelize);

const port = Number(4006);
initModels(sequelize);
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
