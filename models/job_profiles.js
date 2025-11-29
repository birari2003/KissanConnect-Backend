'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class JobProfile extends Model {
    static associate(models) {
      // JobProfile belongs to User (creator)
      JobProfile.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      // JobProfile belongs to location tables
      JobProfile.belongsTo(models.State, {
        foreignKey: 'state_id',
        as: 'state'
      });

      JobProfile.belongsTo(models.District, {
        foreignKey: 'district_id',
        as: 'district'
      });

      JobProfile.belongsTo(models.Taluka, {
        foreignKey: 'taluka_id',
        as: 'taluka'
      });

      JobProfile.belongsTo(models.Village, {
        foreignKey: 'village_id',
        as: 'village'
      });

      // JobProfile has many JobApplications
      JobProfile.hasMany(models.JobApplication, {
        foreignKey: 'job_id',
        as: 'applications'
      });

      // JobProfile has many Media (polymorphic)
      JobProfile.hasMany(models.Media, {
        foreignKey: 'entity_id',
        constraints: false,
        scope: {
          entity_type: 'job'
        },
        as: 'attachments'
      });
    }

    // Instance method to activate job
    async activate() {
      this.status = 'active';
      await this.save();
    }

    // Instance method to close job
    async close() {
      this.status = 'closed';
      await this.save();
    }

    // Instance method to check if pending
    isPending() {
      return this.request_status === 'pending';
    }

    // Instance method to get attachment URL
    getAttachmentUrl(baseUrl = 'http://localhost:5000') {
      if (!this.attachment) return null;
      if (this.attachment.startsWith('http')) return this.attachment;
      return `${baseUrl}/uploads/${this.attachment}`;
    }

    // Instance method to check if active
    isActive() {
      return this.status === 'active' &&
        (!this.expires_at || new Date() <= new Date(this.expires_at));
    }

    // Instance method to check if expired
    isExpired() {
      return this.expires_at && new Date() > new Date(this.expires_at);
    }

    // Instance method to get salary range string
    getSalaryRange() {
      if (!this.salary_min && !this.salary_max) return 'Not specified';
      if (this.salary_min && this.salary_max) {
        return `₹${this.salary_min} - ₹${this.salary_max} ${this.salary_period}`;
      }
      if (this.salary_min) return `₹${this.salary_min}+ ${this.salary_period}`;
      if (this.salary_max) return `Up to ₹${this.salary_max} ${this.salary_period}`;
    }
  }

  JobProfile.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    job_title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    company_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    job_type: {
      type: DataTypes.ENUM('full_time', 'part_time', 'seasonal', 'contract', 'temporary'),
      allowNull: false
    },
    location: {
      type: DataTypes.STRING(255),
      allowNull: false
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
    salary_min: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    salary_max: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    salary_period: {
      type: DataTypes.ENUM('hourly', 'daily', 'weekly', 'monthly', 'yearly'),
      allowNull: true,
      defaultValue: 'monthly'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachment: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    requirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    benefits: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    contact_email: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    contact_phone: {
      type: DataTypes.STRING(15),
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('draft', 'active', 'closed', 'archived'),
      allowNull: false,
      defaultValue: 'draft'
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'JobProfile',
    tableName: 'job_profiles',
    underscored: true,
    timestamps: true
  });

  return JobProfile;
};