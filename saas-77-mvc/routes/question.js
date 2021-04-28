const express = require('express');
const isAuth = require('../middlewares/authentication');

const questionController = require('../controllers/question');

const router = express.Router();

router.post('/create', isAuth, questionController.createQuestion);

router.get('/show', isAuth, questionController.browseQuestions);

router.get('/:id', isAuth, questionController.browseQuestion);

// router.get('/fetch', questionController.getQuestions);

module.exports = router;