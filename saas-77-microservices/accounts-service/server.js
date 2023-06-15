const app = require("./app");
const chalk = require("chalk");

// for database
const sequelize = require("./utils/database");
var initModels = require("./models/init-models");

const port = Number(4000);

sequelize
    .query(`CREATE SCHEMA IF NOT EXISTS "${process.env.DB_SCHEMA}";`)
    .then(() => {
        initModels(sequelize);
        sequelize
            .sync({
                // delete if system is ready to deploy
                force: true,
                // end
            })
            .then((result) => {
                app.listen(port, () => {
                    console.log(chalk.green(`🚀 Accounts Service running on port ${port}!`));
                });
            })
            .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
