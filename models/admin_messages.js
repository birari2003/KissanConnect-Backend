'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class AdminMessage extends Model {
    static associate(models) {
      // AdminMessage belongs to User (admin)
      AdminMessage.belongsTo(models.User, {
        foreignKey: 'admin_id',
        as: 'admin'
      });
      
      // AdminMessage has many MessageRecipients
      AdminMessage.hasMany(models.MessageRecipient, {
        foreignKey: 'message_id',
        as: 'recipients'
      });
      
      // Many-to-Many with Users through MessageRecipients
      AdminMessage.belongsToMany(models.User, {
        through: models.MessageRecipient,
        foreignKey: 'message_id',
        otherKey: 'super_admin_id',
        as: 'superAdmins'
      });
    }
  }
  
  AdminMessage.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'AdminMessage',
    tableName: 'admin_messages',
    underscored: true,
    timestamps: true
  });
  
  return AdminMessage;
};