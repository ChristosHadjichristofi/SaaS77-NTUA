const sequelize = require('../database');
var initModels = require("../../models/init-models");
var models = initModels(sequelize);
const data_importer = require('./data-importer');

function populate() {

    data_importer("./data/users.csv", models.Users, true)
        .then(() => {
            return data_importer("./data/questions.csv", models.Questions, false)
        })
        .then(() => {
            return data_importer("./data/keywords.csv", models.Keywords, false)
        })
        .then(() => {
            return data_importer("./data/answers.csv", models.Answers, false)
        })
}

module.exports = populate;