// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
const Keywords = require('../models/Keywords');
var models = initModels(sequelize);
// end of require models

module.exports = () => {

    return new Promise((resolve, reject) => {
        let frequency = [], name = [];

        /* Query to find the top 3 keywords */
        sequelize.query('SELECT COUNT("Questions"."id") as "counter", "Keywords"."name" '
        + 'AS keywordname FROM "saas-77-mvc"."Questions" AS "Questions" '
        + ' LEFT OUTER JOIN "saas-77-mvc"."Keywords" AS "Keywords" ON "Questions"."id" = "Keywords"."QuestionsId"'
        + ' GROUP BY keywordname ORDER BY "counter" DESC LIMIT 5', { type: sequelize.QueryTypes.SELECT })
        .then(topFiveKeywords => {
                    
            /* Only top 3 */
            topFiveKeywords.forEach(({counter, keywordname}) => {
                keywordname ? name.push(keywordname) : name.push('No Keyword');
                frequency.push(counter);
            });

            return resolve({ name, frequency });
            
        })
        .catch(err => resolve({ dates, frequency }));
    })
}