const express = require('express');

const accountController = require('../controllers/account');
const signupValidator = require('../validation/signupValidator');
const router = express.Router();

router.post('/signin', accountController.signIn);

router.post('/signup', signupValidator, accountController.signUp);

router.post('/signout', accountController.signOut);

module.exports = router;