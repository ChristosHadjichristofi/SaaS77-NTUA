/** Events Model
 * id -> integer [PK]
 * data -> text 
 */

const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Events', {
    data: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Events',
    schema: process.env.DB_SCHEMA,
    timestamps: false,
  });
};
