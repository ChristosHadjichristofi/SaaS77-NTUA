const express = require('express');

const browseQuestionsController = require('../controllers/browseQuestions');
const isAuth = require('../middlewares/authentication')

const router = express.Router();

router.post('/show', isAuth, browseQuestionsController.show);

router.post('/events', isAuth, browseQuestionsController.events);

module.exports = router;