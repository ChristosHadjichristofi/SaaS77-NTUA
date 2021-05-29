var DataTypes = require("sequelize").DataTypes;
var _Questions = require("./Questions");
var _Keywords = require("./Keywords");
var _Events = require("./Events");

function initModels(sequelize) {
  var Questions = _Questions(sequelize, DataTypes);
  var Keywords = _Keywords(sequelize, DataTypes);
  var Events = _Events(sequelize, DataTypes);

  Keywords.belongsTo(Questions, { foreignKey: "QuestionsId"});
  Questions.hasMany(Keywords, { foreignKey: "QuestionsId"});

  return {
    Keywords,
    Questions,
    Events
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
