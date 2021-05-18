var DataTypes = require("sequelize").DataTypes;
var _Questions = require("./Questions");

function initModels(sequelize) {
  var Questions = _Questions(sequelize, DataTypes);

  return { Questions };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
