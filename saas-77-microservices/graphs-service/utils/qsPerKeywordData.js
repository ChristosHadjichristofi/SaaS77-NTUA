// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
const Keywords = require('../models/Keywords');
var models = initModels(sequelize);
// end of require models

module.exports = () => {

    return new Promise((resolve, reject) => {
        let frequency = [], name = [];

        /* Query to find the top 5 keywords */
        sequelize.query('SELECT COUNT("Questions"."id") as "counter", "Keywords"."name" '
        + 'AS keywordname FROM "saas-77-graphs-service"."Questions" AS "Questions" '
        + ' LEFT OUTER JOIN "saas-77-graphs-service"."Keywords" AS "Keywords" ON "Questions"."id" = "Keywords"."QuestionsId"'
        + ' GROUP BY keywordname ORDER BY "counter" DESC LIMIT 5', { type: sequelize.QueryTypes.SELECT })
        .then(topFiveKeywords => {
                    
            /* Only top 5 */
            topFiveKeywords.forEach(({counter, keywordname}) => {
                name.push(keywordname);
                frequency.push(counter);
            });

            return resolve({ name, frequency });
            
        })
    })
}