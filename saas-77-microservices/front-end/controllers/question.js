const jwt_decode = require('jwt-decode');
const axios = require('axios');
const encrypt = require('../utils/encrypt');

exports.createQuestion = (req, res, next) => {

    /* Get necessary data that the services will need to retrieve data that will be rendered */
    let qname = req.body.qname;
    let qtext = req.body.qtext;
    let qkeywords = req.body.qkeywords;

    /* decode jwt to get userData */
    const userData = jwt_decode(req.session.user.jwtToken);

    /* Construct url of ask question service - create endpoint */
    const url_createQuestion = `http://${process.env.BASE_URL}:4001/create`;

    /* Add Necessary headers for the request */
    const headers = { 
        'X-OBSERVATORY-AUTH': req.session.user.jwtToken,
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) 
    };

    /* Add all necessary data that will be used as payload to the request */
    const data = {
        qname: qname,
        qtext: qtext,
        qkeywords: qkeywords,
        usersId: userData.user.id,
        usersName: userData.user.name,
        usersSurname: userData.user.surname
    };

    /* Construct the config for the request */
    const config_createQuestion = { method: 'post', url: url_createQuestion, data: data, headers: headers };

    /* Axios request to send data to Create Question Service */
    let insertKeywords = new Promise((resolve, reject) => {
        axios(config_createQuestion)
        /* if result status < 400 */
        .then(result => {
            /* Successful creation of a question, show message */
            req.flash('messages', { type: result.data.type, value: result.data.message })
            resolve(); 
        })
        /* Result status > 400 */
        .catch(err => { 
            /* Service Unavailable */
            if (err.code === 'ECONNREFUSED') {
                isOK = false; 
                req.flash('messages', { type: 'error', value: 'The service is down. Please try again later.' })
            }
            /* Validation error (something went wrong with the payload, maybe the user sent empty text etc) */
            else if (err.response.data.message === 'Validation Error!') {
                err.response.data.errors.forEach(error => req.flash('messages', {type: error.type, value: `${error.msg}`}));
                return res.redirect(req.headers.referer);
            }
            /* Any other error */
            else {
                req.flash('messages', { type: err.response.data.type, value: err.response.data.message })
            }
            resolve(); 
        });
    });
    
    /* Redirect to the page that the user was before creating a question (or trying to create a question) */
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
    
    /* Construct url to fetch all questions */
    const url_browseQuestions = `http://${process.env.BASE_URL}:4003/show`;
    /* Questions are fetched in 'packages' of 20 [Pagination] - if the page query param is not set, default 1 */
    const page = +req.query.page || 1;

    /* Necessary headers for the request */
    const headers = { 
        'X-OBSERVATORY-AUTH': req.session.user.jwtToken,
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) 
    };

    /* Create config to make the request */
    const config_browseQuestions = { method: 'post', url: url_browseQuestions, headers: headers, data: { pageNumber: page } };

    /* Axios request to get all questions in that specific page [or if not set -> page 1] */
    let browseQuestionsPromise = new Promise((resolve, reject) => {

        axios(config_browseQuestions)
        /* if result status < 400 */
        .then(result => {
            questions = result.data.questions;
            questionsNotAnswered = result.data.questionsNotAnswered;
            totalQuestions = result.data.totalQuestions;
            pagination = result.data.pagination;
            resolve(); 
        })
        /* if result status > 400 */
        .catch(err => { 
            /* if service unavailable */
            if (err.code === 'ECONNREFUSED') {
                isOK = false; 
                req.session.messages = [{ type: 'error', value: 'The service is down. Please try again later.' }];
            }
            /* if any other error */
            else {
                /* if page does not exist */
                if (err.response.status === 404) notExist = true;
                else isOK = false;
                req.session.messages = [{ type: err.response.data.type, value: err.response.data.message }];
            }
            resolve(); 
        });

    });

    /* after getting the necessary data render the page */
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
            messages: messages,
            base_url: process.env.BASE_URL
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

    /* 
        Construct url to fetch a specific question and its answers - answers are fetched in 'packages' of 2 [Pagination] 
        if user does not set page then default 1
    */
    const url_browseQuestion = `http://${process.env.BASE_URL}:4002/question/` + req.params.id;
    const page = +req.query.page || 1;

    /* Necessary headers to make the request */
    const headers = { 
        'X-OBSERVATORY-AUTH': req.session.user.jwtToken,
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) 
    };

    /* Construct config to make the request */
    const config_browseQuestion = { method: 'post', url: url_browseQuestion, headers: headers, data: { pageNumber: page } };
    
    /* get userData from jwt (decode) */
    const userData = jwt_decode(req.session.user.jwtToken);

    /* Make the Axios request to get the data */
    let browseQuestionPromise = new Promise((resolve, reject) => {
        
        axios(config_browseQuestion)
        /* if result status < 400 */
        .then(result => {
            question = result.data.question;
            answers = result.data.answers;
            answersCounter = result.data.answersCounter;
            totalAnswers = result.data.totalAnswers;
            pagination = result.data.pagination;
            resolve(); 
        })
        /* if result status > 400 */
        .catch(err => { 
            /* Service unavailable */
            if (err.code === 'ECONNREFUSED') {
                isOK = false; 
                req.session.messages = [{ type: 'error', value: 'The service is down. Please try again later.' }];
            }
            /* any other error */
            else {
                /* this page does not exist */
                if (err.response.status === 404) notExist = true;
                else isOK = false;
                req.session.messages = [{ type: err.response.data.type, value: err.response.data.message }];
            }
            resolve(); 
        });

    });

    /* after retrieving necessary data render the page and show any messages that need to be shown */
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
            messages: messages,
            base_url: process.env.BASE_URL
        });
    });
}

exports.answerQuestion = (req, res, next) => {

    let isOK = true;

    const page = +req.query.page || 1;
    
    /* Construct url to post an answer to the system */
    const url_postAnswer = `http://${process.env.BASE_URL}:4002/answer/` + req.params.id;

    /* payload that will be sent to the service */
    const data = {
        questionID: req.params.id,
        answer: req.body.answer
    };

    /* Necessary headers to make the request */
    const headers = { 
        'X-OBSERVATORY-AUTH': req.session.user.jwtToken,
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) 
    };

    /* Create the config for the request */
    const config_postAnswer = { method: 'post', url: url_postAnswer, headers: headers, data: data };

    /* Axios request to post an answer */
    let answerQuestionPromise = new Promise((resolve, reject) => {
        
        axios(config_postAnswer)
        /* if result status < 400 */
        .then(result => {
            req.flash('messages', { type: result.data.type, value: result.data.message }); 
            resolve(); 
        })
        /* if result status > 400 */
        .catch(err => { 
            /* Service Unavailable */
            if (err.code === 'ECONNREFUSED') {
                isOK = false; 
                req.flash('messages', { type: 'error', value: 'The service is down. Please try again later.' });
            }

            /* any other error */
            else req.flash('messages', { type: err.response.data.type, value: err.response.data.message });

            resolve(); 
        });
    });

    /* after making the request to post an answer, if something went wrong redirect to the 1st page of that question else redirect to the page that user was */
    answerQuestionPromise.then( () => {
    
        if (!isOK) return res.redirect('/questions/show?page=1');
        res.redirect('/questions/' + req.params.id + '?page=' + page) ;
    });
}