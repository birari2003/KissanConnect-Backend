'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class FarmerProfile extends Model {
    static associate(models) {
      // FarmerProfile belongs to User
      FarmerProfile.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
      
      // FarmerProfile belongs to State
      FarmerProfile.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state'
      });
      
      // FarmerProfile belongs to District
      FarmerProfile.belongsTo(models.District, {
        foreignKey: 'district_id',
        as: 'district'
      });
      
      // FarmerProfile belongs to Taluka
      FarmerProfile.belongsTo(models.Taluka, {
        foreignKey: 'taluka_id',
        as: 'taluka'
      });
      
      // FarmerProfile belongs to Village
      FarmerProfile.belongsTo(models.Village, {
        foreignKey: 'village_id',
        as: 'village'
      });
      
      // FarmerProfile belongs to User (admin who approved)
      FarmerProfile.belongsTo(models.User, {
        foreignKey: 'approved_by',
        as: 'approver'
      });
    }
    
    // Instance method to check if approved
    isApproved() {
      return this.request_status === 'approved';
    }
    
    // Instance method to check if rejected
    isRejected() {
      return this.request_status === 'rejected';
    }
    
    // Instance method to check if pending
    isPending() {
      return this.request_status === 'pending';
    }
  }
  
  FarmerProfile.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    age: {
      type: DataTypes.INTEGER,
      allowNull: true,
      validate: {
        min: 18,
        max: 120
      }
    },
    gender: {
      type: DataTypes.ENUM('male', 'female', 'other'),
      allowNull: true
    },
    mobile_no: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    aadhar_no: {
      type: DataTypes.STRING(12),
      allowNull: true,
      unique: true,
      validate: {
        len: [12, 12]
      }
    },
    dob: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    taluka_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    village_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    passport_photo: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    land_area: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    soil_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    source_of_irrigation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    crops_grown: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cultivation_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    crop_description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    occupation: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    additional_work_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    crop_owned: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    property_information: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    training_type: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    feedback: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    request_status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      allowNull: false,
      defaultValue: 'pending'
    },
    approved_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    approved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejected_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    rejection_reason: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'FarmerProfile',
    tableName: 'farmer_profiles',
    underscored: true,
    timestamps: true
  });
  
  return FarmerProfile;
};