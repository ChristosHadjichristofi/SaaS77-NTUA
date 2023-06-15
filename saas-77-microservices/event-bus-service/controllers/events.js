const axios = require('axios');
const jwt_decode = require('jwt-decode');
const encrypt = require('../utils/encrypt');

// for database
const { Op } = require('sequelize');
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);

/* endpoint that notifies all subscribers for new events */
/* This endpoint logs every step and response of this process */
exports.postEvents = (req, res, next) => {
    
    const event = req.body;

    console.log(`Event of Type: ${event.type} received.`);

    /* 
        Save the new Event to the database so as if any service (re)starts can
        check if it lost any data(events) 
    */
    models.Events.create({ data: JSON.stringify(event) })
    .then(() => {

        /* Subscribers endpoints */
        const url_answersService = `http://${process.env.BASE_URL}:4002/events`;
        const url_browseQuestionsService = `http://${process.env.BASE_URL}:4003/events`;
        const url_analyticsService = `http://${process.env.BASE_URL}:4004/events`;
        const url_graphsService = `http://${process.env.BASE_URL}:4005/events`;
    
        const data = event;
        /* Every response of all subscribers will be saved in this array and then will be logged */
        let responses = [];
    
        /* Necessary headers to make any request to any of the subscribers */
        const headers = { 
            'X-OBSERVATORY-AUTH': req.header('X-OBSERVATORY-AUTH'),
            "CUSTOM-SERVICES-HEADER": JSON.stringify(encrypt(process.env.SECRET_STRING_SERVICES)) 
        };
    
        /* Configs of the subscribers */
        const config_answersService = { method: 'post', url: url_answersService, headers: headers, data: data };
        const config_browseQuestionsService = { method: 'post', url: url_browseQuestionsService, headers: headers, data: data };
        const config_analyticsService = { method: 'post', url: url_analyticsService, headers: headers, data: data };
        const config_graphsService = { method: 'post', url: url_graphsService, headers: headers, data: data };
    
        /* Use promises to make all requests and then proceed */
        let answersServicePromise = new Promise((resolve, reject) => { 
            
            console.log(`Try sending the Event to Subscriber: Answers Service.`);

            axios(config_answersService)
            .then(result => { responses.push({ status: 200, message: 'OK - ANSWERS SERVICE.' } ); return resolve(); })
            .catch(err => { responses.push({ status: 500, message: 'NOT OK - ANSWERS SERVICE.' } ); return resolve(); });
        
        })
        
        let browseQuestionsServicePromise = new Promise((resolve, reject) => { 

            console.log(`Try sending the Event to Subscriber: Browse Questions Service.`);

            axios(config_browseQuestionsService)
            .then(result => { responses.push({ status: 200, message: 'OK - BROWSE QUESTIONS SERVICE.' } ); return resolve(); })
            .catch(err => { responses.push({ status: 500, message: 'NOT OK - BROWSE QUESTIONS SERVICE.' } ); return resolve(); });
        })
    
        let analyticsServicePromise = new Promise((resolve, reject) => {

            console.log(`Try sending the Event to Subscriber: Analytics Service.`);

            axios(config_analyticsService)
            .then(result => { responses.push({ status: 200, message: 'OK - ANALYTICS SERVICE.' } ); return resolve(); })
            .catch(err => { responses.push({ status: 500, message: 'NOT OK - ANALYTICS SERVICE.' } ); return resolve(); });
        })
    
        let graphsServicePromise = new Promise((resolve, reject) => { 
            
            console.log(`Try sending the Event to Subscriber: Graphs Service.`);

            axios(config_graphsService)
            .then(result => { responses.push({ status: 200, message: 'OK - GRAPHS SERVICE.' } ); return resolve(); })
            .catch(err => { responses.push({ status: 500, message: 'NOT OK - GRAPHS SERVICE.' } ); return resolve(); });
        })
    
        /* After all subscribers notified, their responses will be logged so as the admin can see if something went wrong */
        Promise.all([answersServicePromise, browseQuestionsServicePromise, analyticsServicePromise, graphsServicePromise]).then(() => {
            
            let isOK = true;
    
            responses.forEach((el, index) => {
                
                console.log(`Response ${index + 1}: ${el.message}`);

                isOK = (el.status == 200 && isOK) ? true : false;
            });
            return res.status(200).json({ message: (isOK) ? 'OK' : 'NOT OK' })
        })
        .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }))
    })
    .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }))
}

/* Endpoint to get all Events that their id is greater than th request param id */
exports.getEvents = (req, res, next) => {

    let id = req.params.id;
    
    const serviceData = jwt_decode(req.header('X-OBSERVATORY-AUTH'));
    
    console.log(`Received request from ${serviceData.service} Subscriber to fetch Events of ID greater than ${id}.`);

    models.Events.findAll({ 
        raw: true, 
        where: { 
            id: { [Op.gt]: id }
        } 
    })
    .then(events => res.status(200).json({ events: events }))
    .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }))

}