const express = require('express');

const graphsController = require('../controllers/graphs');

const router = express.Router();

router.get('/topkeywords', graphsController.topKeywords);

router.get('/qsperday', graphsController.QsPerDay);

module.exports = router;