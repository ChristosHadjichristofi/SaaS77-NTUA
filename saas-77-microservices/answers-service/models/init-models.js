var DataTypes = require("sequelize").DataTypes;
var _Questions = require("./Questions");
var _Answers = require("./Answers");
var _Events = require("./Events");

function initModels(sequelize) {
  var Questions = _Questions(sequelize, DataTypes);
  var Answers = _Answers(sequelize, DataTypes);
  var Events = _Events(sequelize, DataTypes);

  Answers.belongsTo(Questions, { foreignKey: "QuestionsId"});
  Questions.hasMany(Answers, { foreignKey: "QuestionsId"});

  return {
    Answers,
    Questions,
    Events
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
