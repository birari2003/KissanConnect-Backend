'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Taluka extends Model {
    static associate(models) {
      // Taluka belongs to District
      Taluka.belongsTo(models.District, {
        foreignKey: 'district_id',
        as: 'district'
      });
      
      // Taluka has many Villages
      Taluka.hasMany(models.Village, {
        foreignKey: 'taluka_id',
        as: 'villages'
      });
      
      // Taluka has many FarmerProfiles
      Taluka.hasMany(models.FarmerProfile, {
        foreignKey: 'taluka_id',
        as: 'farmers'
      });
      
      // Taluka has many Users (as super admin region)
      Taluka.hasMany(models.User, {
        foreignKey: 'super_admin_taluka_id',
        as: 'superAdmins'
      });
    }
  }
  
  Taluka.init({
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
    district_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Taluka',
    tableName: 'talukas',
    underscored: true,
    timestamps: true
  });
  
  return Taluka;
};