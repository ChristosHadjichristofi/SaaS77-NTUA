const app = require("./app");
const encrypt = require('./utils/encrypt');
const jwt = require('jsonwebtoken');

const chalk = require("chalk");
const axios = require('axios');

const insertEvents = require('./utils/insertEvents');

// for database
const sequelize = require('./utils/database');
var initModels = require("./models/init-models");
var models = initModels(sequelize);

const port = Number(4002);

initModels(sequelize);
sequelize
    .sync({
        // delete if system is ready to deploy
        force: true,
        // end
    })
    .then((result) => {
        app.listen(port, () => {
            console.log(chalk.green(`🚀 Answers Service running on port ${port}!`));
        });
        
        let counter;

        let retrieveEventsPromise = new Promise((resolve, reject) => {
            models.Events.findAll({ raw: true, where: { id : 1 } })
            .then(rows => {
                if (rows.length == 0) models.Events.create({ counter: 0 })
                else counter = rows[0].counter;

                resolve();
            })
        })

        Promise.all([retrieveEventsPromise]).then(() => {

            if (counter === undefined) counter = 0;

            const url = 'http://localhost:4006/events/' + counter;

            const token = jwt.sign({ service: 'Answers Service' }, process.env.SECRET_JWT, { expiresIn: '20s' });

            const headers = {
                'X-OBSERVATORY-AUTH': token,
                "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES))
            };
            
            const config = { method: 'get', url: url, headers: headers };
            
            axios(config)
            .then(result => {
                if (result.data.events.length !== 0) insertEvents(result.data.events);
            })
            .catch(err => { 
                if (err.code === 'ECONNREFUSED') console.log('Event Bus is not running.');
                else console.log(err);  
            })

        })

    })
    .catch((err) => console.log(err));