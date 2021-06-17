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

            models.Questions.create({
                title: parsedData.qname,
                text: parsedData.qtext,
                dateCreated: parsedData.dateCreated,
                keywords: parsedData.qkeywords,
                answers: null,
                UsersId: parsedData.usersId,
                UsersName: parsedData.usersName,
                UsersSurname: parsedData.usersSurname
            })
            .then(() => models.Events.increment('counter', { by: 1, where: { id: 1 } }))
            .catch(err => console.log(err))
    
        }
        else if (type === 'ANSWER CREATE') {

            models.Questions.update(
            
                { 'answers': sequelize.fn('array_append', sequelize.col('answers'), parsedData.answerID )},
                { where: { id: parsedData.questionID } }
            
            )
            .then(() => models.Events.increment('counter', { by: 1, where: { id: 1 } }))
            .catch(err => console.log(err))
        }
        else {
            models.Events.increment('counter', { by: 1, where: { id: 1 } })
            .catch(err => console.log(err))
        }
    })
}