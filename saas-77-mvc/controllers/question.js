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

    models.Questions.findAll({
        // raw: true,
        include: [
            {
                model: models.Users,
                on: {
                    col1: sequelize.where(sequelize.col("Questions.UsersId"), "=", sequelize.col("User.id")),
                },
                attributes: ['name', 'surname']
            },
            { model: models.Keywords }
        ]
    })
    .then(rows => {
        let questionsArr = [];
        
        rows.forEach(row => {

            let question = {};
            let keywords = [];
            
            dateOptions = { 
                hour: 'numeric',
                minute: 'numeric',
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                weekday: 'long'
            };
            
            question.id = row.id;
            question.title = row.title;
            question.text = row.text;
            question.dateCreated = new Intl.DateTimeFormat('en-US', dateOptions).format(row.dateCreated);
            question.userId = row.UsersId;
            question.name = row.User.name;
            question.surname = row.User.surname;

            row.dataValues.Keywords.forEach(el => keywords.push(el.dataValues.name))

            question.keywords = keywords;
            questionsArr.push(question)

        })
        // console.log(questionsArr)
 
        res.render('browseQuestions.ejs', { pageTitle: "Browse Questions Page", questions: questionsArr });
    
    })

};

exports.browseQuestion = (req, res, next) => {

    res.render('answerQuestion.ejs', { pageTitle: "Answer Question Page" });

}