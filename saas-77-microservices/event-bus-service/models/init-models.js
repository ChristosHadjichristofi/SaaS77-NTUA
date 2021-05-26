var DataTypes = require("sequelize").DataTypes;
var _Events = require("./Events");

function initModels(sequelize) {
  var Events = _Events(sequelize, DataTypes);

  return { Events };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
