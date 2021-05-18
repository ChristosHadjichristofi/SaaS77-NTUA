var DataTypes = require("sequelize").DataTypes;
var _Questions = require("./Questions");
var _Keywords = require("./Keywords");

function initModels(sequelize) {
  var Questions = _Questions(sequelize, DataTypes);
  var Keywords = _Keywords(sequelize, DataTypes);

  Keywords.belongsTo(Questions, { foreignKey: "QuestionsId"});
  Questions.hasMany(Keywords, { foreignKey: "QuestionsId"});

  return {
    Keywords,
    Questions,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
