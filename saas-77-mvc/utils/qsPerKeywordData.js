// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

module.exports = () => {

    return new Promise((resolve, reject) => {
        let topThreeKeywords, frequency = [], name = [];

        sequelize.query('SELECT COUNT("Questions"."id") as "counter", "Keywords"."name" '
        + 'AS "Keywords.name" FROM "saas-77-mvc"."Questions" AS "Questions" '
        + ' LEFT OUTER JOIN "saas-77-mvc"."Keywords" AS "Keywords" ON "Questions"."id" = "Keywords"."QuestionsId"'
        + ' GROUP BY "Keywords.name" ORDER BY "counter" DESC LIMIT 3', { type: sequelize.QueryTypes.SELECT })
        .then(result => {
            topThreeKeywords = result;
            return models.Questions.count({
                raw: true,
                include: [{  model: models.Keywords  }]
            })
        })
        .then(totalKeywords => {

            topThreeKeywords.forEach(el => {
                totalKeywords -= el.counter;
                frequency.push(el.counter);
                name.push(el['Keywords.name']);
            })

            frequency.push(totalKeywords.toString());
            name.push('Other');
            return resolve({ topThreeKeywords, name, frequency });

        })
    })
}