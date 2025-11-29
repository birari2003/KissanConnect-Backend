'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('media', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      file_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Original file name'
      },
      file_path: {
        type: Sequelize.STRING(500),
        allowNull: false,
        comment: 'Stored file path in uploads folder'
      },
      file_size: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'File size in bytes'
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'MIME type of the file'
      },
      media_type: {
        type: Sequelize.ENUM('image', 'pdf', 'video', 'document'),
        allowNull: false
      },
      uploaded_by: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'User who uploaded this media'
      },
      entity_type: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Type of entity this media belongs to (scheme, job, etc.)'
      },
      entity_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'ID of the entity this media belongs to'
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
    
    await queryInterface.addIndex('media', ['uploaded_by']);
    await queryInterface.addIndex('media', ['media_type']);
    await queryInterface.addIndex('media', ['entity_type', 'entity_id']);
    await queryInterface.addIndex('media', ['created_at']);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('media');
  }
};