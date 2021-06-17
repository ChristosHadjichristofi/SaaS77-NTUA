/** Questions Model
 * id -> integer [PK, AI, Not Null]
 * dateCreated -> date [Not Null]
 */

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Questions', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        dateCreated: {
            type: DataTypes.DATE,
            allowNull: false
        },

    }, {
        sequelize,
        tableName: 'Questions',
        schema: 'saas-77-graphs-service',
        timestamps: false,
        indexes: [{
            name: "Questions_pkey",
            unique: true,
            fields: [
                { name: "id" },
            ]
        }, ]
    });
};