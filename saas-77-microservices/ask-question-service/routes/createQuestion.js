const express = require('express');

const createQuestionController = require('../controllers/createQuestion');
const statusController = require('../controllers/status');
const isAuth = require('../middlewares/authentication');

const router = express.Router();

router.post('/create', isAuth, createQuestionController);

router.get('/status', statusController);

module.exports = router;