/** Events Model
 * this model is used as a counter to keep how many events the specific service parsed and processed
 * counter -> integer [default: 0]
 */

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Events', {
        counter: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
    }, {
        sequelize,
        tableName: 'Events',
        schema: process.env.DB_SCHEMA,
        timestamps: false,
    });
};