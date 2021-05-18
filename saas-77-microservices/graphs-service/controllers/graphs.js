// require models
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);
// end of require models

const qsPerKeywordData = require('../utils/qsPerKeywordData');
const qsPerDayData = require('../utils/qsPerDayData');

exports.topKeywords = (req, res, next) => {

    let qsPerKWTop5 = [], qsPerKWName = [], qsPerKWFreq = [];
    
    qsPerKeywordData().then(result => {

        qsPerKWTop5 = result.topFiveKeywords;
        qsPerKWName = result.name;
        qsPerKWFreq = result.frequency;

        return res.status(200).json({ 
            topFiveKeywords: qsPerKWTop5,
            topKeywords: qsPerKWName,
            topKeywordsFreq: qsPerKWFreq
        })

    })

}

exports.QsPerDay = (req, res, next) => {
    
    let qsPerDayDates = [], qsPerDayFreq = [];
    
    qsPerDayData().then(result => {
        qsPerDayDates = result.dates;
        qsPerDayFreq = result.frequency;

        return res.status(200).json({ 
            qsPerDayDates: qsPerDayDates,
            qsPerDayFreq: qsPerDayFreq
        })
    })

}

exports.events = (req, res, next) => {

    const type = req.body.type;

    if (type === 'QUESTION CREATE') {

        let qkeywords = req.body.qkeywords;

        models.Questions.create({
            dateCreated: req.body.dateCreated,
        })
        .then(question => {
            let insertKeywords = new Promise((resolve, reject) => {
                qkeywords.forEach((keywordName, index) => {
                    if(keywordName !== "") {
                        models.Keywords.create({
                            name: keywordName,
                            QuestionsId: question.id
                        })
                        .catch(err => console.log(err))
                    }
                    if (index === qkeywords.length - 1) return resolve(true);
                });
            });
            
            insertKeywords.then(() => { 
                res.status(200).json({});
            });
        })
    }
    else {
        res.status(200).json({});
    }

}