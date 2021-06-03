const express = require('express');
const isAuth = require('../middlewares/authentication');
const layoutController = require('../controllers/layout');

const router = express.Router();

router.get('/', layoutController.getLanding);

router.get('/profile', isAuth, layoutController.getProfile);

router.get('/home', isAuth, layoutController.getHome);

router.get('/about', layoutController.getAbout);

router.get('/documentation', layoutController.getDocumentation);

router.get('/contact', layoutController.getContact);

module.exports = router;