'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('government_schemes', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      attachment: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL or path to the attachment (pdf/image)'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Admin or Super Admin who created this scheme'
      },
      target_audience: {
        type: Sequelize.ENUM('all', 'farmers', 'super_admins', 'farmers_and_super_admins'),
        allowNull: false,
        defaultValue: 'all',
        comment: 'Who should receive this scheme'
      },
      status: {
        type: Sequelize.ENUM('draft', 'published', 'archived'),
        allowNull: false,
        defaultValue: 'draft'
      },
      published_at: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.addIndex('government_schemes', ['created_by']);
    await queryInterface.addIndex('government_schemes', ['target_audience']);
    await queryInterface.addIndex('government_schemes', ['status']);
    await queryInterface.addIndex('government_schemes', ['published_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('government_schemes');
  }
};