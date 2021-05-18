const axios = require('axios');

module.exports = (req, res, next) => {
    
    const event = req.body;
    
    const url_answersService = 'http://localhost:4002/events';
    const url_browseQuestionsService = 'http://localhost:4003/events';
    const url_analyticsService = 'http://localhost:4004/events';
    const url_graphsService = 'http://localhost:4005/events';

    const data = event;
    let responses = [];

    const config_answersService = { method: 'post', url: url_answersService, headers: { 'X-OBSERVATORY-AUTH': req.header('X-OBSERVATORY-AUTH') }, data: data };
    const config_browseQuestionsService = { method: 'post', url: url_browseQuestionsService, headers: { 'X-OBSERVATORY-AUTH': req.header('X-OBSERVATORY-AUTH') }, data: data };
    const config_analyticsService = { method: 'post', url: url_analyticsService, headers: { 'X-OBSERVATORY-AUTH': req.header('X-OBSERVATORY-AUTH') }, data: data };
    const config_graphsService = { method: 'post', url: url_graphsService, headers: { 'X-OBSERVATORY-AUTH': req.header('X-OBSERVATORY-AUTH') }, data: data };

    let answersServicePromise = new Promise((resolve, reject) => { 

        axios(config_answersService)
        .then(result => { responses.push({ status: 200, message: 'OK - ANSWERS SERVICE.' } ); return resolve(); })
        .catch(err => { responses.push({ status: 500, message: 'NOT OK - ANSWERS SERVICE.' } ); return resolve(); });
    
    })
    
    let browseQuestionsServicePromise = new Promise((resolve, reject) => { 

        axios(config_browseQuestionsService)
        .then(result => { responses.push({ status: 200, message: 'OK - BROWSE QUESTIONS SERVICE.' } ); return resolve(); })
        .catch(err => { responses.push({ status: 500, message: 'NOT OK - BROWSE QUESTIONS SERVICE.' } ); return resolve(); });
    })

    let analyticsServicePromise = new Promise((resolve, reject) => { 
        axios(config_analyticsService)
        .then(result => { responses.push({ status: 200, message: 'OK - ANALYTICS SERVICE.' } ); return resolve(); })
        .catch(err => { responses.push({ status: 500, message: 'NOT OK - ANALYTICS SERVICE.' } ); return resolve(); });
    })

    let graphsServicePromise = new Promise((resolve, reject) => { 
        
        axios(config_graphsService)
        .then(result => { responses.push({ status: 200, message: 'OK - GRAPHS SERVICE.' } ); return resolve(); })
        .catch(err => { responses.push({ status: 500, message: 'NOT OK - GRAPHS SERVICE.' } ); return resolve(); });
    })

    Promise.all([answersServicePromise, browseQuestionsServicePromise, analyticsServicePromise, graphsServicePromise]).then(() => {
        
        let isOK = true;

        responses.forEach(el => {
            isOK = (el.status == 200 && isOK) ? true : false;
        });
        return res.status(200).json({ message: (isOK) ? 'OK' : 'NOT OK' })
    })
}