const app = require("./app");
const encrypt = require('./utils/encrypt');
const jwt = require('jsonwebtoken');

const chalk = require("chalk");
const axios = require('axios');

const insertEvents = require('./utils/insertEvents');

// for database
const sequelize = require("./utils/database");
var initModels = require("./models/init-models");
var models = initModels(sequelize);

const port = Number(4003);

initModels(sequelize);
sequelize
    .sync({
        // delete if system is ready to deploy
        force: true,
        // end
    })
    .then((result) => {
        app.listen(port, () => {
            console.log(chalk.green(`🚀 Browse Questions Service running on port ${port}!`));
        });

        let counter;

        /* retrieve how many events this specific service parsed and processed */
        let retrieveEventsPromise = new Promise((resolve, reject) => {
            models.Events.findAll({ raw: true, where: { id : 1 } })
            .then(rows => {
                /* if no rows returned then processed 0 events, create the row with id = 1 and counter = 0 */
                if (rows.length == 0) models.Events.create({ counter: 0 })
                else counter = rows[0].counter;

                resolve();
            })
        })

        /* after retrieving the events counter make a request to the bus to learn about all the events that have id gt counter */
        Promise.all([retrieveEventsPromise]).then(() => {

            if (counter === undefined) counter = 0;

            /* endpoint to get lost events */
            const url = 'http://localhost:4006/events/' + counter;

            /* construct token so as the service can make req to the bus */
            const token = jwt.sign({ service: 'Browse Questions Service' }, process.env.SECRET_JWT, { expiresIn: '20s' });

            /* add token and secret string that services share (allowed origin) */
            const headers = {
                'X-OBSERVATORY-AUTH': token,
                "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES))
            };
            
            /* make the request and get all data */
            const config = { method: 'get', url: url, headers: headers };
            
            axios(config)
            .then(result => {
                /* if result has length != 0 then insert events to the database asynchronously */
                if (result.data.events.length !== 0) insertEvents(result.data.events);
            })
            .catch(err => { 
                if (err.code === 'ECONNREFUSED') console.log('Event Bus is not running.');
                else console.log(err);
            })

        })

    })
    .catch((err) => console.log(err));