const bcrypt = require('bcryptjs');
const capitalize = require('../utils/capitalizeWords');
const { validationResult } = require('express-validator');

// require models
const sequelize = require("../utils/database");
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

exports.signIn = (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;

    models.Users.findOne({ where: { email: email } })
    .then(user => {
        if (!user) {
            req.flash('messages', {type: 'error', value: 'Please check again your username and password!'})
            return res.redirect('/');
        }

        loadedUser = user;
        bcrypt.compare(password, user.password).then(isEqual => {

            if (!isEqual) {
                req.flash('messages', {type: 'error', value: 'Please check again your username and password!'})
                return res.redirect('/');
            }
        
            req.session.authenticated = true;
            req.session.user = {
                id: loadedUser.id,
                name: loadedUser.name,
                surname: loadedUser.surname,
                dateCreated: loadedUser.dateCreated,
                username: loadedUser.email  
            }
            req.flash('messages', {type: 'success', value: 'Welcome back!'})
            return res.redirect("/home");

        })
        .catch(err => {
            res.redirect('/')
        })
    })
}

exports.signUp = (req, res, next) => {

    const name = req.body.name;
    const surname = req.body.surname;
    const email = req.body.email;
    const password = req.body.password;
    const repeatedPassword = req.body.repassword;

    const nameCapitalized = capitalize(name);
    const surnameCapitalized = capitalize(surname);

    const validationErrors = validationResult(req);
    if (validationErrors.errors.length > 0) {
        validationErrors.errors.forEach(error => req.flash('messages', {type: 'error', value: `${error.msg}`}));
        return res.redirect('/');
    }

    if (password === repeatedPassword) {
        models.Users.findOne({ where: { email: email } }).then((user) => {
            if (!user) {
                bcrypt.hash(password, 12).then((hashedPW) => {
                    const newUser = models.Users.create({
                        name: nameCapitalized,
                        surname: surnameCapitalized,
                        email: email,
                        password: hashedPW,
                        dateCreated: Date.now()
                    });
                    req.flash('messages', {type: 'success', value: 'Sign up successful!'})
                    return res.redirect("/");
                });
            }
            else return res.redirect("/");
        });
    } 
    else return res.redirect("/");
};

exports.signOut = (req, res) => {
    req.session.destroy(err => {
        res.redirect('/');
    });
}
