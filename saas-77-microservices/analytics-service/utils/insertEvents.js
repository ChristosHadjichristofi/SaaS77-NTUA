// for database
const sequelize = require('../utils/database');
var initModels = require("../models/init-models");
var models = initModels(sequelize);

module.exports = events => {
    console.log(events.data)
    const parsedData = JSON.parse(events.data);

    if (parsedData.type === 'USER CREATE') {
        models.Users.create({ id: parsedData.usersId, questions: 0, answers: 0 })
        .then(() => models.Events.increment('counter', { by: 1, where: { id: 1 } }))
        .catch(err => console.log(err))

    } else if (parsedData.type === 'QUESTION CREATE') {
        models.Users.update({ questions: sequelize.literal('questions + 1') }, { where: { id: parsedData.usersId }})
        .then(() => models.Events.increment('counter', { by: 1, where: { id: 1 } }))
        .catch(err => console.log(err))

    } else if (parsedData.type === 'ANSWER CREATE') {
        models.Users.update({ answers: sequelize.literal('answers + 1') }, { where: { id: parsedData.usersId }})
        .then(() => models.Events.increment('counter', { by: 1, where: { id: 1 } }))
        .catch(err => console.log(err))
    
    } else {
        models.Events.increment('counter', { by: 1, where: { id: 1 } })
        .catch(err => console.log(err))
    }
}