// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const QUESTIONS_PER_PAGE = 3;
const ANSWERS_PER_PAGE = 2;

exports.createQuestion = (req, res, next) => {
    console.log()
    let qname = req.body.qname;
    let qtext = req.body.qtext;
    let qkeywords = req.body.qkeywords;

    let hasError = false;

    if (!qname) {
        hasError = true;
        req.flash('messages', {type: 'error', value: 'Question name is not defined.'});
    }

    if (!qtext) {
        hasError = true;
        req.flash('messages', {type: 'error', value: 'Question text is not defined.'});
    }
    if (hasError) return res.redirect(req.headers.referer);
    
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
        
        insertKeywords.then(() => { 
            req.flash('messages', {type: 'success', value: 'Your question was submitted successfully.'});
            res.redirect(req.headers.referer); 
        });
    })

}

exports.browseQuestions = (req, res, next) => {

    const page = +req.query.page || 1;

    let questionsArr = [], qsGotAnswered, totalQuestions;

    let browseQuestionsPromise = new Promise((resolve, reject) => { 

        models.Questions.count().then(numQuestions => {
            totalQuestions = numQuestions;

            if (totalQuestions == 0) return resolve();

            if (page > Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)) return res.redirect('/questions/show?page=1')

            return models.Questions.findAll({
                offset: ((page - 1) * QUESTIONS_PER_PAGE),
                limit: QUESTIONS_PER_PAGE,
                include: [
                    {
                        model: models.Users,
                        on: {
                            col1: sequelize.where(sequelize.col("Questions.UsersId"), "=", sequelize.col("User.id")),
                        },
                        attributes: ['name', 'surname']
                    },
                    { model: models.Keywords },
                    { model: models.Answers }
                ],
                order: [['dateCreated', 'ASC']]
            });
        })
        .then(rows => {
            
            if (!rows) return resolve();

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
                question.totalAnswers = row.dataValues.Answers.length;

                row.dataValues.Keywords.forEach(el => keywords.push(el.dataValues.name));

                question.keywords = keywords;
                questionsArr.push(question);

                if (index === questionsArr.length - 1) return resolve();
            })

            return resolve();
        })
    })

    let qsGotAnsweredPromise = new Promise((resolve, reject) => { 

        models.Answers.count({ distinct:true, col: 'QuestionsId' }).then( result => {
            qsGotAnswered = result;
            resolve(); 
        });
    })

    Promise.all([browseQuestionsPromise, qsGotAnsweredPromise]).then(() => { 
        res.render('browseQuestions.ejs', {
            pageTitle: "Browse Questions Page", 
            questions: questionsArr, 
            qsGotAnswered: qsGotAnswered,
            totalQuestions: totalQuestions,
            currentPage: page,
            hasNextPage: QUESTIONS_PER_PAGE * page < totalQuestions,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)
        });
    })
};

exports.browseQuestion = (req, res, next) => {

    let questionID = req.params.id;
    const page = +req.query.page || 1;

    let question, totalAnswers, answersArr;

    if (isNaN(questionID)) questionID = 1;

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
            
            if (rows.length == 0) return res.redirect('/questions/show');

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

        models.Answers.count({ where: { QuestionsId: questionID }}).then(numAnswers => {
            totalAnswers = numAnswers;

            if(page > Math.ceil(totalAnswers / ANSWERS_PER_PAGE) && totalAnswers !== 0) return res.redirect('/questions' + questionID + '/?page=1')
            
            return models.Answers.findAll({
                offset: ((page - 1) * ANSWERS_PER_PAGE),
                limit: ANSWERS_PER_PAGE,
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
            });
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

        let messages = req.flash("messages");

        if (messages.length == 0) messages = [];

        res.render('answerQuestion.ejs', 
        { 
            pageTitle: "Answer Question Page",
            question: question,
            answers: answersArr,
            answersCounter: answersArr.length,
            totalAnswers: totalAnswers,
            currentPage: page,
            hasNextPage: ANSWERS_PER_PAGE * page < totalAnswers,
            hasPrevPage: page > 1,
            nextPage: page + 1,
            prevPage: page - 1,
            lastPage: Math.ceil(totalAnswers / ANSWERS_PER_PAGE),
            messages: messages
        });
    })

}

exports.answerQuestion = (req, res, next) => {

    const questionID = req.params.id;
    const answerText = req.body.answer;
    
    if (answerText === '') {
        req.flash('messages', {type: 'error', value: 'Answer body cannot be empty.'})
        return res.redirect('/questions/' + questionID)
    }

    models.Answers.create({
        text: answerText,
        dateCreated: Date.now(),
        UsersId: req.session.user.id,
        QuestionsId: questionID
    })
    .then(() => {
        req.flash('messages', {type: 'success', value: 'Your answer was submitted successfully!'})
        res.redirect('/questions/' + questionID)
    })
}