/** Questions Model
 * id -> integer [AI, PK, Not Null]
 * title -> text [Not Null]
 * text -> text [Not Null]
 * dateCreated -> date [Not Null]
 * keywords -> array of strings(50) [Not Null]
 * answers -> array of integers
 * usersId -> integer [Not Null]
 * UsersName -> string(40) [Not Null]
 * UsersSurname -> string(60) [Not Null]
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
        title: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        dateCreated: {
            type: DataTypes.DATE,
            allowNull: false
        },
        keywords: {
            type: DataTypes.ARRAY(DataTypes.STRING(50)),
            allowNull: false,
        },
        answers: {
            type: DataTypes.ARRAY(DataTypes.INTEGER),
            allowNull: true,
        },
        UsersId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        UsersName: {
            type: DataTypes.STRING(40),
            allowNull: false,
        },
        UsersSurname: {
            type: DataTypes.STRING(60),
            allowNull: false,
        },

    }, {
        sequelize,
        tableName: 'Questions',
        schema: process.env.DB_SCHEMA,
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