'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('email_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      recipient_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who received the email'
      },
      recipient_email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Email address where email was sent'
      },
      sender_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who sent the email'
      },
      email_type: {
        type: Sequelize.ENUM('scheme', 'job', 'message', 'notification', 'registration', 'approval', 'rejection', 'other'),
        allowNull: false,
        comment: 'Type of email sent'
      },
      subject: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      body: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Email body content'
      },
      entity_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Related entity type (scheme, job, etc.)'
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Related entity ID'
      },
      status: {
        type: Sequelize.ENUM('queued', 'sent', 'failed', 'bounced', 'opened', 'clicked'),
        allowNull: false,
        defaultValue: 'queued'
      },
      sent_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      opened_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error message if email failed'
      },
      retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Number of retry attempts'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional email metadata'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
      }
    });
    
    await queryInterface.addIndex('email_logs', ['recipient_id']);
    await queryInterface.addIndex('email_logs', ['recipient_email']);
    await queryInterface.addIndex('email_logs', ['sender_id']);
    await queryInterface.addIndex('email_logs', ['email_type']);
    await queryInterface.addIndex('email_logs', ['status']);
    await queryInterface.addIndex('email_logs', ['entity_type', 'entity_id']);
    await queryInterface.addIndex('email_logs', ['created_at']);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('email_logs');
  }
};