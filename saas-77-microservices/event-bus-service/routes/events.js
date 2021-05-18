const express = require('express');

const eventController = require('../controllers/events');
const isAuth = require('../middlewares/authentication')

const router = express.Router();

router.post('/events', isAuth, eventController);

module.exports = router;