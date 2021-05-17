const express = require('express');
const cors = require('cors');
const sequelize = require('./utils/database');

/* ROUTES and how to import routes */

const account = require('./routes/account');

/* end of ROUTES and how to import routes */

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// /* Routes used by our project */
app.use('/', account);
// /*End of routes used by our project */

// In case of an endpoint does not exist must return 404 endpoint not found
app.use((req, res, next) => { res.status(404).json({message: 'Endpoint not found!'}); })

module.exports = app;