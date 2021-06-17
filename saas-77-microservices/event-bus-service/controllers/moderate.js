const axios = require('axios');
const jwt = require('jsonwebtoken');
const encrypt = require('../utils/encrypt');
const chalk = require("chalk");

/* Endpoint to moderate all subscribers */
/* Make request to all subscribers, get their answers and log them  */
exports.moderateSubs = () => {

    console.log(chalk.yellow(`-------------------`))
    console.log(chalk.yellow(`Subscribers Status:`));
    console.log(chalk.yellow(`-------------------`))

    const url_answersService = 'http://localhost:4002/status';
    const url_browseQuestionsService = 'http://localhost:4003/status';
    const url_analyticsService = 'http://localhost:4004/status';
    const url_graphsService = 'http://localhost:4005/status';

    let responses = [];
    
    const token = jwt.sign({ service: 'Event Bus' }, process.env.SECRET_JWT, { expiresIn: '20s' });
    const headers = { 
        'X-OBSERVATORY-AUTH': token,
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) 
    };

    const config_answersService = { method: 'get', url: url_answersService, headers: headers };
    const config_browseQuestionsService = { method: 'get', url: url_browseQuestionsService, headers: headers };
    const config_analyticsService = { method: 'get', url: url_analyticsService, headers: headers };
    const config_graphsService = { method: 'get', url: url_graphsService, headers: headers };

    let answersServicePromise = new Promise((resolve, reject) => { 
            
        axios(config_answersService)
        .then(result => { responses.push( result.data ); return resolve(); })
        .catch(err => { responses.push({ service: 'Answers', status: 'DOWN', uptime: 0, database: 'Unknown state' } ); return resolve(); });
    
    })
    
    let browseQuestionsServicePromise = new Promise((resolve, reject) => { 

        axios(config_browseQuestionsService)
        .then(result => { responses.push( result.data ); return resolve(); })
        .catch(err => { responses.push({ service: 'Browse Questions', status: 'DOWN', uptime: 0, database: 'Unknown state' } ); return resolve(); });
    })

    let analyticsServicePromise = new Promise((resolve, reject) => {

        axios(config_analyticsService)
        .then(result => { responses.push( result.data ); return resolve(); })
        .catch(err => { responses.push({ service: 'Analytics', status: 'DOWN', uptime: 0, database: 'Unknown state' } ); return resolve(); });
    })

    let graphsServicePromise = new Promise((resolve, reject) => { 
        
        axios(config_graphsService)
        .then(result => { responses.push( result.data ); return resolve(); })
        .catch(err => { responses.push({ service: 'Graphs', status: 'DOWN', uptime: 0, database: 'Unknown state' } ); return resolve(); });
    })

    Promise.all([answersServicePromise, browseQuestionsServicePromise, analyticsServicePromise, graphsServicePromise]).then(() => {
        
        let isOK = true;

        responses.forEach((el, index) => {
            
            console.log(`${index + 1}. Response from: ${el.service} Service
            Status: ${el.status == 'DOWN' ? chalk.red(`${el.status}`) : chalk.green(`${el.status}`)}
            Uptime: ${el.uptime == '0' ? '-' : el.uptime + 'seconds'}
            Database: ${el.database == 'Connection - OK' ? chalk.green(`${el.database}`) : chalk.red(`${el.database}`)}`);

        });
    })
    .catch(err => console.log(err));

}

/* Endpoint to moderate all Services of our System */
/* Make request to all Services, get their answers and log them  */
exports.moderateServices = () => {

    console.log(chalk.yellow(`-------------------`))
    console.log(chalk.yellow(`Services Status:`));
    console.log(chalk.yellow(`-------------------`))

    const url_accountsService = 'http://localhost:4000/status';
    const url_createQuestionService = 'http://localhost:4001/status';
    const url_answersService = 'http://localhost:4002/status';
    const url_browseQuestionsService = 'http://localhost:4003/status';
    const url_analyticsService = 'http://localhost:4004/status';
    const url_graphsService = 'http://localhost:4005/status';

    let responses = [];
    
    const token = jwt.sign({ service: 'Event Bus' }, process.env.SECRET_JWT, { expiresIn: '20s' });
    const headers = { 
        'X-OBSERVATORY-AUTH': token,
        "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) 
    };
    const config_accountsService = { method: 'get', url: url_accountsService, headers: headers };
    const config_createQuestionService = { method: 'get', url: url_createQuestionService, headers: headers };
    const config_answersService = { method: 'get', url: url_answersService, headers: headers };
    const config_browseQuestionsService = { method: 'get', url: url_browseQuestionsService, headers: headers };
    const config_analyticsService = { method: 'get', url: url_analyticsService, headers: headers };
    const config_graphsService = { method: 'get', url: url_graphsService, headers: headers };

    let accountsServicePromise = new Promise((resolve, reject) => { 
            
        axios(config_accountsService)
        .then(result => { responses.push( result.data ); return resolve(); })
        .catch(err => { responses.push({ service: 'Accounts', status: 'DOWN', uptime: 0, database: 'Unknown state' } ); return resolve(); });
    
    })

    let createQuestionServicePromise = new Promise((resolve, reject) => { 
            
        axios(config_createQuestionService)
        .then(result => { responses.push( result.data ); return resolve(); })
        .catch(err => { responses.push({ service: 'Create Question', status: 'DOWN', uptime: 0, database: 'Unknown state' } ); return resolve(); });
    
    })

    let answersServicePromise = new Promise((resolve, reject) => { 
            
        axios(config_answersService)
        .then(result => { responses.push( result.data ); return resolve(); })
        .catch(err => { responses.push({ service: 'Answers', status: 'DOWN', uptime: 0, database: 'Unknown state' } ); return resolve(); });
    
    })
    
    let browseQuestionsServicePromise = new Promise((resolve, reject) => { 

        axios(config_browseQuestionsService)
        .then(result => { responses.push( result.data ); return resolve(); })
        .catch(err => { responses.push({ service: 'Browse Questions', status: 'DOWN', uptime: 0, database: 'Unknown state' } ); return resolve(); });
    })

    let analyticsServicePromise = new Promise((resolve, reject) => {

        axios(config_analyticsService)
        .then(result => { responses.push( result.data ); return resolve(); })
        .catch(err => { responses.push({ service: 'Analytics', status: 'DOWN', uptime: 0, database: 'Unknown state' } ); return resolve(); });
    })

    let graphsServicePromise = new Promise((resolve, reject) => { 
        
        axios(config_graphsService)
        .then(result => { responses.push( result.data ); return resolve(); })
        .catch(err => { responses.push({ service: 'Graphs', status: 'DOWN', uptime: 0, database: 'Unknown state' } ); return resolve(); });
    })

    Promise.all([accountsServicePromise, createQuestionServicePromise, answersServicePromise, browseQuestionsServicePromise, analyticsServicePromise, graphsServicePromise]).then(() => {
        
        let isOK = true;

        responses.forEach((el, index) => {
            
            console.log(`${index + 1}. Response from: ${el.service} Service
            Status: ${el.status == 'DOWN' ? chalk.red(`${el.status}`) : chalk.green(`${el.status}`)}
            Uptime: ${el.uptime == '0' ? '-' : el.uptime + 'seconds'}
            Database: ${el.database == 'Connection - OK' ? chalk.green(`${el.database}`) : chalk.red(`${el.database}`)}`);

        });
    })
    .catch(err => console.log(err));

}