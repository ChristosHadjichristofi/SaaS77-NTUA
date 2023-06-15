const app = require("./app");
const chalk = require("chalk");

// for database
const sequelize = require("./utils/database");
const initModels = require("./models/init-models");

const port = Number(4000);

const createSchema = async () => {
  try {
    // Connect to the database
    await sequelize.authenticate();

    // Create the schema (database)
    await sequelize.query(`CREATE SCHEMA IF NOT EXISTS ${ process.env.DB_SCHEMA }`);

    console.log("Schema created successfully");
  } catch (error) {
    console.error("Error creating schema:", error);
  } finally {
    // Close the database connection
    await sequelize.close();
  }
};

const startServer = async () => {
  try {
    // Create the schema (database)
    await createSchema();

    // Initialize Sequelize models
    initModels(sequelize);

    // Sync models with the database
    await sequelize.sync({
      // delete if system is ready to deploy
      force: true,
      // end
    });

    // Start the server
    app.listen(port, () => {
      console.log(chalk.green(`🚀 Accounts Service running on port ${port}!`));
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

// Call startServer function to create schema and start the server
startServer();
