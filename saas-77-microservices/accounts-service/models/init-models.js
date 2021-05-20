var DataTypes = require("sequelize").DataTypes;
var _Users = require("./Users");

function initModels(sequelize) {
  var Users = _Users(sequelize, DataTypes);

  return {
    Users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
