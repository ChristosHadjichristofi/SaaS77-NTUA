// require models
const sequelize = require('./database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

module.exports = () => {

    let dates = [], frequency = [];

    return new Promise((resolve, reject) => {
        sequelize.query('SELECT DATE("dateCreated") AS "date", COUNT(*) AS "count" '
        + 'FROM "saas-77-mvc"."Questions" AS "Questions" '
        + 'GROUP BY "date" ORDER BY "date" DESC LIMIT 5 ', { type: sequelize.QueryTypes.SELECT })
        .then(result => {

            result.forEach(el => {
                dates.push(el.date)
                frequency.push(el.count)
            })

            return resolve({ dates, frequency });
        })
    })
}