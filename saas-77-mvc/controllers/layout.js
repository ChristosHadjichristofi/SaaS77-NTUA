// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const calcDays = require('../utils/calcDays');
const qsPerKeywordData = require('../utils/qsPerKeywordData');

exports.getLanding = (req, res, next) => {

    qsPerKeywordData().then(result => {

        res.render('landing.ejs', {
            pageTitle: "Landing Page",
            topThreeKeywords: result.topThreeKeywords,
            topKeywords: result.name,
            topKeywordsFreq: result.frequency
        });
    });
}


exports.getProfile = function (req, res, next) {

    let totalQuestions, totalAnswers, contributions;
    
    let questionsPromise = new Promise((resolve, reject) => {
        models.Questions.count({ where: { id: req.session.user.id } })
        .then(questions => {
            totalQuestions = questions;
            resolve();
        })
    })

    let answersPromise = new Promise((resolve, reject) => {

        models.Answers.findAll({ 
            where: { id: req.session.user.id },
            order: [['dateCreated', 'DESC']]
        })
        .then(answers => {
            totalAnswers = answers.length;
            contributions = totalAnswers / calcDays(Date.now(), new Date(req.session.user.dateCreated));
            resolve();
        })
        
    })

    Promise.all([questionsPromise, answersPromise]).then(() => {
        res.render('profile.ejs', {
            pageTitle: "Profile Page",
            totalQuestions: totalQuestions,
            totalAnswers: totalAnswers,
            contributions: contributions 
        });
    })

}

exports.getHome = (req, res, next) => {

    qsPerKeywordData().then(result => {

        res.render('home.ejs', {
            pageTitle: "Home Page",
            topThreeKeywords: result.topThreeKeywords,
            topKeywords: result.name,
            topKeywordsFreq: result.frequency
        });
    });
}