// require models
const sequelize = require('../utils/database');
// end of require models

/** function that returns the status of this specific service 
 * tries sequelize.authenticate. If successful then connection to database is OK
 * else its not OK
 */
module.exports = (req, res, next) => {

    sequelize.authenticate()
    .then(() => res.status(200).json({ service: 'Accounts', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - OK' }))
    .catch(err => res.status(200).json({ service: 'Accounts', status: 'UP', uptime: Math.floor(process.uptime()), database: 'Connection - FAILED' }))

}