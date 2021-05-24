const axios = require('axios');
const encrypt = require('../utils/encrypt');

exports.signIn = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    const url_accountService = 'http://localhost:4000/signin';

    const headers = { "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) };

    const data = {
        email: email,
        password: password
    };

    const config_accountService = { method: 'post', url: url_accountService, headers: headers, data: data };

    axios(config_accountService)
    .then(result => {
        req.flash('messages', { type: result.data.type, value: result.data.message })
        
        if (result.data.message === 'Welcome back!' && result.data.type === 'success') {
            
            req.session.authenticated = true;
            req.session.user = {
                jwtToken: result.data.token 
            };

            return res.redirect('/home');
        }
        else return res.redirect('/');

    })
    .catch(err => {
        if (err.code === 'ECONNREFUSED') {
            req.flash('messages', {type: 'error', value: 'The service is down. Please try again later.'})
            return res.redirect('/');
        }

        req.flash('messages', { type: err.response.data.type, value: err.response.data.message })
        return res.redirect('/');

    });
}

exports.signUp = (req, res, next) => {

    const name = req.body.name;
    const surname = req.body.surname;
    const email = req.body.email;
    const password = req.body.password;
    const repassword = req.body.repassword;

    const url_accountService = 'http://localhost:4000/signup';

    const headers = { "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) };

    const data = {
        name: name,
        surname: surname,
        email: email,
        password: password,
        repassword: repassword
    };

    const config_accountService = { method: 'post', url: url_accountService, headers: headers, data: data };

    axios(config_accountService)
    .then(result => { 
        req.flash('messages', { type: result.data.type, value: result.data.message })
        return res.redirect('/');

    })
    .catch(err => {
        
        if (err.code === 'ECONNREFUSED') {
            req.flash('messages', {type: 'error', value: 'The service is down. Please try again later.'})
            return res.redirect('/');
        }

        if (err.response.data.errors.length > 0) {
            err.response.data.errors.forEach(error => req.flash('messages', {type: err.response.data.type, value: `${error.msg}`}));
            return res.redirect('/');
        }
        
        req.flash('messages', { type: err.response.data.type, value: err.response.data.message })
        return res.redirect('/');

    });
};

exports.signOut = (req, res) => {
    req.session.destroy(err => {
        res.redirect('/');
    });
}
