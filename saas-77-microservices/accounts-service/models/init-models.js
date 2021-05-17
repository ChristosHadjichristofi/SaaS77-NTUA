var DataTypes = require("sequelize").DataTypes;
var _Users = require("./Users");
var _ExpiredTokens = require("./ExpiredTokens");

function initModels(sequelize) {
  var Users = _Users(sequelize, DataTypes);
  var ExpiredTokens = _ExpiredTokens(sequelize, DataTypes);

  return {
    Users,
    ExpiredTokens,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
