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

            models.Users.increment('questions', { by: 1, where: { id: parsedData.usersId } })
            .then(() => models.Events.increment('counter', { by: 1, where: { id: 1 } }))
            .catch(err => console.log(err))
    
        } else if (type === 'ANSWER CREATE') {
    
            models.Users.increment('answers', { by: 1, where: { id: parsedData.usersId } })
            .then(() => models.Events.increment('counter', { by: 1, where: { id: 1 } }))
            .catch(err => console.log(err))
    
        } else if (type === 'USER CREATE') {

            models.Users.create({ id: parsedData.usersId, questions: 0, answers: 0 })
            .then(() => models.Events.increment('counter', { by: 1, where: { id: 1 } }))
            .catch(err => console.log(err))
    
        }
    })
}