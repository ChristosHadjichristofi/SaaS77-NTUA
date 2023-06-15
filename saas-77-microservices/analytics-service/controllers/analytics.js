const jwt_decode = require('jwt-decode');

// require models
const createSequelizeInstance = require('../utils/database');

const calcDays = require('../utils/calcDays');

exports.stats = async (req, res, next) => {
  try {
    let totalQuestions, totalAnswers, daysRegistered, contributions;

    /* retrieve user data from AUTH Header */
    const userData = jwt_decode(req.header('X-OBSERVATORY-AUTH'));

    // Create the Sequelize instance
    const sequelize = await createSequelizeInstance();

    // Initialize Sequelize models
    const initModels = require("../models/init-models");
    const models = initModels(sequelize);

    /* retrieve all questions and answers that user with id userData.user.id submitted */
    let analyticsPromise = new Promise((resolve, reject) => {
      models.Users.findAll({ raw: true, where: { id: userData.user.id } })
        .then(row => {
          totalQuestions = row[0].questions;
          totalAnswers = row[0].answers;
          resolve();
        })
        .catch(err => {
          return res.status(500).json({ message: 'Internal server error', type: 'error' });
        });
    });

    /* after retrieving all data from analyticsPromise calculate days registered and contributions */
    Promise.all([analyticsPromise]).then(() => {

      daysRegistered = calcDays(Date.now(), new Date(userData.user.dateCreated));

      contributions = totalAnswers / daysRegistered;

      /* return response of status OK and json object containing all necessary info the frontend needs */
      return res.status(200).json({
        totalQuestions: totalQuestions,
        totalAnswers: totalAnswers,
        daysRegistered: daysRegistered,
        contributions: contributions.toFixed(2),
      });

    })
      .catch(err => {
        return res.status(500).json({ message: 'Internal server error', type: 'error' });
      });

  } catch (error) {
    console.error("Error retrieving stats:", error);
    return res.status(500).json({ message: 'Internal server error', type: 'error' });
  }
};

/* events route (subscriber on bus events - QUESTION CREATE/ ANSWER CREATE/ USER CREATE) */
exports.events = async (req, res, next) => {
  try {
    const type = req.body.type;

    // Create the Sequelize instance
    const sequelize = await createSequelizeInstance();

    // Initialize Sequelize models
    const initModels = require("../models/init-models");
    const models = initModels(sequelize);

    /* increment the events counter (how many events this service processed) */
    models.Events.increment('counter', { by: 1, where: { id: 1 } })
      .then(() => {

        /* Based on which Type of event is the service has a specific behaviour */
        if (type === 'QUESTION CREATE') {

          models.Users.increment('questions', { by: 1, where: { id: req.body.usersId } })
            .then(() => res.status(200).json({}))
            .catch(() => res.status(500).json({ message: 'Internal server error', type: 'error' }));

        } else if (type === 'ANSWER CREATE') {

          models.Users.increment('answers', { by: 1, where: { id: req.body.usersId } })
            .then(() => res.status(200).json({}))
            .catch(() => res.status(500).json({ message: 'Internal server error', type: 'error' }));

        } else if (type === 'USER CREATE') {

          models.Users.create({ id: req.body.usersId, questions: 0, answers: 0 })
            .then(() => res.status(200).json({}))
            .catch(() => res.status(500).json({ message: 'Internal server error', type: 'error' }));

        } else {
          res.status(200).json({});
        }

      })
      .catch(() => res.status(500).json({ message: 'Internal server error', type: 'error' }));

  } catch (error) {
    console.error("Error processing events:", error);
    return res.status(500).json({ message: 'Internal server error', type: 'error' });
  }
};

/** function that returns the status of this specific service 
 * tries sequelize.authenticate. If successful then connection to database is OK
 * else its not OK
 */
exports.status = async (req, res, next) => {
  try {
    // Create the Sequelize instance
    const sequelize = await createSequelizeInstance();

    sequelize.authenticate()
      .then(() => res.status(200).json({ service: 'Analytics', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - OK' }))
      .catch(err => res.status(200).json({ service: 'Analytics', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - FAILED' }));

  } catch (error) {
    console.error("Error retrieving service status:", error);
    return res.status(500).json({ message: 'Internal server error', type: 'error' });
  }
};
