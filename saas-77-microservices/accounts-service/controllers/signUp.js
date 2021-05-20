const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const capitalize = require('../utils/capitalizeWords');
const { validationResult } = require('express-validator');
const axios = require('axios');

// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

module.exports = (req, res, next) => {

    const name = req.body.name;
    const surname = req.body.surname;
    const password = req.body.password;
    const email = req.body.email;
    
    if (!name || !surname || !email || !password) return res.status(400).json({message: 'Some mandatory fields are missing!', type: 'error'});
    
    const nameCapitalized = capitalize(name);
    const surnameCapitalized = capitalize(surname);

    const validationErrors = validationResult(req);
    if (validationErrors.errors.length > 0) return res.status(400).json({ message: 'Validation Error!', errors: validationErrors.errors, type: 'error' });

    models.Users.findOne({ where: { email: email } })
    .then(user => {
        
        if (!user) {
            bcrypt.hash(password, 12).then(hashedPw => {
                return newUser = models.Users.create({
                    name: nameCapitalized,
                    surname: surnameCapitalized,
                    email: email,
                    dateCreated: Date.now(),
                    password: hashedPw
                })
            })
            .then(newUser => {
                const token = jwt.sign({
                    user: {
                        id: newUser.id,
                        name: newUser.name,
                        surname: newUser.surname,
                        dateCreated: newUser.dateCreated,
                        username: newUser.email
                    }}, process.env.SECRET_JWT, { expiresIn: '20s' }
                );

                const url = 'http://localhost:4006/events';
                const config = { method: 'post', url: url, headers: { 'X-OBSERVATORY-AUTH': token }, data: { type: 'USER CREATE', usersId: newUser.id } };
                
                axios(config)
                .then(result => { return res.status(201).json({ signup: 'true', message: 'Account created succesfully!', type: 'success'}) })
                .catch(err => { return res.status(500).json({ message: 'Internal server error.', type: 'error' }) })
                
            })
            .catch(err => {
                return res.status(500).json({message: 'Internal server error.', type: 'error'})
            });
        }
        else {
            return res.status(200).json({message: 'This email is already in use.', type: 'error'})
        }
    })
    .catch(err => {
        return res.status(500).json({message: 'Internal server error.', type: 'error'})
    });

}