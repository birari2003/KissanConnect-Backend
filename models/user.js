'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      // User has one FarmerProfile
      User.hasOne(models.FarmerProfile, {
        foreignKey: 'user_id',
        as: 'farmerProfile'
      });

      // User has many Subscriptions
      User.hasMany(models.Subscription, {
        foreignKey: 'user_id',
        as: 'subscriptions'
      });

      // User has many AdminMessages (as sender)
      User.hasMany(models.AdminMessage, {
        foreignKey: 'admin_id',
        as: 'sentMessages'
      });

      // User has many MessageRecipients (as receiver)
      User.hasMany(models.MessageRecipient, {
        foreignKey: 'super_admin_id',
        as: 'receivedMessages'
      });

      // Super Admin region associations
      User.belongsTo(models.State, {
        foreignKey: 'super_admin_state_id',
        as: 'adminState'
      });

      User.belongsTo(models.District, {
        foreignKey: 'super_admin_district_id',
        as: 'adminDistrict'
      });

      User.belongsTo(models.Taluka, {
        foreignKey: 'super_admin_taluka_id',
        as: 'adminTaluka'
      });

      User.belongsTo(models.Village, {
        foreignKey: 'super_admin_village_id',
        as: 'adminVillage'
      });

      // FarmerProfiles approved by this admin
      User.hasMany(models.FarmerProfile, {
        foreignKey: 'approved_by',
        as: 'approvedFarmers'
      });
    }

    // Instance method to verify password
    async verifyPassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    // Instance method to check if user is super admin
    isSuperAdmin() {
      return this.role === 'super_admin';
    }

    // Instance method to check if user is admin
    isAdmin() {
      return this.role === 'admin';
    }

    // Instance method to check if user is farmer
    isFarmer() {
      return this.role === 'farmer';
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      validate: {
        is: /^[0-9]{10,15}$/
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    role: {
      type: DataTypes.ENUM('admin', 'super_admin', 'farmer'),
      allowNull: false,
      defaultValue: 'farmer'
    },
    language_preference: {
      type: DataTypes.ENUM('english', 'marathi', 'hindi'),
      allowNull: true,
      defaultValue: 'english'
    },
    super_admin_level: {
      type: DataTypes.ENUM('state', 'district', 'city', 'village'),
      allowNull: true
    },
    super_admin_state_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    super_admin_district_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    super_admin_taluka_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    super_admin_village_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    underscored: true,
    timestamps: true,
    hooks: {
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};