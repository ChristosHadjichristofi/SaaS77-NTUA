var DataTypes = require("sequelize").DataTypes;
var _Questions = require("./Questions");
var _Answers = require("./Answers");

function initModels(sequelize) {
  var Questions = _Questions(sequelize, DataTypes);
  var Answers = _Answers(sequelize, DataTypes);

  Answers.belongsTo(Questions, { foreignKey: "QuestionsId"});
  Questions.hasMany(Answers, { foreignKey: "QuestionsId"});

  return {
    Answers,
    Questions,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
