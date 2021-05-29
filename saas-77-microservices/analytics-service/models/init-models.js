var DataTypes = require("sequelize").DataTypes;
var _Users = require("./Users");
var _Events = require("./Events");

function initModels(sequelize) {
  var Users = _Users(sequelize, DataTypes);
  var Events = _Events(sequelize, DataTypes);

  return { Users, Events };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
