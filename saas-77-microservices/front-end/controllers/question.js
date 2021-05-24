const jwt_decode = require('jwt-decode');
const axios = require('axios');
const encrypt = require('../utils/encrypt');

exports.createQuestion = (req, res, next) => {

    let qname = req.body.qname;
    let qtext = req.body.qtext;
    let qkeywords = req.body.qkeywords;

    const userData = jwt_decode(req.session.user.jwtToken);
    const url_createQuestion = 'http://localhost:4001/create';

    const headers = { 
        'X-OBSERVATORY-AUTH': req.session.user.jwtToken,
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) 
    };

    const data = {
        qname: qname,
        qtext: qtext,
        qkeywords: qkeywords,
        usersId: userData.user.id,
        usersName: userData.user.name,
        usersSurname: userData.user.surname
    };

    const config_createQuestion = { method: 'post', url: url_createQuestion, data: data, headers: headers };

    let insertKeywords = new Promise((resolve, reject) => {
        axios(config_createQuestion)
        .then(result => {
            req.flash('messages', { type: result.data.type, value: result.data.message })
            resolve(); 
        })
        .catch(err => { 
            if (err.code === 'ECONNREFUSED') {
                isOK = false; 
                req.flash('messages', { type: 'error', value: 'The service is down. Please try again later.' })
            }
            else if (err.response.data.message === 'Validation Error!') {
                err.response.data.errors.forEach(error => req.flash('messages', {type: error.type, value: `${error.msg}`}));
                return res.redirect(req.headers.referer);
            }
            else {
                req.flash('messages', { type: err.response.data.type, value: err.response.data.message })
            }
            resolve(); 
        });
    });
    
    insertKeywords.then(() => res.redirect(req.headers.referer));
}

exports.browseQuestions = (req, res, next) => {

    // get service down messages from sessions, because when redirecting messages cant be sent.
    const serviceDownMessages = req.session.messages || [];
    // in case req.session.messages is undefined
    if (!req.session.messages) req.session.messages = [];

    // in case req.session.messages has messages, we got them so we need to empty the req.session.messages
    if (serviceDownMessages.length !== 0) req.session.messages = [];

    let isOK = true, notExist = false, questions, questionsNotAnswered, totalQuestions, pagination;
    const url_browseQuestions = 'http://localhost:4003/show';
    const page = +req.query.page || 1;

    const headers = { 
        'X-OBSERVATORY-AUTH': req.session.user.jwtToken,
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) 
    };

    const config_browseQuestions = { method: 'post', url: url_browseQuestions, headers: headers, data: { pageNumber: page } };

    let browseQuestionsPromise = new Promise((resolve, reject) => {

        axios(config_browseQuestions)
        .then(result => {
            questions = result.data.questions;
            questionsNotAnswered = result.data.questionsNotAnswered;
            totalQuestions = result.data.totalQuestions;
            pagination = result.data.pagination;
            resolve(); 
        })
        .catch(err => { 
            if (err.code === 'ECONNREFUSED') {
                isOK = false; 
                req.session.messages = [{ type: 'error', value: 'The service is down. Please try again later.' }];
            }
            else {
                if (err.response.status === 404) notExist = true;
                else isOK = false;
                req.session.messages = [{ type: err.response.data.type, value: err.response.data.message }];
            }
            resolve(); 
        });

    });

    browseQuestionsPromise.then(() => {

        let messages = req.flash("messages");

        messages = serviceDownMessages.length !== 0 ? messages.concat(serviceDownMessages) : messages;

        if (messages.length == 0) messages = [];

        if (!isOK) return res.redirect(req.headers.referer);
        else if (notExist) return res.redirect('/questions/show?page=1');

        res.render('browseQuestions.ejs', {
            pageTitle: "Browse Questions Page", 
            questions: questions, 
            questionsNotAnswered: questionsNotAnswered,
            totalQuestions: totalQuestions,
            currentPage: pagination.currentPage,
            hasNextPage: pagination.hasNextPage,
            hasPrevPage: pagination.hasPrevPage,
            nextPage: pagination.nextPage,
            prevPage: pagination.prevPage,
            lastPage: pagination.lastPage,
            messages: messages
        });
    });
};

exports.browseQuestion = (req, res, next) => {

    // get service down messages from sessions, because when redirecting messages cant be sent.
    const serviceDownMessages = req.session.messages || [];
    // in case req.session.messages is undefined
    if (!req.session.messages) req.session.messages = [];

    // in case req.session.messages has messages, we got them so we need to empty the req.session.messages
    if (serviceDownMessages.length !== 0) req.session.messages = [];

    let question, answers, answersCounter, totalAnswers, pagination, isOK = true, notExist = false;

    const url_browseQuestion = 'http://localhost:4002/question/' + req.params.id;
    const page = +req.query.page || 1;

    const headers = { 
        'X-OBSERVATORY-AUTH': req.session.user.jwtToken,
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) 
    };

    const config_browseQuestion = { method: 'post', url: url_browseQuestion, headers: headers, data: { pageNumber: page } };
    const userData = jwt_decode(req.session.user.jwtToken);

    let browseQuestionPromise = new Promise((resolve, reject) => {
        
        axios(config_browseQuestion)
        .then(result => {
            question = result.data.question;
            answers = result.data.answers;
            answersCounter = result.data.answersCounter;
            totalAnswers = result.data.totalAnswers;
            pagination = result.data.pagination;
            resolve(); 
        })
        .catch(err => { 
            if (err.code === 'ECONNREFUSED') {
                isOK = false; 
                req.session.messages = [{ type: 'error', value: 'The service is down. Please try again later.' }];
            }
            else {
                if (err.response.status === 404) notExist = true;
                else isOK = false;
                req.session.messages = [{ type: err.response.data.type, value: err.response.data.message }];
            }
            resolve(); 
        });

    });

    browseQuestionPromise.then(() => {

        let messages = req.flash("messages");

        messages = serviceDownMessages.length !== 0 ? messages.concat(serviceDownMessages) : messages;

        if (messages.length == 0) messages = [];

        if (!isOK) return res.redirect('/questions/show?page=1');

        if (notExist) return res.redirect('/questions/' + req.params.id)

        res.render('answerQuestion.ejs', 
        { 
            pageTitle: "Answer Question Page",
            question: question,
            answers: answers,
            answersCounter: answersCounter,
            totalAnswers: totalAnswers,
            currentPage: pagination.currentPage,
            hasNextPage: pagination.hasNextPage,
            hasPrevPage: pagination.hasPrevPage,
            nextPage: pagination.nextPage,
            prevPage: pagination.prevPage,
            lastPage: pagination.lastPage,
            loggedUser: {
                name: userData.user.name,
                surname: userData.user.surname
            },
            messages: messages
        });
    });
}

exports.answerQuestion = (req, res, next) => {

    let isOK = true;

    const page = +req.query.page || 1;

    const data = {
        questionID: req.params.id,
        answer: req.body.answer
    };

    const url_postAnswer = 'http://localhost:4002/answer/' + req.params.id;

    const headers = { 
        'X-OBSERVATORY-AUTH': req.session.user.jwtToken,
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) 
    };

    const config_postAnswer = { method: 'post', url: url_postAnswer, headers: headers, data: data };

    let answerQuestionPromise = new Promise((resolve, reject) => {
        
        axios(config_postAnswer)
        .then(result => {
            req.flash('messages', { type: result.data.type, value: result.data.message }); 
            resolve(); 
        })
        .catch(err => { 
            if (err.code === 'ECONNREFUSED') {
                isOK = false; 
                req.flash('messages', { type: 'error', value: 'The service is down. Please try again later.' });
            }

            else req.flash('messages', { type: err.response.data.type, value: err.response.data.message });

            resolve(); 
        });
    });

    answerQuestionPromise.then( () => {
    
        if (!isOK) return res.redirect('/questions/show?page=1');
        res.redirect('/questions/' + req.params.id + '?page=' + page) ;
    });
}