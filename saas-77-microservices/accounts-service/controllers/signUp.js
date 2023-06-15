const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const capitalize = require('../utils/capitalizeWords');
const { validationResult } = require('express-validator');
const axios = require('axios');

const encrypt = require('../utils/encrypt');

// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

module.exports = (req, res, next) => {

    /*Sign up has body of { name: name, surname: surname, email: email, password: password, repeatedPassword: repeatedPassword } */
    const name = req.body.name;
    const surname = req.body.surname;
    const password = req.body.password;
    const email = req.body.email;
    
    /* if any of the above are not set then return bad request and respective message */
    if (!name || !surname || !email || !password) return res.status(400).json({message: 'Some mandatory fields are missing!', type: 'error'});
    
    /* capitalize name (normalize the name) */
    const nameCapitalized = capitalize(name);
    const surnameCapitalized = capitalize(surname);

    /* check for any validation errors */
    const validationErrors = validationResult(req);
    /* if validation errors exist, return bad request, the error object and respective message */
    if (validationErrors.errors.length > 0) return res.status(400).json({ message: 'Validation Error!', errors: validationErrors.errors, type: 'error' });

    /* else try to find if user with email eq to email exists in the system */
    models.Users.findOne({ where: { email: email } })
    .then(user => {
        
        /* if not exists, then proceed to signing the user up */
        if (!user) {
            /* hash the password that the user gave */
            bcrypt.hash(password, 12).then(hashedPw => {

                /* return promise that user is created with all fields needed */
                return newUser = models.Users.create({
                    name: nameCapitalized,
                    surname: surnameCapitalized,
                    email: email,
                    dateCreated: Date.now(),
                    password: hashedPw
                })
            })
            .then(newUser => {
                
                /* after the user was signed up construct a jwt so as this service can make a request to the bus,
                   so as the bus notifies all subs that a new user is signed up and each subscriber uses this info
                   if he wants to
                */
                const token = jwt.sign({
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        surname: newUser.surname,
                        dateCreated: newUser.dateCreated,
                        username: newUser.email
                    }}, process.env.SECRET_JWT, { expiresIn: '20s' }
                );

                /* bus url and request headers */
                const url = `http://${process.env.BASE_URL}:4006/events`;

                const headers = { 
                    "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)),
                    'X-OBSERVATORY-AUTH': token
                };
                
                /* use axios to make the request ( axios uses this config ) */
                const config = { method: 'post', url: url, headers: headers, data: { type: 'USER CREATE', usersId: newUser.id } };
                
                axios(config)
                /* if the result status is < 400 then user is created, return Created and respective message */
                .then(result => { return res.status(201).json({ signup: 'true', message: 'Account created succesfully!', type: 'success'}) })
                /* something went wrong requesting to the bus */
                .catch(err => { return res.status(500).json({ message: 'Internal server error.', type: 'error' }) })
                
            })
            /* something went wrong hashing the password */
            .catch(err => {
                return res.status(500).json({message: 'Internal server error.', type: 'error'})
            });
        }
        /* user exists */
        else {
            return res.status(200).json({message: 'This email is already in use.', type: 'error'})
        }
    })
    /* error connecting to database or something went wrong */
    .catch(err => {
        return res.status(500).json({message: 'Internal server error.', type: 'error'})
    });

}