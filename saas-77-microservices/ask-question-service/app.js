const express = require('express');
const cors = require('cors');
const originAuth = require('./middlewares/originAuthentication');

/* ROUTES and how to import routes */

const createQuestion = require('./routes/createQuestion');

/* end of ROUTES and how to import routes */

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

/* middleware that checks if the requester has the secret key and is an allowed origin */
app.use(originAuth);

// /* Routes used by our project */
app.use('/', createQuestion);
// /*End of routes used by our project */

// In case of an endpoint does not exist must return 404 endpoint not found
app.use((req, res, next) => { res.status(404).json({message: 'Endpoint not found!'}); })

module.exports = app;