// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

exports.getLanding = (req, res, next) => {

    res.render('landing.ejs', { pageTitle: "Landing Page" });

}


exports.getProfile = function (req, res, next) {

    let totalQuestions, totalAnswers;
    
    let questionsPromise = new Promise((resolve, reject) => {
        models.Questions.count({ where: { id: req.session.user.id } })
        .then(questions => {
            totalQuestions = questions;
            resolve();
        })
    })

    let answersPromise = new Promise((resolve, reject) => {

        models.Answers.count({ where: { id: req.session.user.id } })
        .then(answers => {
            totalAnswers = answers;
            resolve();
        })
        
    })

    Promise.all([questionsPromise, answersPromise]).then(() => {
        res.render('profile.ejs', { pageTitle: "Profile Page", totalQuestions: totalQuestions, totalAnswers: totalAnswers });
    })

}

exports.getHome = (req, res, next) => {

    res.render('home.ejs', { pageTitle: "Home Page" });

}