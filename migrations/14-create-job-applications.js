'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('job_applications', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      job_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'job_profiles',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      applicant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Super Admin who applied'
      },
      cover_letter: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      resume_path: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Path to uploaded resume'
      },
      status: {
        type: Sequelize.ENUM('applied', 'under_review', 'shortlisted', 'rejected', 'accepted', 'withdrawn'),
        allowNull: false,
        defaultValue: 'applied'
      },
      applied_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Internal notes about the application'
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
    
    await queryInterface.addIndex('job_applications', ['job_id']);
    await queryInterface.addIndex('job_applications', ['applicant_id']);
    await queryInterface.addIndex('job_applications', ['job_id', 'applicant_id'], { unique: true });
    await queryInterface.addIndex('job_applications', ['status']);
    await queryInterface.addIndex('job_applications', ['applied_at']);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('job_applications');
  }
};