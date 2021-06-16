// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

// function to calculate the number of days between two dates
const calcDays = require('../utils/calcDays');

// queries for the graphs
const qsPerKeywordData = require('../utils/qsPerKeywordData');
const qsPerDayData = require('../utils/qsPerDayData');

exports.getLanding = (req, res, next) => {

    let qsPerKWName = [], qsPerKWFreq = [], qsPerDayDates = [], qsPerDayFreq = [];

    // retrieve Top 5 keywords and frequencies
    let qsPerKeyWordDataPromise = new Promise((resolve, reject) => {
        qsPerKeywordData().then(result => {
            qsPerKWName = result.name;
            qsPerKWFreq = result.frequency;
            resolve();
        })
    });

    // retrieve how many questions where created in the interval [TODAY - 15 DAYS, TODAY]
    let qsPerDayDataPromise = new Promise((resolve, reject) => {
        qsPerDayData().then(result => {
            qsPerDayDates = result.dates;
            qsPerDayFreq = result.frequency;
            resolve();
        })
    })

    // After retrieving all data
    Promise.all([qsPerKeyWordDataPromise, qsPerDayDataPromise]).then(() => {

        // check for any messages
        let messages = req.flash("messages");

        // if no messages set messages to empty arr
        if (messages.length == 0) messages = [];

        // render all data
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

    // find how many questions user with User id = session.user.id asked
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
    });

    // find how many answers user with User id = session.user.id answered
    let answersPromise = new Promise((resolve, reject) => {

        models.Answers.findAll({
                where: { UsersId: req.session.user.id },
                order: [
                    ['dateCreated', 'DESC']
                ]
            })
            .then(answers => {
                totalAnswers = answers.length;
                
                // calculate the days that the user is registered to the system
                daysRegistered = calcDays(Date.now(), new Date(req.session.user.dateCreated));
                // calculate contributions per day
                contributions = totalAnswers / daysRegistered;
                resolve();
            })

    });

    // After retrieving all data
    Promise.all([questionsPromise, answersPromise]).then(() => {

        // check for any messages
        let messages = req.flash("messages");

        // if no messages set messages to empty arr
        if (messages.length == 0) messages = [];

        // render all data
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

    // retrieve Top 5 keywords and frequencies
    let qsPerKeyWordDataPromise = new Promise((resolve, reject) => {
        qsPerKeywordData().then(result => {
            qsPerKWName = result.name;
            qsPerKWFreq = result.frequency;
            resolve();
        })
    });

    // retrieve how many questions where created in the interval [TODAY - 15 DAYS, TODAY]
    let qsPerDayDataPromise = new Promise((resolve, reject) => {
        qsPerDayData().then(result => {
            qsPerDayDates = result.dates;
            qsPerDayFreq = result.frequency;
            resolve();
        })
    })

    // after retrieving all data
    Promise.all([qsPerKeyWordDataPromise, qsPerDayDataPromise]).then(() => {

        // check for any messages
        let messages = req.flash("messages");

        // if no messages set messages to empty arr
        if (messages.length == 0) messages = [];

        // render all data
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