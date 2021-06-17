// for database
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);

/* function that processes events and adds them to database or rejects them */
/* used every time the services (re)starts so it never loses any event (if was DOWN) */
module.exports = events => {

    let type;

    events.forEach(({ id, data }) => {
        
        let parsedData = JSON.parse(data);

        type = parsedData.type;

        if (type === 'QUESTION CREATE') {

            models.Questions.create({ dateCreated: parsedData.dateCreated })
            .then(question => {
                let insertKeywords = new Promise((resolve, reject) => {
                    parsedData.qkeywords.forEach((keywordName, index) => {
                        if(keywordName !== "") {
                            models.Keywords
                            .create({ name: keywordName, QuestionsId: question.id })
                            .catch(err => console.log(err))
                        }                        
                        if (index ===  parsedData.qkeywords.length - 1) return resolve(true);
                    });
                });
                insertKeywords.then(() => models.Events.increment('counter', { by: 1, where: { id: 1 } }))
                .catch(err => console.log(err))
            })
            .catch(err => console.log(err))
        }
        else {
            models.Events.increment('counter', { by: 1, where: { id: 1 } })
            .catch(err => console.log(err))
        }
    })
}