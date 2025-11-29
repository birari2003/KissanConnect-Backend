'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class JobApplication extends Model {
    static associate(models) {
      // JobApplication belongs to JobProfile
      JobApplication.belongsTo(models.JobProfile, {
        foreignKey: 'job_id',
        as: 'job'
      });
      
      // JobApplication belongs to User (applicant)
      JobApplication.belongsTo(models.User, {
        foreignKey: 'applicant_id',
        as: 'applicant'
      });
      
      // JobApplication belongs to User (reviewer)
      JobApplication.belongsTo(models.User, {
        foreignKey: 'reviewed_by',
        as: 'reviewer'
      });
    }
    
    // Instance method to shortlist application
    async shortlist(reviewerId) {
      this.status = 'shortlisted';
      this.reviewed_by = reviewerId;
      this.reviewed_at = new Date();
      await this.save();
    }
    
    // Instance method to reject application
    async reject(reviewerId, notes = null) {
      this.status = 'rejected';
      this.reviewed_by = reviewerId;
      this.reviewed_at = new Date();
      if (notes) this.notes = notes;
      await this.save();
    }
    
    // Instance method to accept application
    async accept(reviewerId, notes = null) {
      this.status = 'accepted';
      this.reviewed_by = reviewerId;
      this.reviewed_at = new Date();
      if (notes) this.notes = notes;
      await this.save();
    }
    
    // Instance method to withdraw application
    async withdraw() {
      this.status = 'withdrawn';
      await this.save();
    }
    
    // Instance method to check if pending
    isPending() {
      return this.status === 'applied';
    }
  }
  
  JobApplication.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    job_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    applicant_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    cover_letter: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    resume_path: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('applied', 'under_review', 'shortlisted', 'rejected', 'accepted', 'withdrawn'),
      allowNull: false,
      defaultValue: 'applied'
    },
    applied_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    reviewed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    reviewed_by: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'JobApplication',
    tableName: 'job_applications',
    underscored: true,
    timestamps: true
  });
  
  return JobApplication;
};