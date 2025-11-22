'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class State extends Model {
    static associate(models) {
      // State has many Districts
      State.hasMany(models.District, {
        foreignKey: 'state_id',
        as: 'districts'
      });
      
      // State has many FarmerProfiles
      State.hasMany(models.FarmerProfile, {
        foreignKey: 'state_id',
        as: 'farmers'
      });
      
      // State has many Users (as super admin region)
      State.hasMany(models.User, {
        foreignKey: 'super_admin_state_id',
        as: 'superAdmins'
      });
    }
  }
  
  State.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    }
  }, {
    sequelize,
    modelName: 'State',
    tableName: 'states',
    underscored: true,
    timestamps: true
  });
  
  return State;
};