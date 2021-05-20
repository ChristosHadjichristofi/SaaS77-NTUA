const express = require('express');

const answersController = require('../controllers/answers');
const isAuth = require('../middlewares/authentication')

const router = express.Router();

router.post('/question/:id', isAuth, answersController.getQuestion);

router.post('/answer/:id', isAuth, answersController.postAnswer);

router.post('/events', isAuth, answersController.events);

module.exports = router;