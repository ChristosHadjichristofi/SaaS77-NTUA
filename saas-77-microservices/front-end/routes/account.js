const express = require('express');

const accountController = require('../controllers/account');
const router = express.Router();

router.post('/signin', accountController.signIn);

router.post('/signup', accountController.signUp);

router.post('/signout', accountController.signOut);

module.exports = router;