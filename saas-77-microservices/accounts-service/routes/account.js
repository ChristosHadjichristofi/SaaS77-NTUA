const express = require('express');

const signInController = require('../controllers/signIn');
const signUpController = require('../controllers/signUp');
const statusController = require('../controllers/status');
const signupValidator = require('../validation/signupValidator');
const router = express.Router();

router.post('/signin', signInController);

router.post('/signup', signupValidator, signUpController);

router.get('/status', statusController);

module.exports = router;