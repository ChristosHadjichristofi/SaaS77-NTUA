// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const calcDays = require('../utils/calcDays');
const qsPerKeywordData = require('../utils/qsPerKeywordData');
const qsPerDayData = require('../utils/qsPerDayData');

exports.getLanding = (req, res, next) => {
    
    let qsPerKWTop3 = [], qsPerKWName = [], qsPerKWFreq = [], qsPerDayDates = [], qsPerDayFreq = [];

    let qsPerKeyWordDataPromise = new Promise((resolve, reject) => {
        qsPerKeywordData().then(result => {
            qsPerKWTop3 = result.topThreeKeywords;
            qsPerKWName = result.name;
            qsPerKWFreq = result.frequency;
            resolve();
        })
    });

    let qsPerDayDataPromise = new Promise((resolve, reject) => {
        qsPerDayData().then(result => {
            qsPerDayDates = result.dates;
            qsPerDayFreq = result.frequency;
            resolve();
        })
    })

    Promise.all([qsPerKeyWordDataPromise, qsPerDayDataPromise]).then(() => {

        let messages = req.flash("messages");

        if (messages.length == 0) messages = [];

        res.render('landing.ejs', {
            pageTitle: "Landing Page",
            topThreeKeywords: qsPerKWTop3,
            topKeywords: qsPerKWName,
            topKeywordsFreq: qsPerKWFreq,
            qsPerDayDates: qsPerDayDates,
            qsPerDayFreq: qsPerDayFreq,
            messages: messages
        })
    })
}


exports.getProfile = function (req, res, next) {

    let totalQuestions, totalAnswers, contributions;
    
    let questionsPromise = new Promise((resolve, reject) => {
        models.Questions.count({ where: { UsersId: req.session.user.id } })
        .then(questions => {
            totalQuestions = questions;
            resolve();
        })
    })

    let answersPromise = new Promise((resolve, reject) => {

        models.Answers.findAll({ 
            where: { UsersId: req.session.user.id },
            order: [['dateCreated', 'DESC']]
        })
        .then(answers => {
            totalAnswers = answers.length;
            contributions = totalAnswers / calcDays(Date.now(), new Date(req.session.user.dateCreated));
            resolve();
        })
        
    })
    Promise.all([questionsPromise, answersPromise]).then(() => {

        let messages = req.flash("messages");

        if (messages.length == 0) messages = [];

        res.render('profile.ejs', {
            pageTitle: "Profile Page",
            totalQuestions: totalQuestions,
            totalAnswers: totalAnswers,
            contributions: contributions.toFixed(2),
            messages: messages
        });
    })

}

exports.getHome = (req, res, next) => {

    let qsPerKWTop3 = [], qsPerKWName = [], qsPerKWFreq = [], qsPerDayDates = [], qsPerDayFreq = [];

    let qsPerKeyWordDataPromise = new Promise((resolve, reject) => {
        qsPerKeywordData().then(result => {
            qsPerKWTop3 = result.topThreeKeywords;
            qsPerKWName = result.name;
            qsPerKWFreq = result.frequency;
            resolve();
        })
    });

    let qsPerDayDataPromise = new Promise((resolve, reject) => {
        qsPerDayData().then(result => {
            qsPerDayDates = result.dates;
            qsPerDayFreq = result.frequency;
            resolve();
        })
    })

    Promise.all([qsPerKeyWordDataPromise, qsPerDayDataPromise]).then(() => {

        let messages = req.flash("messages");

        if (messages.length == 0) messages = [];

        res.render('home.ejs', {
            pageTitle: "Home Page",
            topThreeKeywords: qsPerKWTop3,
            topKeywords: qsPerKWName,
            topKeywordsFreq: qsPerKWFreq,
            qsPerDayDates: qsPerDayDates,
            qsPerDayFreq: qsPerDayFreq,
            messages: messages 
        })
    })
}