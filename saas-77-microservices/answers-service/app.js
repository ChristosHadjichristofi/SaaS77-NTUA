const express = require('express');
const cors = require('cors');
const sequelize = require('./utils/database');
const decrypt = require('./utils/decrypt');

/* ROUTES and how to import routes */

const answers = require('./routes/answers');

/* end of ROUTES and how to import routes */

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/* middleware that checks if the requester has the secret key and is an allowed origin */
app.use((req, res, next) => {
    const customServicesHeader = req.header('custom-services-header');

    if (customServicesHeader !== undefined) 
        decrypt(JSON.parse(customServicesHeader)) === process.env.SECRET_STRING_SERVICES 
        ? next() : res.send(403).json({ message: 'Not allowed origin.', type: 'error' });
    
    else return res.status(403).json({ message: 'Not allowed origin.', type: 'error' });
});

// /* Routes used by our project */
app.use('/', answers);
// /*End of routes used by our project */

// In case of an endpoint does not exist must return 404 endpoint not found
app.use((req, res, next) => { res.status(404).json({message: 'Endpoint not found!'}); })

module.exports = app;