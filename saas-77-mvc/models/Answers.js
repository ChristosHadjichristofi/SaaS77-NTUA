/** Answers Model
 * id -> integer [PK, AI, Not Null]
 * text -> text [Not Null]
 * dateCreated -> date [Not Null]
 * usersID -> integer (reference from users table) [Not Null]
 * QuestionsId -> integer (reference from questions table table) [Not Null]
 */

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
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
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
    schema: 'saas-77-mvc',
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
