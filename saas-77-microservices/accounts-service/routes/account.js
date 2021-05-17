const express = require('express');

const signInController = require('../controllers/signIn');
const signUpController = require('../controllers/signUp');
const signOutController = require('../controllers/signOut');
const signupValidator = require('../validation/signupValidator');
const router = express.Router();

router.post('/signin', signInController);

router.post('/signup', signupValidator, signUpController);

module.exports = router;