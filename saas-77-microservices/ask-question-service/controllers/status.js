// require models
const sequelize = require('../utils/database');
// end of require models

module.exports = (req, res, next) => {

    sequelize.authenticate()
    .then(() => res.status(200).json({ service: 'Create Question', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - OK' }))
    .catch(err => res.status(200).json({ service: 'Create Question', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - FAILED' }))

}