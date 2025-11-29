'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CropClaim extends Model {
        static associate(models) {
            // CropClaim belongs to User
            CropClaim.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'user'
            });
        }

        // Instance method to get evidence URL
        getEvidenceUrl(baseUrl = 'http://localhost:5000') {
            if (!this.evidence) return null;
            if (this.evidence.startsWith('http')) return this.evidence;
            return `${baseUrl}/uploads/${this.evidence}`;
        }
    }

    CropClaim.init({
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
        crop_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        claim_details: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        evidence: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending'
        }
    }, {
        sequelize,
        modelName: 'CropClaim',
        tableName: 'crop_claims',
        underscored: true,
        timestamps: true
    });

    return CropClaim;
};
