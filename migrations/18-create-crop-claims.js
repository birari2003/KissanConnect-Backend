'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('crop_claims', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            crop_name: {
                type: Sequelize.STRING(255),
                allowNull: false
            },
            claim_details: {
                type: Sequelize.TEXT,
                allowNull: false
            },
            evidence: {
                type: Sequelize.STRING(500),
                allowNull: true,
                comment: 'URL or path to the evidence (photo/image)'
            },
            status: {
                type: Sequelize.ENUM('pending', 'approved', 'rejected'),
                allowNull: false,
                defaultValue: 'pending'
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

        await queryInterface.addIndex('crop_claims', ['user_id']);
        await queryInterface.addIndex('crop_claims', ['status']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('crop_claims');
    }
};
