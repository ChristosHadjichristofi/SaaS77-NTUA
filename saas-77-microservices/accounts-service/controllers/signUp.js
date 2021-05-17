const bcrypt = require('bcryptjs');
const capitalize = require('../utils/capitalizeWords');

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
    
    if (!name || !surname || !email || !password) return res.status(400).json({message: 'Some mandatory fields are missing!'});
    
    const nameCapitalized = capitalize(name);
    const surnameCapitalized = capitalize(surname);

    models.Users.findOne({ where: { email: email } })
    .then(user => {
        if (!user) {
            bcrypt.hash(password, 12).then(hashedPw => {
                const newUser = models.Users.create({
                    name: nameCapitalized,
                    surname: surnameCapitalized,
                    email: email,
                    dateCreated: Date.now(),
                    password: hashedPw
                });
                res.status(201).json({signup: 'true', message: 'Account created succesfully!'});
            })
            .catch(err => {
                return res.status(500).json({message: 'Internal server error.'})
            });
        }
        else {
            return res.status(200).json({message: 'This email is already in use.'})
        }
    })
    .catch(err => {
        return res.status(500).json({message: 'Internal server error.'})
    });

}