// for database
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);

module.exports = events => {

    let type;

    events.forEach(({ id, data }) => {
        
        let parsedData = JSON.parse(data);

        type = parsedData.type;

        if (type === 'QUESTION CREATE') {

            models.Questions.create({
                title: parsedData.qname,
                text: parsedData.qtext,
                dateCreated: parsedData.dateCreated,
                keywords: parsedData.qkeywords,
                UsersId: parsedData.usersId,
                UsersName: parsedData.usersName,
                UsersSurname: parsedData.usersSurname
            })
            .then(() => models.Events.increment('counter', { by: 1, where: { id: 1 } }))
            .catch(err => console.log(err))
    
        }
        else if (type === 'ANSWER CREATE' && process.env.TESTING === 'On') {

            models.Answers.create({
                text: parsedData.text,
                dateCreated: parsedData.dateCreated,
                UsersId: parsedData.usersId,
                UsersName: parsedData.usersName,
                UsersSurname: parsedData.usersSurname,
                QuestionsId: parsedData.questionID

            })
            .then(() => models.Events.increment('counter', { by: 1, where: { id: 1 } }))
            .catch(err => console.log(err))
        }
        else {
            models.Events.increment('counter', { by: 1, where: { id: 1 } })
            .catch(err => console.log(err))
        }
    })
}