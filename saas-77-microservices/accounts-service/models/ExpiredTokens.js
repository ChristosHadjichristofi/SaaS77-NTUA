const Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('ExpiredTokens', {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          autoIncrement: true,
          primaryKey: true
        },
        token: {
            type: DataTypes.TEXT,
            allowNull: true
        },
      }, {
        sequelize,
        tableName: 'ExpiredTokens',
        schema: 'saas-77-accounts-service',
        timestamps: false,
        indexes: [
          {
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [
              { name: "id" },
            ]
          },
          {
            name: "id_UNIQUE",
            unique: true,
            using: "BTREE",
            fields: [
              { name: "id" },
            ]
          },
        ]
    });
};