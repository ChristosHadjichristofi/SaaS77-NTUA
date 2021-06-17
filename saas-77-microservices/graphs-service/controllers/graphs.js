// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

// queries for the graphs
const qsPerKeywordData = require('../utils/qsPerKeywordData');
const qsPerDayData = require('../utils/qsPerDayData');

exports.topKeywords = (req, res, next) => {

    let qsPerKWTop5 = [], qsPerKWName = [], qsPerKWFreq = [];
    
    // retrieve Top 5 keywords and frequencies
    qsPerKeywordData().then(result => {

        qsPerKWTop5 = result.topFiveKeywords;
        qsPerKWName = result.name;
        qsPerKWFreq = result.frequency;

        // return OK and the json with the keywords and the respective frequencies
        return res.status(200).json({ 
            topFiveKeywords: qsPerKWTop5,
            topKeywords: qsPerKWName,
            topKeywordsFreq: qsPerKWFreq
        })

    })
    .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));

}

exports.QsPerDay = (req, res, next) => {
    
    let qsPerDayDates = [], qsPerDayFreq = [];
    
    // retrieve how many questions where created in the interval [TODAY - 15 DAYS, TODAY]
    qsPerDayData().then(result => {
        qsPerDayDates = result.dates;
        qsPerDayFreq = result.frequency;

        // return OK and the json with the time interval [TODAY - 15 DAYS, TODAY] and their respective frequencies
        return res.status(200).json({ 
            qsPerDayDates: qsPerDayDates,
            qsPerDayFreq: qsPerDayFreq
        })
    })
    .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));

}

/* events route (subscriber on bus events - QUESTION CREATE/ ANSWER CREATE/ USER CREATE) */
exports.events = (req, res, next) => {

    const type = req.body.type;

    /* increment the events counter (how many events this service processed) */
    models.Events.increment('counter', { by: 1, where: { id: 1 } })
    .then(() => {

        /* Based on which Type of event is the service has a specific behaviour */
        if (type === 'QUESTION CREATE') {
    
            let qkeywords = req.body.qkeywords;
    
            models.Questions.create({ dateCreated: req.body.dateCreated })
            .then(question => {
    
                let insertKeywords = new Promise((resolve, reject) => {
                    qkeywords.forEach((keywordName, index) => {
                        
                        if(keywordName !== "") {
                            models.Keywords
                            .create({ name: keywordName, QuestionsId: question.id })
                            .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }))
                        }
                        
                        if (index === qkeywords.length - 1) return resolve(true);
                    
                    });
                });
                
                insertKeywords.then(() => res.status(200).json({}))
                .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));
            })
            .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));
        }
        else res.status(200).json({});
    
    })
    .catch(err => res.status(500).json({ message: 'Internal server error.', type: 'error' }));

}

/** function that returns the status of this specific service 
 * tries sequelize.authenticate. If successful then connection to database is OK
 * else its not OK
 */
exports.status = (req, res, next) => {

    sequelize.authenticate()
    .then(() => res.status(200).json({ service: 'Graphs', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - OK' }))
    .catch(err => res.status(200).json({ service: 'Graphs', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - FAILED' }))

}