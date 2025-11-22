'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class MessageRecipient extends Model {
    static associate(models) {
      // MessageRecipient belongs to AdminMessage
      MessageRecipient.belongsTo(models.AdminMessage, {
        foreignKey: 'message_id',
        as: 'message'
      });
      
      // MessageRecipient belongs to User (super admin)
      MessageRecipient.belongsTo(models.User, {
        foreignKey: 'super_admin_id',
        as: 'superAdmin'
      });
    }
    
    // Instance method to mark as read
    async markAsRead() {
      this.is_read = true;
      this.read_at = new Date();
      await this.save();
    }
  }
  
  MessageRecipient.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    message_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    super_admin_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'MessageRecipient',
    tableName: 'message_recipients',
    underscored: true,
    timestamps: true
  });
  
  return MessageRecipient;
};