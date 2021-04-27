const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('Sessions', {
    sid: {
      type: DataTypes.STRING(255),
      allowNull: false,
      primaryKey: true
    },
    expire: {
      type: DataTypes.ARRAY(DataTypes.DATE),
      allowNull: true
    },
    data: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'Sessions',
    schema: 'saas-77-mvc',
    timestamps: false,
    indexes: [
      {
        name: "Sessions_pkey",
        unique: true,
        fields: [
          { name: "sid" },
        ]
      },
    ]
  });
};
