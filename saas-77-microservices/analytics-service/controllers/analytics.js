const jwt_decode = require('jwt-decode');

// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const calcDays = require('../utils/calcDays');

exports.stats = (req, res, next) => {

    let totalQuestions, totalAnswers, daysRegistered, contributions;

    const userData = jwt_decode(req.header('X-OBSERVATORY-AUTH'));

    let analyticsPromise = new Promise((resolve, reject) => {
        models.Users.findAll({ raw: true, where: { id: userData.user.id } })
        .then(row => {
            totalQuestions = row[0].questions;
            totalAnswers = row[0].answers;
            resolve();
        })
        .catch(err => { return res.status(500).json({ message: 'Internal server error', type: 'error' }); })
    })

    Promise.all([analyticsPromise]).then(() => {
        
        daysRegistered = calcDays(Date.now(), new Date(userData.user.dateCreated));
        
        contributions = totalAnswers / daysRegistered;

        return res.status(200).json({
            totalQuestions: totalQuestions,
            totalAnswers: totalAnswers,
            daysRegistered: daysRegistered,
            contributions: contributions.toFixed(2),
        })

    })
    .catch(err => { return res.status(500).json({ message: 'Internal server error', type: 'error' }); })

}

exports.events = (req, res, next) => {

    const type = req.body.type;

    models.Events.increment('counter', { by: 1, where: { id: 1 } })
    .then(() => {
        
        if (type === 'QUESTION CREATE') {
    
            models.Users.increment('questions', { by: 1, where: { id: req.body.usersId } })
            .then(() => res.status(200).json({}))
            .catch(() => res.status(500).json({ message: 'Internal server error', type: 'error' }))
    
        } else if (type === 'ANSWER CREATE') {
    
            models.Users.increment('answers', { by: 1, where: { id: req.body.usersId } })
            .then(() => res.status(200).json({}))
            .catch(() => res.status(500).json({ message: 'Internal server error', type: 'error' }))
    
        } else if (type === 'USER CREATE') {
    
            models.Users.create({ id: req.body.usersId, questions: 0, answers: 0 })
            .then(() => res.status(200).json({}))
            .catch(() => res.status(500).json({ message: 'Internal server error', type: 'error' }))
    
        } else {
            res.status(200).json({});
        }
    
    })
    .catch(() => res.status(500).json({ message: 'Internal server error', type: 'error' }))

}

exports.status = (req, res, next) => {

    sequelize.authenticate()
    .then(() => res.status(200).json({ service: 'Analytics', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - OK' }))
    .catch(err => res.status(200).json({ service: 'Analytics', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - FAILED' }))

}