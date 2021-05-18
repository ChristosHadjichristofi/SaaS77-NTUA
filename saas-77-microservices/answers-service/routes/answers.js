const express = require('express');

const answersController = require('../controllers/answers');

const router = express.Router();

router.get('/question/:id', answersController.getQuestion);

router.post('/answer/:id', answersController.postAnswer);

module.exports = router;