'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class Complaint extends Model {
        static associate(models) {
            // Complaint belongs to User (complainant)
            Complaint.belongsTo(models.User, {
                foreignKey: 'complainant_user_id',
                as: 'complainant'
            });

            // Complaint belongs to User (accused)
            Complaint.belongsTo(models.User, {
                foreignKey: 'against_user_id',
                as: 'accused'
            });

            // Complaint belongs to User (resolver/admin)
            Complaint.belongsTo(models.User, {
                foreignKey: 'resolved_by',
                as: 'resolver'
            });
        }
    }

    Complaint.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        complainant_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        complainant_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        complainant_contact: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        against_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        against_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        against_contact: {
            type: DataTypes.STRING(15),
            allowNull: false
        },
        complaint_text: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('pending', 'under_review', 'resolved', 'dismissed'),
            allowNull: false,
            defaultValue: 'pending'
        },
        admin_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        resolved_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        resolved_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    }, {
        sequelize,
        modelName: 'Complaint',
        tableName: 'complaints',
        underscored: true,
        timestamps: true
    });

    return Complaint;
};
