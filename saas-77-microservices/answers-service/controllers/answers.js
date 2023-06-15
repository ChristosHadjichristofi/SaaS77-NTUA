const axios = require('axios');
const jwt_decode = require('jwt-decode');
const encrypt = require('../utils/encrypt');

// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

/* PAGINATION VARIABLES */
// set how many Answers are shown per page
const ANSWERS_PER_PAGE = 2;

exports.getQuestion = (req, res, next) => {
    
    /* 
        question id - query param
        page - query param (default is 1) 
    */
    let questionID = req.params.id;
    const page = req.body.pageNumber;

    let question, totalAnswers, answersArr;

    // if user requests question id that is not a number set it to 1 (default)
    if (isNaN(questionID)) questionID = 1;

    // retrieve questions info of question id = questionID
    let questionPromise = new Promise((resolve, reject) => { 
        models.Questions.findAll({ raw: true, where: { id: questionID } })
        .then(row => {
            
            /* if no row fetched then return Not Found and relevant message */
            if (row.length == 0) return res.status(404).json({ message: 'Question not found!', type: 'error' }); 

            // else define a q (question) obj
            let q = {};
            
            // date options (how is shown)
            dateOptions = { 
                hour: 'numeric', minute: 'numeric', day: 'numeric',
                month: 'long', year: 'numeric', weekday: 'long'
            };
            
            // add necessary attributes to q object and store q object to question variable
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

    // retrieve all answers of question with id questionID
    let answersPromise = new Promise((resolve, reject) => {

        // retrieve how many answers this question has
        models.Answers.count({ where: { QuestionsId: questionID }}).then(numAnswers => {
            totalAnswers = numAnswers;
            
            // in case user asks for answer page gt the pages that can exist with X answers on question with id questionID return Not Found and relevant message
            if(page > Math.ceil(totalAnswers / ANSWERS_PER_PAGE) && totalAnswers !== 0) return res.status(404).json({ message: 'This answer page does not exist.', type: 'error'})
            
            // else return the answers of the question that the user asked
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

            // Save all answers found to answersArr and convert datetime to a specific format
            answersArr = answers;
            answersArr.forEach(ans => ans.dateCreated = new Intl.DateTimeFormat('en-US', dateOptions).format(ans.dateCreated))
            resolve();
        })
        .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));

    });

    // when all data is retrieved from database return json with all necessary data and status OK
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

    // query parameter that shows the question ID
    const questionID = req.params.id;
    // answer question requires body of { answer: answer }
    const answerText = req.body.answer;
    
    // if answer text is empty then show error message to user and redirect to the 'browse question' of id = questionID
    if (answerText === '') return res.status(400).json({ message: 'Answer body cannot be empty.', type: 'error' })

    // get userData from the request header in order to use this data to create the new answer
    const userData = jwt_decode(req.header('X-OBSERVATORY-AUTH'));

    let answerID;

    // else create the new answer for the question with id equal with questionID
    models.Answers.create({
        text: answerText,
        dateCreated: Date.now(),
        UsersId: userData.user.id,
        UsersName: userData.user.name,
        UsersSurname: userData.user.surname,
        QuestionsId: questionID
    })
    .then(answer => {
        
        // after saving the new answer to the database send the answers data to the bus in order to send it to
        // all the subscribers, and the subscribers know about this new record
        answerID = answer.id;

        models.Answers.findAll({ raw: true, where: { id: answer.id } })
        .then(answer => {
            
            /* url of the event bus, data that will be sent and necessary headers to make the request */
            const url = `http://${process.env.BASE_URL}:4006/events`;

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

/* events route (subscriber on bus events - QUESTION CREATE/ ANSWER CREATE/ USER CREATE) */
exports.events = (req, res, next) => {

    const type = req.body.type;

    /* increment the events counter (how many events this service processed) */
    models.Events.increment('counter', { by: 1, where: { id: 1 } })
    .then(() => {

        /* Based on which Type of event is the service has a specific behaviour */
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

/** function that returns the status of this specific service 
 * tries sequelize.authenticate. If successful then connection to database is OK
 * else its not OK
 */
exports.status = (req, res, next) => {

    sequelize.authenticate()
    .then(() => res.status(200).json({ service: 'Answers', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - OK' }))
    .catch(err => res.status(200).json({ service: 'Answers', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - FAILED' }))

}