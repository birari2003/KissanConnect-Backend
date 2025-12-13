'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('complaints', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            complainant_user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'ID of the farmer filing the complaint'
            },
            complainant_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
                comment: 'Name of the complaining farmer'
            },
            complainant_contact: {
                type: Sequelize.STRING(15),
                allowNull: false,
                comment: 'Contact number of the complaining farmer'
            },
            against_user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'RESTRICT',
                comment: 'ID of the farmer being complained about'
            },
            against_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
                comment: 'Name of the farmer being complained about'
            },
            against_contact: {
                type: Sequelize.STRING(15),
                allowNull: false,
                comment: 'Contact number of the farmer being complained about'
            },
            complaint_text: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: 'Details of the complaint'
            },
            status: {
                type: Sequelize.ENUM('pending', 'under_review', 'resolved', 'dismissed'),
                allowNull: false,
                defaultValue: 'pending',
                comment: 'Current status of the complaint'
            },
            admin_notes: {
                type: Sequelize.TEXT,
                allowNull: true,
                comment: 'Notes added by admin during review'
            },
            resolved_by: {
                type: Sequelize.INTEGER,
                allowNull: true,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL',
                comment: 'ID of the admin who resolved the complaint'
            },
            resolved_at: {
                type: Sequelize.DATE,
                allowNull: true,
                comment: 'Timestamp when complaint was resolved'
            },
            created_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
            }
        });

        // Add indexes for better query performance
        await queryInterface.addIndex('complaints', ['complainant_user_id']);
        await queryInterface.addIndex('complaints', ['against_user_id']);
        await queryInterface.addIndex('complaints', ['status']);
        await queryInterface.addIndex('complaints', ['created_at']);
        await queryInterface.addIndex('complaints', ['resolved_by']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('complaints');
    }
};
