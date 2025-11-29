'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class EmailLog extends Model {
    static associate(models) {
      // EmailLog belongs to User (recipient)
      EmailLog.belongsTo(models.User, {
        foreignKey: 'recipient_id',
        as: 'recipient'
      });
      
      // EmailLog belongs to User (sender)
      EmailLog.belongsTo(models.User, {
        foreignKey: 'sender_id',
        as: 'sender'
      });
    }
    
    // Static method to log email
    static async logEmail(data) {
      return await this.create({
        recipient_id: data.recipientId,
        recipient_email: data.recipientEmail,
        sender_id: data.senderId,
        email_type: data.emailType,
        subject: data.subject,
        body: data.body,
        entity_type: data.entityType,
        entity_id: data.entityId,
        status: data.status || 'queued',
        metadata: data.metadata
      });
    }
    
    // Instance method to mark as sent
    async markAsSent() {
      this.status = 'sent';
      this.sent_at = new Date();
      await this.save();
    }
    
    // Instance method to mark as failed
    async markAsFailed(errorMessage) {
      this.status = 'failed';
      this.error_message = errorMessage;
      this.retry_count += 1;
      await this.save();
    }
    
    // Instance method to mark as opened
    async markAsOpened() {
      this.status = 'opened';
      this.opened_at = new Date();
      await this.save();
    }
    
    // Static method to get failed emails for retry
    static async getFailedEmails(maxRetries = 3) {
      return await this.findAll({
        where: {
          status: 'failed',
          retry_count: { [sequelize.Sequelize.Op.lt]: maxRetries }
        },
        order: [['created_at', 'ASC']],
        limit: 100
      });
    }
  }
  
  EmailLog.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    recipient_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    recipient_email: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    sender_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    email_type: {
      type: DataTypes.ENUM('scheme', 'job', 'message', 'notification', 'registration', 'approval', 'rejection', 'other'),
      allowNull: false
    },
    subject: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: true
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
      type: DataTypes.ENUM('queued', 'sent', 'failed', 'bounced', 'opened', 'clicked'),
      allowNull: false,
      defaultValue: 'queued'
    },
    sent_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    opened_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    retry_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'EmailLog',
    tableName: 'email_logs',
    underscored: true,
    timestamps: true
  });
  
  return EmailLog;
};