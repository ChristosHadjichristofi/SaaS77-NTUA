// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

/* PAGINATION VARIABLES */
// set how many Questions are shown per page
const QUESTIONS_PER_PAGE = 20;

exports.show = (req, res, next) => {

    const page = req.body.pageNumber;

    let questionsArr = [], qsNotAnswered, totalQuestions;

    /* retrieve total number of Questions and all the (20) questions in that specific page */
    let browseQuestionsPromise = new Promise((resolve, reject) => { 

        /* query that gets total number of questions */
        models.Questions.count().then(numQuestions => {
            totalQuestions = numQuestions;

            /* in case totalQuestions is zero there are no questions to be shown */
            if (totalQuestions == 0) return resolve();

            /* in case user asks for a page that does not exists send json with relevant message and status of Not Found */
            if (page > Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)) return res.status(404).json({ message: 'This questions page does not exist.', type: 'error' })

            /* else get all the questions in that specific page using offset and limit */
            return models.Questions.findAll({
                raw: true,
                offset: ((page - 1) * QUESTIONS_PER_PAGE),
                limit: QUESTIONS_PER_PAGE,
                order: [['dateCreated', 'ASC']]
            });
        })
        .then(rows => {

            /* if no questions retrieved then resolve */
            if (!rows) return resolve();

            /* else for each row process the data so as to send it in a specific format */
            rows.forEach((row, index) => {

                let question = {};
                
                dateOptions = { hour: 'numeric', minute: 'numeric', day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
                
                question.id = row.id;
                question.title = row.title;
                question.text = row.text;
                question.dateCreated = new Intl.DateTimeFormat('en-US', dateOptions).format(row.dateCreated);
                question.userId = row.UsersId;
                question.name = row.UsersName;
                question.surname = row.UsersSurname;
                question.numberOfAnswers = (row.answers !== null) ? row.answers.length : 0;

                question.keywords = row.keywords;
                questionsArr.push(question);

                if (index === questionsArr.length - 1) return resolve();
            })

            return resolve();
        })
        .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));
    })

    /* get how many questions have not been answered */
    let qsNotAnsweredPromise = new Promise((resolve, reject) => { 

        /* query that finds how many questions have not been answered */
        models.Questions.count({ where: { answers: null } }).then( result => {
            qsNotAnswered = result;
            resolve(); 
        })
        .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));
    })

    /* when all data is retrieved from database send the json with status of 200 */
    Promise.all([browseQuestionsPromise, qsNotAnsweredPromise]).then(() => {

        return res.status(200).json({ 
            pagination: {
                currentPage: page,
                hasNextPage: QUESTIONS_PER_PAGE * page < totalQuestions,
                hasPrevPage: page > 1,
                nextPage: page + 1,
                prevPage: page - 1,
                lastPage: Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)
            },
            totalQuestions: totalQuestions,
            questionsNotAnswered: qsNotAnswered, 
            questions: questionsArr 
        })
    })
    .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }))

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
                keywords: (req.body.qkeywords.length == 1 && req.body.qkeywords[0] === '') ? [] : req.body.qkeywords,
                answers: null,
                UsersId: req.body.usersId,
                UsersName: req.body.usersName,
                UsersSurname: req.body.usersSurname
            })
            .then(() => res.status(200).json({}))
            .catch(() => res.status(500).json({ message: 'Internal server error.', type: 'error' }))
    
        }
        else if (type === 'ANSWER CREATE') {
    
            const questionId = req.body.questionID;
    
            models.Questions.update(
            
                { 'answers': sequelize.fn('array_append', sequelize.col('answers'), req.body.answerID )},
                { where: { id: questionId } }
            
            )
            .then(() => res.status(200).json({}))
            .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }))
        }
        else {
            res.status(200).json({});
        }

    })
    .catch(() => res.status(500).json({ message: 'Internal server error.', type: 'error' }))

}

exports.getUserQuestions = (req, res, next) => {

    let userQuestions;
    const userID = req.params.id;

    /* get questions of user with id userID */
    let questionsPromise = new Promise((resolve, reject) => { 

        /* query that fetches all the questions of user with userID = userID */
        models.Questions.findAll({
            raw: true,
            where: { UsersId: userID },
            order: [
                ['dateCreated', 'DESC']
            ]
        })
        .then(questions => { 
            /* when questions are retrieved save them to user Questions and resolve */
            userQuestions = questions; 
            resolve(); 
        })
        /* else an error occurred */
        .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));

    });

    /* when questionsPromise is finished return the json that contains this data and status of 200 */
    questionsPromise
    .then(() => res.status(200).json({ questions: userQuestions }))
    .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }))
}

/** function that returns the status of this specific service 
 * tries sequelize.authenticate. If successful then connection to database is OK
 * else its not OK
 */
exports.status = (req, res, next) => {

    sequelize.authenticate()
    .then(() => res.status(200).json({ service: 'Browse Questions', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - OK' }))
    .catch(err => res.status(200).json({ service: 'Browse Questions', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - FAILED' }))

}