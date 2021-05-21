const express = require('express');

const browseQuestionsController = require('../controllers/browseQuestions');
const isAuth = require('../middlewares/authentication')

const router = express.Router();

router.post('/show', isAuth, browseQuestionsController.show);

router.post('/events', isAuth, browseQuestionsController.events);

router.get('/questions/user/:id', isAuth, browseQuestionsController.getUserQuestions);

module.exports = router;