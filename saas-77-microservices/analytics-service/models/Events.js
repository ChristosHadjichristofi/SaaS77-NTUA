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
        schema: 'saas-77-analytics-service',
        timestamps: false,
    });
};