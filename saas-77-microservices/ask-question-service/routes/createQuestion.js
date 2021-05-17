const express = require('express');

const createQuestionController = require('../controllers/createQuestion');
const isAuth = require('../middlewares/authentication')

const router = express.Router();

router.post('/create', isAuth, createQuestionController);

module.exports = router;