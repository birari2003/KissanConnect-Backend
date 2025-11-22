'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class District extends Model {
    static associate(models) {
      // District belongs to State
      District.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state'
      });
      
      // District has many Talukas
      District.hasMany(models.Taluka, {
        foreignKey: 'district_id',
        as: 'talukas'
      });
      
      // District has many FarmerProfiles
      District.hasMany(models.FarmerProfile, {
        foreignKey: 'district_id',
        as: 'farmers'
      });
      
      // District has many Users (as super admin region)
      District.hasMany(models.User, {
        foreignKey: 'super_admin_district_id',
        as: 'superAdmins'
      });
    }
  }
  
  District.init({
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
    state_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'District',
    tableName: 'districts',
    underscored: true,
    timestamps: true
  });
  
  return District;
};