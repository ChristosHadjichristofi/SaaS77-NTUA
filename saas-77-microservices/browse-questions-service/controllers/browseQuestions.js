// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const QUESTIONS_PER_PAGE = 3;

exports.show = (req, res, next) => {

    const page = +req.query.page || 1;

    let questionsArr = [], qsNotAnswered, totalQuestions;

    let browseQuestionsPromise = new Promise((resolve, reject) => { 

        models.Questions.count().then(numQuestions => {
            totalQuestions = numQuestions;

            if (totalQuestions == 0) return resolve();

            if (page > Math.ceil(totalQuestions / QUESTIONS_PER_PAGE)) return res.status(404).json({ message: 'This questions page does not exist.' })

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
    })

    let qsNotAnsweredPromise = new Promise((resolve, reject) => { 

        models.Questions.count({ where: { answers: null } }).then( result => {
            qsNotAnswered = result;
            resolve(); 
        });
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

}


exports.events = (req, res, next) => {

    console.log(req.body);

    res.status(200).json({});

}