// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

exports.createQuestion = (req, res, next) => {

    let qname = req.body.qname;
    let qtext = req.body.qtext;
    let qkeywords = req.body.qkeywords;

    const keywordsArr = qkeywords.split(',');

    models.Questions.create({
        title: qname,
        text: qtext,
        dateCreated: Date.now(),
        UsersId: req.session.user.id
    })
    .then(question => {
        
        let insertKeywords = new Promise((resolve, reject) => {
            keywordsArr.forEach((keywordName, index) => {
                models.Keywords.create({
                    name: keywordName,
                    QuestionsId: question.id
                })
                if (index === keywordsArr.length -1) return resolve(true);
            });
        });
        
        insertKeywords.then(() => { res.redirect('/home'); });
    })

}

exports.browseQuestions = (req, res, next) => {

    res.render('browseQuestions.ejs', { pageTitle: "Browse Questions Page" });

};