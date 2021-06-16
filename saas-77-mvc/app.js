const express = require('express');
const path = require('path');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const sequelize = require('./utils/database');
const flash = require('connect-flash')

/* ROUTES and how to import routes */

const layout = require('./routes/layout');
const account = require('./routes/account');
const question = require('./routes/question');

/* end of ROUTES and how to import routes */

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(flash());

// using sessions, storing them in Sessions Table
// using env variable for SECRET_SESSION_STRING
app.use(session({
    secret: process.env.SECRET_SESSION_STRING,
    resave: false,
    saveUninitialized: false,
    store: new SequelizeStore({
        db: sequelize,
        table: 'Sessions',
    }),
}));

app.use((req, res, next) => {
    res.locals.authenticated = req.session.authenticated;
    res.locals.user = req.session.user;
    next();
});

// /* Routes used by our project */
app.use('/', layout);
app.use('/account', account);
app.use('/questions', question);
// /*End of routes used by our project */

// download route that downloads a file that is given as query param
// in case this file does not exist, it redirects the user to landing or home (if not auth to landing if auth to home)
app.get('/download', (req, res) => {

    const file = __dirname + '/public/download/' + req.query.filename;

    res.download(file, err => {
        if (err)(!req.session.authenticated) ? res.redirect('/') : res.redirect('/home')
    });

});

// In case of an endpoint does not exist must return 404.html
app.use((req, res, next) => { res.status(404).render('404.ejs', { pageTitle: '404' }) })

module.exports = app;