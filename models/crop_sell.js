'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class CropSell extends Model {
        static associate(models) {
            // CropSell belongs to User
            CropSell.belongsTo(models.User, {
                foreignKey: 'user_id',
                as: 'seller'
            });

            // CropSell has many Media (photos)
            CropSell.hasMany(models.Media, {
                foreignKey: 'entity_id',
                constraints: false,
                scope: {
                    entity_type: 'crop_sell'
                },
                as: 'photos'
            });
        }
    }

    CropSell.init({
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
        quantity: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        },
        unit: {
            type: DataTypes.STRING(50),
            allowNull: false
        },
        price_per_unit: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false
        }
    }, {
        sequelize,
        modelName: 'CropSell',
        tableName: 'crop_sells',
        underscored: true,
        timestamps: true
    });

    return CropSell;
};
