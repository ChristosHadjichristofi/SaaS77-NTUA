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
        schema: 'saas-77-answers-service',
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