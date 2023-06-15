const Sequelize = require('sequelize');
require('custom-env').env('localhost');

const createSequelizeInstance = () => {
  return new Promise((resolve, reject) => {
    const sequelize = new Sequelize(process.env.DB, process.env.DB_USER, process.env.DB_PASS, {
      dialect: 'postgres',
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      timezone: process.env.DB_TIMEZONE
    });

    sequelize
      .authenticate()
      .then(() => {
        console.log("Success connecting to the database!");
        resolve(sequelize);
      })
      .catch(err => {
        console.error("Unable to connect to the database", err);
        reject(err);
      });
  });
};

module.exports = createSequelizeInstance;
