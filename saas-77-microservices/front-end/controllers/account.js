const axios = require('axios');
const encrypt = require('../utils/encrypt');

exports.signIn = (req, res, next) => {

    /* Get body from request {email: email, password: password} */
    const email = req.body.email;
    const password = req.body.password;

    /* Construct URL of accounts service */
    const url_accountService = 'http://localhost:4000/signin';

    /* Add necessary headers */
    const headers = { "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) };

    /* Add email and password to data object */
    const data = {
        email: email,
        password: password
    };

    /* Create the config and make the request */
    const config_accountService = { method: 'post', url: url_accountService, headers: headers, data: data };

    axios(config_accountService)
    /* In case of result status < 400 */
    .then(result => {
        /* flash the necessary messages that were retrieved from the service */
        req.flash('messages', { type: result.data.type, value: result.data.message })
        
        /* 
            In case of successful sign in add to session the authenticated to true and the user with jwt so as 
            its payload can be used when needed and redirect to Home
        */
        if (result.data.message === 'Welcome back!' && result.data.type === 'success') {
            
            req.session.authenticated = true;
            req.session.user = {
                jwtToken: result.data.token 
            };

            return res.redirect('/home');
        }
        /* Wrong credentials - redirect to landing */
        else return res.redirect('/');

    })
    /* In case that Service is Unavailable (or result status > 400) */
    .catch(err => {
        if (err.code === 'ECONNREFUSED') {
            req.flash('messages', {type: 'error', value: 'The service is down. Please try again later.'})
            return res.redirect('/');
        }

        /* flash necessary messages and redirect to landing */
        req.flash('messages', { type: err.response.data.type, value: err.response.data.message })
        return res.redirect('/');

    });
}

exports.signUp = (req, res, next) => {

    /* Get necessary body from request */
    const name = req.body.name;
    const surname = req.body.surname;
    const email = req.body.email;
    const password = req.body.password;
    const repassword = req.body.repassword;

    /* Construct URL of accounts service */
    const url_accountService = 'http://localhost:4000/signup';

    /* Add necessary headers */
    const headers = { "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) };

    /* Add name, surname, email, password and repeatedPassword to data object that will be sent to the accounts service */
    const data = {
        name: name,
        surname: surname,
        email: email,
        password: password,
        repassword: repassword
    };

    /* Create the config and make the request */
    const config_accountService = { method: 'post', url: url_accountService, headers: headers, data: data };

    axios(config_accountService)
    /* In case of result status < 400 */
    .then(result => { 
        /* flash the necessary messages that were retrieved from the service and redirect to landing*/
        req.flash('messages', { type: result.data.type, value: result.data.message })
        return res.redirect('/');

    })
    /* In case that Service is Unavailable (or result status > 400) */
    .catch(err => {
        
        /* If service unavailable */
        if (err.code === 'ECONNREFUSED') {
            req.flash('messages', {type: 'error', value: 'The service is down. Please try again later.'})
            return res.redirect('/');
        }

        /* If the user entered wrong data (validation errors) */
        if (err.response.data.errors.length > 0) {
            err.response.data.errors.forEach(error => req.flash('messages', {type: err.response.data.type, value: `${error.msg}`}));
            return res.redirect('/');
        }
        
        /* flash all messages of validation (or any other error) and redirect to landing */
        req.flash('messages', { type: err.response.data.type, value: err.response.data.message })
        return res.redirect('/');

    });
};

exports.signOut = (req, res) => {
    
    /* destroy session when user logs out */
    req.session.destroy(err => {
        res.redirect('/');
    });
}
