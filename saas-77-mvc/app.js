const express = require('express');
const bodyParser = require('body-parser');

/* ROUTES and how to import routes */
// const account = require('./routes/account');
// const landing = require('./routes/landing');
/* end of ROUTES and how to import routes */

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// /* Routes used by our project */
// app.use('/', landing)
// app.use('/account', account)
// /*End of routes used by our project */

// In case of an endpoint does not exist must return 404.html

module.exports = app;