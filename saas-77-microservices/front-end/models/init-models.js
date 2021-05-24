var DataTypes = require("sequelize").DataTypes;
var _Sessions = require("./Sessions");

function initModels(sequelize) {
  var Sessions = _Sessions(sequelize, DataTypes);

  return {
    Sessions,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
