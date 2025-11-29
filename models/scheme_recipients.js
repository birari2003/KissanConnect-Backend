'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SchemeRecipient extends Model {
    static associate(models) {
      // SchemeRecipient belongs to GovernmentScheme
      SchemeRecipient.belongsTo(models.GovernmentScheme, {
        foreignKey: 'scheme_id',
        as: 'scheme'
      });

      // SchemeRecipient belongs to User
      SchemeRecipient.belongsTo(models.User, {
        foreignKey: 'user_id',
        as: 'user'
      });
    }

    // Instance method to mark as read
    async markAsRead() {
      this.is_read = true;
      this.read_at = new Date();
      await this.save();
    }

    // Instance method to get attachment URL
    getAttachmentUrl(baseUrl = 'http://localhost:5000') {
      if (!this.attachment) return null;
      if (this.attachment.startsWith('http')) return this.attachment;
      return `${baseUrl}/uploads/${this.attachment}`;
    }
  }

  SchemeRecipient.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    scheme_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    read_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    attachment: {
      type: DataTypes.STRING(500),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'SchemeRecipient',
    tableName: 'scheme_recipients',
    underscored: true,
    timestamps: true
  });

  return SchemeRecipient;
};