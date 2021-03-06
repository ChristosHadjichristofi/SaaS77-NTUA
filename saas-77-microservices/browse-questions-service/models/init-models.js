var DataTypes = require("sequelize").DataTypes;
var _Questions = require("./Questions");
var _Events = require("./Events");

function initModels(sequelize) {
  var Questions = _Questions(sequelize, DataTypes);
  var Events = _Events(sequelize, DataTypes);

  return { Questions, Events };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
