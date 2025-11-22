'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('farmer_profiles', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      gender: {
        type: Sequelize.ENUM('male', 'female', 'other'),
        allowNull: true
      },
      mobile_no: {
        type: Sequelize.STRING(15),
        allowNull: true
      },
      aadhar_no: {
        type: Sequelize.STRING(12),
        allowNull: true,
        unique: true
      },
      dob: {
        type: Sequelize.DATEONLY,
        allowNull: true
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true
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
      passport_photo: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Path to uploaded photo'
      },
      land_area: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Land area in acres or hectares'
      },
      soil_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      source_of_irrigation: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      crops_grown: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Comma-separated or JSON'
      },
      cultivation_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Organic, conventional, mixed'
      },
      crop_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      occupation: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      additional_work_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      crop_owned: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      property_information: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      training_type: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      feedback: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      request_status: {
        type: Sequelize.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending'
      },
      approved_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Admin who approved/rejected'
      },
      approved_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejected_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      rejection_reason: {
        type: Sequelize.TEXT,
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
    await queryInterface.addIndex('farmer_profiles', ['user_id'], { unique: true });
    await queryInterface.addIndex('farmer_profiles', ['request_status']);
    await queryInterface.addIndex('farmer_profiles', ['state_id']);
    await queryInterface.addIndex('farmer_profiles', ['district_id']);
    await queryInterface.addIndex('farmer_profiles', ['taluka_id']);
    await queryInterface.addIndex('farmer_profiles', ['village_id']);
    await queryInterface.addIndex('farmer_profiles', ['aadhar_no'], { unique: true });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('farmer_profiles');
  }
};