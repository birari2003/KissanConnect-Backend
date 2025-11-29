'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class GovernmentScheme extends Model {
    static associate(models) {
      // GovernmentScheme belongs to User (creator)
      GovernmentScheme.belongsTo(models.User, {
        foreignKey: 'created_by',
        as: 'creator'
      });

      // GovernmentScheme has many SchemeRecipients
      GovernmentScheme.hasMany(models.SchemeRecipient, {
        foreignKey: 'scheme_id',
        as: 'recipients'
      });

      // Many-to-Many with Users through SchemeRecipients
      GovernmentScheme.belongsToMany(models.User, {
        through: models.SchemeRecipient,
        foreignKey: 'scheme_id',
        otherKey: 'user_id',
        as: 'targetUsers'
      });

      // GovernmentScheme has many Media (polymorphic)
      GovernmentScheme.hasMany(models.Media, {
        foreignKey: 'entity_id',
        constraints: false,
        scope: {
          entity_type: 'scheme'
        },
        as: 'attachments'
      });
    }

    // Instance method to publish scheme
    async publish() {
      this.status = 'published';
      this.published_at = new Date();
      await this.save();
    }

    // Instance method to archive scheme
    async archive() {
      this.status = 'archived';
      await this.save();
    }

    // Instance method to check if published
    isPublished() {
      return this.status === 'published';
    }

    // Instance method to check if draft
    isDraft() {
      return this.status === 'draft';
    }

    // Instance method to get attachment URL
    getAttachmentUrl(baseUrl = 'http://localhost:5000') {
      if (!this.attachment) return null;
      if (this.attachment.startsWith('http')) return this.attachment;
      return `${baseUrl}/uploads/${this.attachment}`;
    }
  }

  GovernmentScheme.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachment: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    target_audience: {
      type: DataTypes.ENUM('all', 'farmers', 'super_admins', 'farmers_and_super_admins'),
      allowNull: false,
      defaultValue: 'all'
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      allowNull: false,
      defaultValue: 'draft'
    },
    published_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'GovernmentScheme',
    tableName: 'government_schemes',
    underscored: true,
    timestamps: true
  });

  return GovernmentScheme;
};