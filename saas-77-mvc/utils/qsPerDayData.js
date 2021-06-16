// require models
const sequelize = require('./database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

module.exports = () => {

    let dates = [], frequency = [];

    // query to fetch the 15 days that at least one question was posted in the system
    return new Promise((resolve, reject) => {
        sequelize.query('SELECT DATE("dateCreated") AS "date", COUNT(*) AS "count" '
        + 'FROM "saas-77-mvc"."Questions" AS "Questions" '
        + 'GROUP BY "date" ORDER BY "date" DESC LIMIT 17 ', { type: sequelize.QueryTypes.SELECT })
        .then(result => {

            let index = 0;
            const now = new Date(Date.now());
            // uncomment the following line when deploying and want to set the timezone difference
            // now.setHours(now.getHours() + 3); // because deployed app runs in different TZ
            const endDate = new Date();
            endDate.setDate(now.getDate() - 15)

            // iterating through the retrieved data and completing the days in the time interval [TODAY - 15 DAYS, TODAY]
            // in order to end up with this interval and how many questions where posted in each day
            if (result.length !== 0) {
                while (result[index].date.localeCompare(now.toISOString().split('T')[0]) == 1) index++
                for (var d = now; d.toISOString().split('T')[0] !== endDate.toISOString().split('T')[0]; d.setDate(d.getDate() - 1)) {
                    if (result[index] != null && result[index].date === d.toISOString().split('T')[0]) {
                        dates.push(result[index].date);
                        frequency.push(result[index].count);
                        index++;
                    } else {
                        dates.push(d.toISOString().split('T')[0]);
                        frequency.push(0);
                    }
                }
            }
            
            return resolve({ dates, frequency });
        })
        .catch(err => resolve({ dates, frequency }));
    })
}