'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('activity_logs', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'User who performed the action'
      },
      action: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Type of action performed (email_sent, job_created, scheme_published, etc.)'
      },
      entity_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Type of entity affected (user, job, scheme, etc.)'
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID of the entity affected'
      },
      status: {
        type: Sequelize.ENUM('success', 'failed', 'pending'),
        allowNull: false,
        defaultValue: 'success'
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Description of the action or result'
      },
      error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error message if action failed'
      },
      error_stack: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Error stack trace for debugging'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Additional data related to the action (JSON format)'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP address of the user'
      },
      user_agent: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Browser/device user agent'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    
    await queryInterface.addIndex('activity_logs', ['user_id']);
    await queryInterface.addIndex('activity_logs', ['action']);
    await queryInterface.addIndex('activity_logs', ['entity_type', 'entity_id']);
    await queryInterface.addIndex('activity_logs', ['status']);
    await queryInterface.addIndex('activity_logs', ['created_at']);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('activity_logs');
  }
};