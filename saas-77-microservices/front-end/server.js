const app = require("./app");
const chalk = require("chalk");

// for database
const sequelize = require("./utils/database");

const port = Number(4007);

sequelize
    .query(`CREATE SCHEMA IF NOT EXISTS "${process.env.DB_SCHEMA}";`)
    .then(() => {
        sequelize
            .sync({
                // delete if system is ready to deploy
                force: true,
                // end
            })
            .then((result) => {
                app.listen(port, () => {
                    console.log(chalk.green(`🚀 Server running on port ${port}!`));
                });
            })
            .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
