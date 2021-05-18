const app = require("./app");

const chalk = require("chalk");

// for database
const sequelize = require("./utils/database");
var initModels = require("./models/init-models");

const port = Number(4003);

initModels(sequelize);
sequelize
    .sync({
        // delete if system is ready to deploy
        // force: true,
        // end
    })
    .then((result) => {
        app.listen(port, () => {
            console.log(chalk.green(`🚀 Browse Questions Service running on port ${port}!`));
        });
    })
    .catch((err) => console.log(err));