// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
const Keywords = require('../models/Keywords');
var models = initModels(sequelize);
// end of require models

module.exports = () => {

    return new Promise((resolve, reject) => {
        let topThreeKeywords, totalKeywords, noKeyword, frequency = [], name = [];

        /* Query to find the top 3 keywords */
        sequelize.query('SELECT COUNT("Questions"."id") as "counter", "Keywords"."name" '
        + 'AS keywordname FROM "saas-77-mvc"."Questions" AS "Questions" '
        + ' LEFT OUTER JOIN "saas-77-mvc"."Keywords" AS "Keywords" ON "Questions"."id" = "Keywords"."QuestionsId"'
        + ' GROUP BY keywordname ORDER BY "counter" DESC LIMIT 3', { type: sequelize.QueryTypes.SELECT })
        .then(queryResult => {
            
            /* save top three keywords */
            topThreeKeywords = queryResult;
            
            /* Query to find total Keywords */
            return models.Keywords.count({
                raw: true
            })
        })
        .then(queryResult => {

            /* Save total keywords */
            totalKeywords = queryResult;

            /* Query to find how many questions have no keyword */
            return sequelize.query('SELECT COUNT("Questions"."id") as cnt, "Keywords"."name" AS name '
            + 'FROM "saas-77-mvc"."Questions" AS "Questions" '
            + 'LEFT OUTER JOIN "saas-77-mvc"."Keywords" AS "Keywords" ON "Questions"."id" = "Keywords"."QuestionsId" '
            + 'WHERE "Keywords"."name" IS NULL GROUP BY "Keywords"."name"', { type: sequelize.QueryTypes.SELECT })

        })
        .then(queryResult => {

            /* Save number of questions with no keyword */
            noKeyword = queryResult;

            /* Calculate sum of top three keywords counter */
            let sumTopThree = topThreeKeywords.reduce((accumulator, currentValue) => accumulator + +currentValue.counter, 0)

            /* for every entry in topThreeKeywords push them into name and frequency respectively */
            topThreeKeywords.forEach(({counter, keywordname}) => {
                name.push(keywordname);
                frequency.push(counter);
            });

            /* if other keywords exist */
            if ((totalKeywords - sumTopThree) > 0) {
                name.push('Other');
                frequency.push(totalKeywords - sumTopThree);
            }

            /* if questions with no keywords exist */
            if (+noKeyword[0].cnt > 0) {
                name.push('No Keyword');
                frequency.push(+noKeyword[0].cnt);
            }

            return resolve({ topThreeKeywords, name, frequency });

        })
    })
}