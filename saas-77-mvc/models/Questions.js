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
      type: DataTypes.STRING(255),
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
    UsersId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Questions',
    schema: 'saas-77-mvc',
    timestamps: false,
    indexes: [
      {
        name: "Questions_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};