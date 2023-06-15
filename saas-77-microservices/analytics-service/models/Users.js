/** User Model
 * id -> integer [AI, Not Null, PK]
 * questions -> integer
 * answers -> integer
 */

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Users', {
        id: {
            autoIncrement: true,
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        questions: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        answers: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: 'Users',
        schema: process.env.DB_SCHEMA,
        timestamps: false,
        indexes: [{
            name: "Users_pkey",
            unique: true,
            fields: [
                { name: "id" },
            ]
        }, ]
    });
};