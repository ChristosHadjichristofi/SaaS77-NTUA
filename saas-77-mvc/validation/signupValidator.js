// require models
const sequelize = require("../utils/database");
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const { body } = require('express-validator');

/**
 * Validating body
 * name: not empty, length between (3 - 30), only alpha
 * surname: not empty, length between (3 - 50), only alfa
 * email: not empty, email format, email not used
 * password: not empty, min length 6, matches repassword
 * repassword: not empty, is length 6 (no need to check if repassword also matches password)
 */
module.exports = [
    body('name')
        .not().isEmpty().withMessage('Name field is mandatory')
        .isLength({min: 3, max: 30}).withMessage('Name must be of length 5 and 30')
        .isAlpha().withMessage('Name must be only letters'),
    body('surname')
        .not().isEmpty().withMessage('Surname field is mandatory')
        .isLength({min: 3, max: 50}).withMessage('Surname must be of length 5 and 30')
        .isAlpha().withMessage('Surname must be only letters'),
    body('email')
        .not().isEmpty().withMessage('Email field is mandatory')
        .isEmail().withMessage('Email does not have a proper formation')
        .custom((value, { req }) => {
            return new Promise((resolve, reject) => {
               models.Users.findAll({ raw: true, where: { email: value } })
               .then(user => {
                   if (user.length !== 0) return reject();
                   else return resolve(); 
               });
            });
         }).withMessage('This email is already in use'),
    body('password')
        .not().isEmpty().withMessage('Password field is mandatory')
		.isLength({ min: 6 }).withMessage('Password must be at least 6 letters.')
        .not().matches('repassword').withMessage('Passwords must match.'),
    body('repassword')
        .not().isEmpty().withMessage('Confirm password field is mandatory')
        .isLength({ min: 6 }).withMessage('Confirm password must be at least 6 letters.')
];