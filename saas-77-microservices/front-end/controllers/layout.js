const jwt_decode = require('jwt-decode');
const encrypt = require('../utils/encrypt');
const axios = require('axios');

exports.getLanding = (req, res, next) => {

    let resultKeywords, resultQsPerDay, isOK = true;

    /* Construct url of Graphs Service (2 endpoints -> 1 for each graph) */
    const url_keywords = 'http://localhost:4005/topkeywords';
    const url_qsperday = 'http://localhost:4005/qsperday';

    /* Necessary Headers for the request */
    const headers = { "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) };

    /* Create the configs of the requests */
    const config_keywords = { method: 'get', url: url_keywords, headers: headers };
    const config_qsperday = { method: 'get', url: url_qsperday, headers: headers };

    /* Axios request to get data from graphs service - questions per keyword data */
    let qsPerKeywordsDataPromise = new Promise((resolve, reject) => {
        axios(config_keywords)
        .then(result => { resultKeywords = result; resolve(); })
        .catch(err => { isOK = false; resolve(); });
    })

    /* Axios request to get data from graphs service - questions per day data */
    let qsPerDayPromise = new Promise((resolve, reject) => {
        axios(config_qsperday)
        .then(result => { resultQsPerDay = result; resolve(); })
        .catch(err => { isOK = false; resolve(); });
    })

    /* After all requests finished and data is now retrieved render the data */
    Promise.all([qsPerKeywordsDataPromise, qsPerDayPromise]).then(() => {
        let messages = req.flash("messages");
        
        if (messages.length == 0) messages = [];

        res.render('landing.ejs', {
            pageTitle: "Landing Page",
            topKeywords: isOK ? resultKeywords.data.topKeywords : 0,
            topKeywordsFreq: isOK ? resultKeywords.data.topKeywordsFreq : 0,
            qsPerDayDates: isOK ? resultQsPerDay.data.qsPerDayDates : 0,
            qsPerDayFreq: isOK ? resultQsPerDay.data.qsPerDayFreq : 0,
            serviceUp: isOK,
            messages: messages
        })

    })
}


exports.getProfile = function(req, res, next) {
    
    let totalQuestions, totalAnswers, userQuestions, contributions, isOK_Analytics = true, isOK_Browse = true, daysRegistered;
    
    // get service down messages from sessions, because when redirecting messages cant be sent.
    const serviceDownMessages = req.session.messages || [];

    // in case req.session.messages is undefined
    if (!req.session.messages) req.session.messages = [];

    // in case req.session.messages has messages, we got them so we need to empty the req.session.messages
    if (serviceDownMessages.length !== 0) req.session.messages = [];

    /* decode the jwt to get userData */
    const userData = jwt_decode(req.session.user.jwtToken);

    /* Construct the url of analytics service (user statistics) */
    const url_analytics = 'http://localhost:4004/analytics';
    /* Construct the url of browse Questions service to get all the questions that this user did */
    const url_userQuestions = 'http://localhost:4003/questions/user/' + userData.user.id;

    /* Add necessary headers for the requests */
    const headers = { 
        'X-OBSERVATORY-AUTH': req.session.user.jwtToken,
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) 
    };

    /* Create the configs for the requests */
    const config_analytics = { method: 'get', url: url_analytics, headers: headers };
    const config_userQuestions = { method: 'get', url: url_userQuestions, headers: headers };

    /* Request to get User statistics */
    let analyticsPromise = new Promise((resolve, reject) => {
        axios(config_analytics)
        .then(result => {
            totalQuestions = result.data.totalQuestions; 
            totalAnswers = result.data.totalAnswers;
            contributions = result.data.contributions;
            daysRegistered = result.data.daysRegistered;
            resolve(); 
        })
        .catch(err => { isOK_Analytics = false; resolve(); });
    })

    /* Request to get all the questions this specific user did (the logged in user) */
    let userQuestionsPromise = new Promise((resolve, reject) => {
        axios(config_userQuestions)
        .then(result => {
            userQuestions = result.data.questions;
            resolve();
        })
        .catch(err => { isOK_Browse = false; resolve(); });
    })
    
    /* After all data is retrieved render the page */
    Promise.all([analyticsPromise, userQuestionsPromise]).then(() => {

        let messages = req.flash("messages");

        messages = serviceDownMessages.length !== 0 ? messages.concat(serviceDownMessages) : messages;

        if (messages.length == 0) messages = [];

        res.render('profile.ejs', {
            pageTitle: "Profile Page",
            totalQuestions: isOK_Analytics ? totalQuestions : 0,
            totalAnswers: isOK_Analytics ? totalAnswers : 0,
            contributions: isOK_Analytics ? contributions : 0,
            questions: isOK_Browse ? userQuestions : [],
            serviceUpAnalytics: isOK_Analytics,
            serviceUpBrowse: isOK_Browse,
            daysRegistered: daysRegistered,
            messages: messages
        });
    })

}

exports.getHome = (req, res, next) => {

    let resultKeywords, resultQsPerDay, isOK = true;
    
    // get service down messages from sessions, because when redirecting messages cant be sent.
    const serviceDownMessages = req.session.messages || [];

    // in case req.session.messages is undefined
    if (!req.session.messages) req.session.messages = [];

    // in case req.session.messages has messages, we got them so we need to empty the req.session.messages
    if (serviceDownMessages.length !== 0) req.session.messages = [];

    /* Construct urls to get the graphs (Graphs Service -> 2 endpoints, 1 graph each) */
    const url_keywords = 'http://localhost:4005/topkeywords';
    const url_qsperday = 'http://localhost:4005/qsperday';

    /* Add necessary headers */
    const headers = { "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) };

    /* Create the configs for the requests */
    const config_keywords = { method: 'get', url: url_keywords, headers: headers };
    const config_qsperday = { method: 'get', url: url_qsperday, headers: headers };

    /* Axios request to get data from graphs service - questions per keyword data */
    let qsPerKeywordsDataPromise = new Promise((resolve, reject) => {
        axios(config_keywords)
        .then(result => { resultKeywords = result; resolve(); })
        .catch(err => { isOK = false; resolve(); });
    })

    /* Axios request to get data from graphs service - questions per day data */
    let qsPerDayPromise = new Promise((resolve, reject) => {
        axios(config_qsperday)
        .then(result => { resultQsPerDay = result; resolve(); })
        .catch(err => { isOK = false; resolve(); });
    })

    /* After all requests finished and data is now retrieved render the data */
    Promise.all([qsPerKeywordsDataPromise, qsPerDayPromise]).then(() => {

        let messages = req.flash("messages");

        messages = serviceDownMessages.length !== 0 ? messages.concat(serviceDownMessages) : messages;

        if (messages.length == 0 ) messages = [];

        res.render('home.ejs', {
            pageTitle: "Home Page",
            topKeywords: isOK ? resultKeywords.data.topKeywords : 0,
            topKeywordsFreq: isOK ? resultKeywords.data.topKeywordsFreq : 0,
            qsPerDayDates: isOK ? resultQsPerDay.data.qsPerDayDates : 0,
            qsPerDayFreq: isOK ? resultQsPerDay.data.qsPerDayFreq : 0,
            serviceUp: isOK,
            messages: messages
        })

    })
}

exports.getAbout = (req, res, next) => {
    res.render('about.ejs', {
        pageTitle: "About Page"
    })
}

exports.getDocumentation = (req, res, next) => {
    res.render('documentation.ejs', {
        pageTitle: "Documentation Page"
    })
} 

exports.getContact = (req, res, next) => {
    res.render('contact.ejs', {
        pageTitle: "Contact Us Page"
    })
} 