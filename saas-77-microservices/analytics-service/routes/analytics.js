const express = require('express');

const analyticsController = require('../controllers/analytics');
const isAuth = require('../middlewares/authentication')

const router = express.Router();

router.get('/analytics', isAuth, analyticsController);

module.exports = router;