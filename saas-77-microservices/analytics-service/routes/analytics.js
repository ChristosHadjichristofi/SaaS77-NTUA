const express = require('express');

const analyticsController = require('../controllers/analytics');
const isAuth = require('../middlewares/authentication')

const router = express.Router();

router.get('/analytics', isAuth, analyticsController.stats);

router.post('/events', isAuth, analyticsController.events);

router.get('/status', analyticsController.status);

module.exports = router;