const express = require('express');
const isAuth = require('../middlewares/authentication');
const layoutController = require('../controllers/layout');

const router = express.Router();

router.get('/', layoutController.getLanding);

router.get('/profile', isAuth, layoutController.getProfile);

router.get('/home', isAuth, layoutController.getHome);

router.get('/about', layoutController.getAbout);

module.exports = router;