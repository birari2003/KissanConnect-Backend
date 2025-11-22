'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subscription extends Model {
    static associate(models) {
      // Subscription belongs to User
      Subscription.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }
    
    // Instance method to check if active
    isActive() {
      return this.status === 'active' && new Date() <= new Date(this.end_date);
    }
    
    // Instance method to check if expired
    isExpired() {
      return this.status === 'expired' || new Date() > new Date(this.end_date);
    }
  }
  
  Subscription.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    razorpay_payment_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    razorpay_order_id: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    razorpay_signature: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 499.00
    },
    currency: {
      type: DataTypes.STRING(3),
      allowNull: false,
      defaultValue: 'INR'
    },
    status: {
      type: DataTypes.ENUM('pending', 'active', 'expired', 'cancelled', 'failed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    end_date: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Subscription',
    tableName: 'subscriptions',
    underscored: true,
    timestamps: true
  });
  
  return Subscription;
};
