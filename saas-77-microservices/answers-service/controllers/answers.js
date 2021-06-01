const axios = require('axios');
const jwt_decode = require('jwt-decode');
const encrypt = require('../utils/encrypt');

// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const ANSWERS_PER_PAGE = 2;

exports.getQuestion = (req, res, next) => {

    let questionID = req.params.id;
    const page = req.body.pageNumber;

    let question, totalAnswers, answersArr;

    if (isNaN(questionID)) questionID = 1;

    let questionPromise = new Promise((resolve, reject) => { 
        models.Questions.findAll({ raw: true, where: { id: questionID } })
        .then(row => {
            
            if (row.length == 0) return res.status(404).json( {message: 'Question not found!', type: 'error' }); 

            let q = {};
            
            dateOptions = { 
                hour: 'numeric', minute: 'numeric', day: 'numeric',
                month: 'long', year: 'numeric', weekday: 'long'
            };
            
            q.id = row[0].id;
            q.title = row[0].title;
            q.text = row[0].text;
            q.dateCreated = new Intl.DateTimeFormat('en-US', dateOptions).format(row[0].dateCreated);
            q.userId = row[0].UsersId;
            q.name = row[0].UsersName;
            q.surname = row[0].UsersSurname;
            q.keywords = row[0].keywords;

            question = q;
            resolve();

        })
        .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));
    })

    let answersPromise = new Promise((resolve, reject) => {

        models.Answers.count({ where: { QuestionsId: questionID }}).then(numAnswers => {
            totalAnswers = numAnswers;

            if(page > Math.ceil(totalAnswers / ANSWERS_PER_PAGE) && totalAnswers !== 0) return res.status(404).json({ message: 'This answer page does not exist.', type: 'error'})
            
            return models.Answers.findAll({
                offset: ((page - 1) * ANSWERS_PER_PAGE),
                limit: ANSWERS_PER_PAGE,
                raw: true,
                where: { QuestionsId: questionID },
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
        })
        .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));

    })
    Promise.all([questionPromise, answersPromise]).then(() => {

        return res.status(200).json({ 
            pagination: {
                currentPage: page,
                hasNextPage: ANSWERS_PER_PAGE * page < totalAnswers,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(totalAnswers / ANSWERS_PER_PAGE)
            },
            question: question,
            answers: answersArr,
            answersCounter: answersArr.length,
            totalAnswers: totalAnswers,
        })

    }).catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }))

}

exports.postAnswer = (req, res, next) => {

    const questionID = req.params.id;
    const answerText = req.body.answer;
    
    if (answerText === '') return res.status(400).json({ message: 'Answer body cannot be empty.', type: 'error' })

    const userData = jwt_decode(req.header('X-OBSERVATORY-AUTH'));

    let answerID;

    models.Answers.create({
        text: answerText,
        dateCreated: Date.now(),
        UsersId: userData.user.id,
        UsersName: userData.user.name,
        UsersSurname: userData.user.surname,
        QuestionsId: questionID
    })
    .then(answer => {
        answerID = answer.id;

        models.Answers.findAll({ raw: true, where: { id: answer.id } })
        .then(answer => {
            
            const url = 'http://localhost:4006/events';

            const data = {
                type: 'ANSWER CREATE',
                answerID: answerID,
                questionID: questionID,
                text: answer[0].text,
                dateCreated: answer[0].dateCreated,
                usersId: answer[0].UsersId,
                usersName: answer[0].UsersName,
                usersSurname: answer[0].UsersSurname
            }
            
            const headers = {
                'X-OBSERVATORY-AUTH': req.header('X-OBSERVATORY-AUTH'),
                "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES))
            };

            const config = { method: 'post', url: url, headers: headers, data: data };
        
            axios(config)
            .then(result => { return res.status(201).json({ message: 'Answer submitted successfully.', type: 'success' })})
            .catch(err => { return res.status(500).json({ message: 'Internal server error.', type: 'error' })})
        })
        .catch(err => { return res.status(500).json({ message: 'Internal server error.', type: 'error' })})

    })
    .catch(err => { return res.status(500).json({ message: 'Internal server error.', type: 'error' })})
}

exports.events = (req, res, next) => {

    const type = req.body.type;

    models.Events.increment('counter', { by: 1, where: { id: 1 } })
    .then(() => {

        if (type === 'QUESTION CREATE') {

            models.Questions.create({
                title: req.body.qname,
                text: req.body.qtext,
                dateCreated: req.body.dateCreated,
                keywords: req.body.qkeywords,
                UsersId: req.body.usersId,
                UsersName: req.body.usersName,
                UsersSurname: req.body.usersSurname
            })
            .then(() => res.status(200).json({}))
            .catch(() => res.status(500).json({ message: 'Internal server error.', type: 'error' }))
    
        }
        else {
            res.status(200).json({});
        }
    
    })
    .catch(() => res.status(500).json({ message: 'Internal server error.', type: 'error' }))

}

exports.status = (req, res, next) => {

    sequelize.authenticate()
    .then(() => res.status(200).json({ service: 'Answers', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - OK' }))
    .catch(err => res.status(200).json({ service: 'Answers', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - FAILED' }))

}