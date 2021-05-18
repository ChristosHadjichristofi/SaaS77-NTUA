const express = require('express');

const eventController = require('../controllers/events');
const router = express.Router();

router.post('/events', eventController);

module.exports = router;