/** Keywords Model
 * name -> string(50) [PK, Not Null]
 * QuestionsId -> integer (reference to Questions model) [Not Null, PK]
 */

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Keywords', {
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
            primaryKey: true
        },
        QuestionsId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            references: {
                model: 'Questions',
                key: 'id'
            }
        }
    }, {
        sequelize,
        tableName: 'Keywords',
        schema: 'saas-77-graphs-service',
        timestamps: false,
        indexes: [{
            name: "Keywords_pkey",
            unique: true,
            fields: [
                { name: "name" },
                { name: "QuestionsId" },
            ]
        }, ]
    });
};