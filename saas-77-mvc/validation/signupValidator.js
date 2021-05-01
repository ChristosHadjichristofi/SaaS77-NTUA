// require models
const sequelize = require("../utils/database");
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const { body } = require('express-validator');

module.exports = [
    body('name')
        .not().isEmpty().withMessage('Name field is mandatory')
        .isLength({min: 5, max: 30}).withMessage('Name must be of length 5 and 30')
        .isAlpha().withMessage('Name must be only letters'),
    body('surname')
        .not().isEmpty().withMessage('Surname field is mandatory')
        .isLength({min: 5, max: 50}).withMessage('Surname must be of length 5 and 30')
        .isAlpha().withMessage('Surname must be only letters'),
    body('email')
        .not().isEmpty().withMessage('Email field is mandatory')
        .isEmail().withMessage('Email does not have a proper formation')
        .custom((value, { req }) => {
            return new Promise((resolve, reject) => {
                console.log(value)
               models.Users.findAll({ raw: true, where: { email: value } })
               .then(user => {
                   if (user !== []) return reject(); else return resolve();
               });
            });
         }).withMessage('This email is already in use'),
    body('password')
        .not().isEmpty().withMessage('Password field is mandatory')
		.isLength({ min: 6 }).withMessage('Password must be at least 6 letters.')
        .matches('repassword').withMessage('Passwords must match.'),
    body('repassword')
        .not().isEmpty().withMessage('Confirm password field is mandatory')
        .isLength({ min: 6 }).withMessage('Confirm password must be at least 6 letters.')
];