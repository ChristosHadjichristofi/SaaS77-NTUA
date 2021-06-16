// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

/* PAGINATION VARIABLES */
// set how many Questions are shown per page
const QUESTIONS_PER_PAGE = 20;
// set how many Answers are shown per page
const ANSWERS_PER_PAGE = 2;

exports.createQuestion = (req, res, next) => {

    /* Create Question asks for body of {qname: question_name, qtext: question_text, qkeywords: question's_keywords_array } */
    let qname = req.body.qname;
    let qtext = req.body.qtext;
    let qkeywords = req.body.qkeywords;

    // variable to decide if error occurred
    let hasError = false;

    // validating the fields qname and qtext, in case any of them does not exist, show the respective message
    if (!qname) {
        hasError = true;
        req.flash('messages', {type: 'error', value: 'Question name is not defined.'});
    }

    if (!qtext) {
        hasError = true;
        req.flash('messages', {type: 'error', value: 'Question text is not defined.'});
    }

    // in case of any error occurred (and the variable hasError is set to True) redirect to the page that sent the request
    if (hasError) return res.redirect(req.headers.referer);
    

    /* 
        if previous checks are passed, proccess the keywords
        1. Split them on comma
        2. convert array to set to avoid dublicates
        3. convert back to array
    */
    let keywordsArr = qkeywords.split(',');
    const keywordsSet = new Set(keywordsArr);
    keywordsArr = Array.from(keywordsSet);

    // create the question using the body
    models.Questions.create({
        title: qname,
        text: qtext,
        dateCreated: Date.now(),
        UsersId: req.session.user.id
    })
    .then(question => {
        
        // after question is created, keywords must be stored
        // using promise-ful code in order to add all the keywords of that
        // specific question and then proceed
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
        
        // after keywords are stored redirect user to the page that he was before and show successful message
        insertKeywords.then(() => { 
            req.flash('messages', {type: 'success', value: 'Your question was submitted successfully.'});
            res.redirect(req.headers.referer); 
        });
    })

}

exports.browseQuestions = (req, res, next) => {

    // get from query param the page (in case of not giving the param set default to 1)
    const page = +req.query.page || 1;

    let questionsArr = [], qsGotAnswered, totalQuestions;

    // retrieve all questions (in that specific page) and the total number of the questions in the system
    let browseQuestionsPromise = new Promise((resolve, reject) => { 

        // query to retrieve total number of questions
        models.Questions.count().then(numQuestions => {
            totalQuestions = numQuestions;

            if (totalQuestions == 0) return resolve();

            // in case query param page is gt the total pages that the system can have with
            // X questions in the system, redirect user to the first page (default page)
            if (page > Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)) return res.redirect('/questions/show?page=1');

            // retrieve all questions in that page using offset and limit
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
            
            // if no records returned resolve
            if (!rows) return resolve();

            // else loop in the rows array and proccess some fields that are retrieved from db
            rows.forEach((row, index) => {

                let question = {};
                let keywords = [];
                
                // date options (how date should show in front end)
                dateOptions = { 
                    hour: 'numeric',
                    minute: 'numeric',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    weekday: 'long'
                };
                
                // create an object using row[i] elements
                question.id = row.id;
                question.title = row.title;
                question.text = row.text;
                question.dateCreated = new Intl.DateTimeFormat('en-US', dateOptions).format(row.dateCreated);
                question.userId = row.UsersId;
                question.name = row.User.name;
                question.surname = row.User.surname;
                question.totalAnswers = row.dataValues.Answers.length;

                // create keywords array from row
                row.dataValues.Keywords.forEach(el => keywords.push(el.dataValues.name));

                // add keywords as an attribute to question obj
                question.keywords = keywords;
                
                // push the question obj to questionsArr (that will be sent to the view)
                questionsArr.push(question);

                if (index === questionsArr.length - 1) return resolve();
            })

            return resolve();
        })
    })

    // count how many questions have at least one answer
    let qsGotAnsweredPromise = new Promise((resolve, reject) => { 

        models.Answers.count({ distinct:true, col: 'QuestionsId' }).then( result => {
            qsGotAnswered = result;
            resolve(); 
        });
    })

    // after retrieving all data render
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

    /* 
        question id - query param
        page - query param (default is 1) 
    */
    let questionID = req.params.id;
    const page = +req.query.page || 1;

    let question, totalAnswers, answersArr;

    // if user requests question id that is not a number set it to 1 (default)
    if (isNaN(questionID)) questionID = 1;

    // retrieve questions info of question id = questionID
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
            
            // if this question does not exist, redirect user to browse questions
            if (rows.length == 0) return res.redirect('/questions/show');

            let q = {};
            let keywords = [];
            
            // how date is shown (options)
            dateOptions = { 
                hour: 'numeric', minute: 'numeric', day: 'numeric',
                month: 'long', year: 'numeric', weekday: 'long'
            };
            
            // add neccessary attributes to q object and store q object to question variable
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

    // retrieve all answers of question with id questionID
    let answersPromise = new Promise((resolve, reject) => {

        // retrieve how many answers this question has
        models.Answers.count({ where: { QuestionsId: questionID }}).then(numAnswers => {
            totalAnswers = numAnswers;

            // in case user asks for answer page gt the pages that can exist with X answers on question with id questionID redirect to first page (default)
            if(page > Math.ceil(totalAnswers / ANSWERS_PER_PAGE) && totalAnswers !== 0) return res.redirect('/questions' + questionID + '/?page=1')
            
            // retrieve all answers of question with question ID = questionID
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

            // Save all answers found to answersArr and convert datetime to a specific format
            answersArr = answers;
            answersArr.forEach(ans => ans.dateCreated = new Intl.DateTimeFormat('en-US', dateOptions).format(ans.dateCreated))
            resolve();
        });

    });

    // after retrieving all the data render page
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

    // query parameter that shows the question ID
    const questionID = req.params.id;
    // answer question requires body of {answer: answer}
    const answerText = req.body.answer;
    
    // if answer text is empty then show error message to user and redirect to the 'browse question' of id = questionID
    if (answerText === '') {
        req.flash('messages', {type: 'error', value: 'Answer body cannot be empty.'})
        return res.redirect('/questions/' + questionID)
    }

    // else create the new answer for the question with id equal with questionID
    models.Answers.create({
        text: answerText,
        dateCreated: Date.now(),
        UsersId: req.session.user.id,
        QuestionsId: questionID
    })
    .then(() => {
        // show success message and redirect to the 'browse question' of id = questionID
        req.flash('messages', {type: 'success', value: 'Your answer was submitted successfully!'})
        res.redirect('/questions/' + questionID)
    })
}