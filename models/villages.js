'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Village extends Model {
    static associate(models) {
      // Village belongs to Taluka
      Village.belongsTo(models.Taluka, {
        foreignKey: 'taluka_id',
        as: 'taluka'
      });
      
      // Village has many FarmerProfiles
      Village.hasMany(models.FarmerProfile, {
        foreignKey: 'village_id',
        as: 'farmers'
      });
      
      // Village has many Users (as super admin region)
      Village.hasMany(models.User, {
        foreignKey: 'super_admin_village_id',
        as: 'superAdmins'
      });
    }
  }
  
  Village.init({
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
    taluka_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    sequelize,
    modelName: 'Village',
    tableName: 'villages',
    underscored: true,
    timestamps: true
  });
  
  return Village;
};
