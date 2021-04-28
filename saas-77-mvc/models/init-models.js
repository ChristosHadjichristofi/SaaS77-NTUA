var DataTypes = require("sequelize").DataTypes;
var _Users = require("./Users");
var _Questions = require("./Questions");
var _Answers = require("./Answers");
var _Keywords = require("./Keywords");
var _Sessions = require("./Sessions");

function initModels(sequelize) {
  var Users = _Users(sequelize, DataTypes);
  var Questions = _Questions(sequelize, DataTypes);
  var Answers = _Answers(sequelize, DataTypes);
  var Keywords = _Keywords(sequelize, DataTypes);
  var Sessions = _Sessions(sequelize, DataTypes);

  Answers.belongsTo(Questions, { foreignKey: "QuestionsId"});
  Questions.hasMany(Answers, { foreignKey: "QuestionsId"});
  Answers.belongsTo(Users, { foreignKey: "UsersId"});
  Users.hasMany(Answers, { foreignKey: "UsersId"});
  Keywords.belongsTo(Questions, { foreignKey: "QuestionsId"});
  Questions.hasMany(Keywords, { foreignKey: "QuestionsId"});
  Questions.belongsTo(Users, { foreignKey: "UsersId"});
  Users.hasMany(Questions, { foreignKey: "UsersId"});

  return {
    Answers,
    Keywords,
    Questions,
    Sessions,
    Users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
