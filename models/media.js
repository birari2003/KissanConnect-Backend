'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Media extends Model {
    static associate(models) {
      // Media belongs to User (uploader)
      Media.belongsTo(models.User, {
        foreignKey: 'uploaded_by',
        as: 'uploader'
      });
    }

    // Instance method to get full URL
    getFullUrl(baseUrl = 'http://localhost:5000') {
      return `${baseUrl}/${this.file_path}`;
    }

    // Instance method to check if image
    isImage() {
      return this.media_type === 'image';
    }

    // Instance method to check if PDF
    isPdf() {
      return this.media_type === 'pdf';
    }

    // Instance method to check if video
    isVideo() {
      return this.media_type === 'video';
    }
  }

  Media.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    file_name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    file_path: {
      type: DataTypes.STRING(500),
      allowNull: false
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    media_type: {
      type: DataTypes.ENUM('image', 'pdf', 'video', 'document'),
      allowNull: false
    },
    uploaded_by: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    entity_type: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    entity_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Media',
    tableName: 'media',
    underscored: true,
    timestamps: true
  });

  return Media;
};