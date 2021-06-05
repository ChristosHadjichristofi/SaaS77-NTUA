// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const calcDays = require('../utils/calcDays');
const qsPerKeywordData = require('../utils/qsPerKeywordData');
const qsPerDayData = require('../utils/qsPerDayData');

exports.getLanding = (req, res, next) => {

    let qsPerKWName = [], qsPerKWFreq = [], qsPerDayDates = [], qsPerDayFreq = [];

    let qsPerKeyWordDataPromise = new Promise((resolve, reject) => {
        qsPerKeywordData().then(result => {
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
            topKeywords: qsPerKWName,
            topKeywordsFreq: qsPerKWFreq,
            qsPerDayDates: qsPerDayDates,
            qsPerDayFreq: qsPerDayFreq,
            messages: messages
        })
    })
}


exports.getProfile = function(req, res, next) {

    let totalQuestions, totalAnswers, contributions, questionsArr, daysRegistered;

    let questionsPromise = new Promise((resolve, reject) => {
        models.Questions.findAll({
            where: { UsersId: req.session.user.id },
            include: [
                { model: models.Answers }
            ],
            order: [
                ['dateCreated', 'DESC']
            ] 
        })
        .then(questions => {
            /** Accessing questionsArr[i] values **/
            // questionsArr[i].dataValues.Answers.length -> access answers length
            // questionsArr[i].dataValues.id -> access question id
            // questionsArr[i].dataValues.name -> access question name
            questionsArr = questions;
            totalQuestions = questions.length;
            resolve();
        })
    })

    let answersPromise = new Promise((resolve, reject) => {

        models.Answers.findAll({
                where: { UsersId: req.session.user.id },
                order: [
                    ['dateCreated', 'DESC']
                ]
            })
            .then(answers => {
                totalAnswers = answers.length;
                daysRegistered = calcDays(Date.now(), new Date(req.session.user.dateCreated));
                contributions = totalAnswers / daysRegistered;
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
            questions: questionsArr,
            daysRegistered: daysRegistered,
            messages: messages
        });
    })

}

exports.getHome = (req, res, next) => {

    let qsPerKWName = [], qsPerKWFreq = [], qsPerDayDates = [], qsPerDayFreq = [];

    let qsPerKeyWordDataPromise = new Promise((resolve, reject) => {
        qsPerKeywordData().then(result => {
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
            topKeywords: qsPerKWName,
            topKeywordsFreq: qsPerKWFreq,
            qsPerDayDates: qsPerDayDates,
            qsPerDayFreq: qsPerDayFreq,
            messages: messages
        })
    })
}

exports.getAbout = (req, res, next) => {
    res.render('about.ejs', {
        pageTitle: "About Page"
    })
}

exports.getDocumentation = (req, res, next) => {
    res.render('documentation.ejs', {
        pageTitle: "Documentation Page"
    })
}

exports.getContact = (req, res, next) => {
    res.render('contact.ejs', {
        pageTitle: "Contact Us Page"
    })
}