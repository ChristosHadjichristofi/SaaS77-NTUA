const express = require('express');

const createQuestionController = require('../controllers/createQuestion');
const router = express.Router();

router.post('/create', createQuestionController);

module.exports = router;