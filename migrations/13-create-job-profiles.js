'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('job_profiles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      job_title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      company_name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Company name or Farm name'
      },
      job_type: {
        type: Sequelize.ENUM('full_time', 'part_time', 'seasonal', 'contract', 'temporary'),
        allowNull: false
      },
      location: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      state_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'states',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      district_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'districts',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      taluka_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'talukas',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      village_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'villages',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      salary_min: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      salary_max: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true
      },
      salary_period: {
        type: Sequelize.ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly'),
        allowNull: true,
        defaultValue: 'monthly'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      attachment: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL or path to the attachment (resume/cv/etc)'
      },
      requirements: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Job requirements and qualifications'
      },
      benefits: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Job benefits'
      },
      contact_email: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      contact_phone: {
        type: Sequelize.STRING(15),
        allowNull: true
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
        comment: 'Admin or Super Admin who created this job'
      },
      status: {
        type: Sequelize.ENUM('draft', 'active', 'closed', 'archived'),
        allowNull: false,
        defaultValue: 'draft'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Job posting expiration date'
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

    await queryInterface.addIndex('job_profiles', ['created_by']);
    await queryInterface.addIndex('job_profiles', ['job_type']);
    await queryInterface.addIndex('job_profiles', ['status']);
    await queryInterface.addIndex('job_profiles', ['state_id']);
    await queryInterface.addIndex('job_profiles', ['district_id']);
    await queryInterface.addIndex('job_profiles', ['expires_at']);
    await queryInterface.addIndex('job_profiles', ['created_at']);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('job_profiles');
  }
};