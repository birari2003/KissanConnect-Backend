'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class ActivityLog extends Model {
    static associate(models) {
      // ActivityLog belongs to User
      ActivityLog.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
    
    // Static method to log activity
    static async log(data) {
      return await this.create({
        user_id: data.userId,
        action: data.action,
        entity_type: data.entityType,
        entity_id: data.entityId,
        status: data.status || 'success',
        message: data.message,
        error_message: data.errorMessage,
        error_stack: data.errorStack,
        metadata: data.metadata,
        ip_address: data.ipAddress,
        user_agent: data.userAgent
      });
    }
    
    // Static method to log success
    static async logSuccess(userId, action, message, metadata = null) {
      return await this.log({
        userId,
        action,
        status: 'success',
        message,
        metadata
      });
    }
    
    // Static method to log error
    static async logError(userId, action, error, metadata = null) {
      return await this.log({
        userId,
        action,
        status: 'failed',
        error_message: error.message,
        error_stack: error.stack,
        metadata
      });
    }
  }
  
  ActivityLog.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    action: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('success', 'failed', 'pending'),
      allowNull: false,
      defaultValue: 'success'
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    error_stack: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'ActivityLog',
    tableName: 'activity_logs',
    underscored: true,
    timestamps: false
  });
  
  return ActivityLog;
};