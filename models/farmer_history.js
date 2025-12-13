'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class FarmerHistory extends Model {
        static associate(models) {
            // FarmerHistory belongs to User (viewer)
            FarmerHistory.belongsTo(models.User, {
                foreignKey: 'viewer_user_id',
                as: 'viewer'
            });

            // FarmerHistory belongs to User (crop owner)
            FarmerHistory.belongsTo(models.User, {
                foreignKey: 'crop_owner_user_id',
                as: 'cropOwner'
            });

            // FarmerHistory belongs to CropSell
            FarmerHistory.belongsTo(models.CropSell, {
                foreignKey: 'crop_sell_id',
                as: 'crop'
            });
        }
    }

    FarmerHistory.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        viewer_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        viewer_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        viewer_contact: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        crop_owner_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        crop_owner_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        crop_owner_contact: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        crop_sell_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        crop_name: {
            type: DataTypes.STRING(255),
            allowNull: false
        },
        crop_image_path: {
            type: DataTypes.STRING(500),
            allowNull: true
        },
        viewed_at: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW
        }
    }, {
        sequelize,
        modelName: 'FarmerHistory',
        tableName: 'farmer_history',
        underscored: true,
        timestamps: true
    });

    return FarmerHistory;
};
