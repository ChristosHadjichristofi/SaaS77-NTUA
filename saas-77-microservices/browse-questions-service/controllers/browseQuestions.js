// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const QUESTIONS_PER_PAGE = 3;

exports.show = (req, res, next) => {

    const page = req.body.pageNumber;

    let questionsArr = [], qsNotAnswered, totalQuestions;

    let browseQuestionsPromise = new Promise((resolve, reject) => { 

        models.Questions.count().then(numQuestions => {
            totalQuestions = numQuestions;

            if (totalQuestions == 0) return resolve();

            if (page > Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)) return res.status(404).json({ message: 'This questions page does not exist.', type: 'error' })

            return models.Questions.findAll({
                raw: true,
                offset: ((page - 1) * QUESTIONS_PER_PAGE),
                limit: QUESTIONS_PER_PAGE,
                order: [['dateCreated', 'ASC']]
            });
        })
        .then(rows => {

            if (!rows) return resolve();

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

    let qsNotAnsweredPromise = new Promise((resolve, reject) => { 

        models.Questions.count({ where: { answers: null } }).then( result => {
            qsNotAnswered = result;
            resolve(); 
        })
        .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));
    })

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


exports.events = (req, res, next) => {

    const type = req.body.type;

    if (type === 'QUESTION CREATE') {

        models.Questions.create({
            title: req.body.qname,
            text: req.body.qtext,
            dateCreated: req.body.dateCreated,
            keywords: req.body.qkeywords,
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

}

exports.getUserQuestions = (req, res, next) => {

    let userQuestions;
    const userID = req.params.id;

    let questionsPromise = new Promise((resolve, reject) => { 

        models.Questions.findAll({
            raw: true,
            where: { UsersId: userID },
            order: [
                ['dateCreated', 'DESC']
            ]
        })
        .then(questions => { userQuestions = questions; resolve(); })
        .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));

    });

    questionsPromise
    .then(() => res.status(200).json({ questions: userQuestions }))
    .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }))
}