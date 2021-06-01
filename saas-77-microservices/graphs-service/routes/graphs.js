const express = require('express');

const isAuth = require('../middlewares/authentication')
const graphsController = require('../controllers/graphs');

const router = express.Router();

router.get('/topkeywords', graphsController.topKeywords);

router.get('/qsperday', graphsController.QsPerDay);

router.post('/events', isAuth, graphsController.events);

router.get('/status', graphsController.status);

module.exports = router;