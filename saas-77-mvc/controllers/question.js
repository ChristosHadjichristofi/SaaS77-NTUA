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
                if(keywordName !== "") {
                    models.Keywords.create({
                        name: keywordName,
                        QuestionsId: question.id
                    })
                }
                if (index === keywordsArr.length -1) return resolve(true);
            });
        });
        
        insertKeywords.then(() => { res.redirect('/home'); });
    })

}

exports.browseQuestions = (req, res, next) => {

    let questionsArr = [];
    let qsGotAnswered;

    let browseQuestionsPromise = new Promise((resolve, reject) => { 

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
            
            rows.forEach((row, index) => {

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

                row.dataValues.Keywords.forEach(el => keywords.push(el.dataValues.name));

                question.keywords = keywords;
                questionsArr.push(question);

                if (index === questionsArr.length - 1) return resolve();
            })
        })
    })

    let qsGotAnsweredPromise = new Promise((resolve, reject) => { 

        models.Answers.count({ distinct:true, col: 'QuestionsId' }).then( res => {
            qsGotAnswered = res;
            resolve(); 
        });
    })

    Promise.all([browseQuestionsPromise, qsGotAnsweredPromise]).then(() => { 
        res.render('browseQuestions.ejs', {
            pageTitle: "Browse Questions Page", 
            questions: questionsArr, 
            qsGotAnswered: qsGotAnswered 
        });
    })


};

exports.browseQuestion = (req, res, next) => {

    const questionID = req.params.id;
    
    let question;
    let answersArr;

    let questionPromise = new Promise((resolve, reject) => { 
        models.Questions.findAll({
            where: { id: questionID },
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
            
            let q = {};
            let keywords = [];
            
            dateOptions = { 
                hour: 'numeric', minute: 'numeric', day: 'numeric',
                month: 'long', year: 'numeric', weekday: 'long'
            };
            
            q.id = rows[0].id;
            q.title = rows[0].title;
            q.text = rows[0].text;
            q.dateCreated = new Intl.DateTimeFormat('en-US', dateOptions).format(rows[0].dateCreated);
            q.userId = rows[0].UsersId;
            q.name = rows[0].User.name;
            q.surname = rows[0].User.surname;

            rows[0].dataValues.Keywords.forEach(el => keywords.push(el.dataValues.name))

            q.keywords = keywords;

            question = q;
            resolve();

        })
    })

    let answersPromise = new Promise((resolve, reject) => {

        models.Answers.findAll({
            raw: true,
            where: { QuestionsId: questionID },
            include: [
                {
                    model: models.Users,
                    on: {
                        col1: sequelize.where(sequelize.col("Answers.UsersId"), "=", sequelize.col("User.id")),
                    },
                    attributes: ['name', 'surname']
                }
            ],
            order: [['dateCreated', 'DESC']]
        })
        .then(answers => {

            dateOptions = { 
                hour: 'numeric', minute: 'numeric', day: 'numeric',
                month: 'long', year: 'numeric', weekday: 'long'
            };

            answersArr = answers;
            answersArr.forEach(ans => ans.dateCreated = new Intl.DateTimeFormat('en-US', dateOptions).format(ans.dateCreated))
            resolve();
        });

    })

    Promise.all([questionPromise, answersPromise]).then(() => {
        res.render('answerQuestion.ejs', 
        { 
            pageTitle: "Answer Question Page",
            question: question,
            answers: answersArr,
            answersCounter: answersArr.length
        });
    })

}

exports.answerQuestion = (req, res, next) => {

    const questionID = req.params.id;
    const answerText = req.body.answer;
    
    models.Answers.create({
        text: answerText,
        dateCreated: Date.now(),
        UsersId: req.session.user.id,
        QuestionsId: questionID
    })
    .then(() => res.redirect('/questions/' + questionID))

}