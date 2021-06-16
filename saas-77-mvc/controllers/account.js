const bcrypt = require('bcryptjs');
const capitalize = require('../utils/capitalizeWords');
const { validationResult } = require('express-validator');

// require models
const sequelize = require("../utils/database");
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

exports.signIn = (req, res, next) => {

    /* Sign in has body of { email: email, password: password } */
    const email = req.body.email;
    const password = req.body.password;

    let loadedUser;

    // try to find registered user
    models.Users.findOne({ where: { email: email } })
    .then(user => {

        // if email does not exist then user is not registered, show message and redirect to landing
        if (!user) {
            req.flash('messages', {type: 'error', value: 'Please check again your username and password!'})
            return res.redirect('/');
        }

        // else the user exists so check if given password eq saved password in database
        loadedUser = user;
        bcrypt.compare(password, user.password).then(isEqual => {

            // if passwords are not equal then show error message and redirect to landing
            if (!isEqual) {
                req.flash('messages', {type: 'error', value: 'Please check again your username and password!'})
                return res.redirect('/');
            }
        
            // else passwords match and set session.authenticated to true and session.user to the user that logged in
            req.session.authenticated = true;
            req.session.user = {
                id: loadedUser.id,
                name: loadedUser.name,
                surname: loadedUser.surname,
                dateCreated: loadedUser.dateCreated,
                username: loadedUser.email  
            }

            // redirect to /home (because he is authed) and show success message
            req.flash('messages', {type: 'success', value: 'Welcome back!'})
            return res.redirect("/home");

        })
        // in case of any other error redirect to landing
        .catch(err => {
            res.redirect('/');
        })
    })
}

exports.signUp = (req, res, next) => {

    /*Sign up has body of { name: name, surname: surname, email: email, password: password, repeatedPassword: repeatedPassword } */
    const name = req.body.name;
    const surname = req.body.surname;
    const email = req.body.email;
    const password = req.body.password;
    const repeatedPassword = req.body.repassword;

    // use capitalize function to normalize the name and surname
    const nameCapitalized = capitalize(name);
    const surnameCapitalized = capitalize(surname);

    // check for validation errors
    const validationErrors = validationResult(req);
    if (validationErrors.errors.length > 0) {
        // if validation errors exist then flash them to user and return to landing
        validationErrors.errors.forEach(error => req.flash('messages', {type: 'error', value: `${error.msg}`}));
        return res.redirect('/');
    }

    // in case which passwords match then create the user (if user does not already exist)
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
                    
                    // successful sign up and return to landing
                    req.flash('messages', {type: 'success', value: 'Sign up successful!'})
                    return res.redirect("/");
                });
            }
            // if user exist then return to landing
            else return res.redirect("/");
        });
    }
    // if passwords do not match return to landing
    else return res.redirect("/");
};

exports.signOut = (req, res) => {

    // destroy user session on sign out
    req.session.destroy(err => {
        res.redirect('/');
    });
}
