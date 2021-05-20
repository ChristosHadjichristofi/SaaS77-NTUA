const jwt_decode = require('jwt-decode');

// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const calcDays = require('../utils/calcDays');

exports.stats = (req, res, next) => {

    let totalQuestions, totalAnswers, contributions;

    const userData = jwt_decode(req.header('X-OBSERVATORY-AUTH'));

    let analyticsPromise = new Promise((resolve, reject) => {
        models.Users.findAll({ raw: true, where: { id: userData.user.id } })
            .then(row => {
                totalQuestions = row[0].questions.length;
                totalAnswers = row[0].answers.length;
                resolve();
            })
    })

    Promise.all([analyticsPromise]).then(() => {

        contributions = totalAnswers / calcDays(Date.now(), new Date(userData.user.dateCreated));

        return res.status(200).json({
            totalQuestions: totalQuestions,
            totalAnswers: totalAnswers,
            contributions: contributions.toFixed(2),
        })

    })

}

exports.events = (req, res, next) => {

    const type = req.body.type;

    if (type === 'QUESTION CREATE') {

        models.Users.increment('questions', {
                by: 1,
                where: { id: req.body.usersId }
            })
            .then(() => res.status(200).json({}))
            .catch(() => res.status(500).json({ message: 'Internal server error' }))

    } else if (type === 'ANSWER CREATE') {

        models.Users.increment('answers', {
                by: 1,
                where: { id: req.body.usersId }
            })
            .then(() => res.status(200).json({}))
            .catch(() => res.status(500).json({ message: 'Internal server error' }))

    } else if (type === 'USER CREATE') {

        models.Users.create({
                id: req.body.usersId,
                questions: 0,
                answers: 0
            })
            .then(() => res.status(200).json({}))
            .catch(() => res.status(500).json({ message: 'Internal server error' }))

    } else {
        res.status(200).json({});
    }

}