const app = require("./app");

const chalk = require("chalk");

// for database
const sequelize = require("./utils/database");
var initModels = require("./models/init-models");
const populate_db = require('./utils/populateDB/populate-db');

const port = process.env.PORT;

initModels(sequelize);
sequelize
    .sync({
        // delete if system is ready to deploy
        // force: true,
        // end
    })
    .then((result) => {
        app.listen(port, () => {
            if (process.env.APP_ENV == "localhost") populate_db();
            console.log(chalk.green(`🚀 Server running on port ${port}!`));
        });
    })
    .catch((err) => console.log(err));