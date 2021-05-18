const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Answers', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
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
      allowNull: false
    },
    UsersName: {
      type: DataTypes.STRING(40),
      allowNull: false
    },
    UsersSurname: {
        type: DataTypes.STRING(60),
        allowNull: false,
    },
    QuestionsId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Questions',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'Answers',
    schema: 'saas-77-answers-service',
    timestamps: false,
    indexes: [
      {
        name: "Answers_pkey",
        unique: true,
        fields: [
          { name: "id" },
        ]
      },
    ]
  });
};
