'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('farmer_history', {
            id: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
                allowNull: false
            },
            viewer_user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'ID of the farmer viewing the crop'
            },
            viewer_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
                comment: 'Name of the viewing farmer'
            },
            viewer_contact: {
                type: Sequelize.STRING(15),
                allowNull: false,
                comment: 'Contact number of the viewing farmer'
            },
            crop_owner_user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'ID of the farmer who posted the crop'
            },
            crop_owner_name: {
                type: Sequelize.STRING(100),
                allowNull: false,
                comment: 'Name of the crop owner'
            },
            crop_owner_contact: {
                type: Sequelize.STRING(15),
                allowNull: false,
                comment: 'Contact number of the crop owner'
            },
            crop_sell_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'crop_sells',
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE',
                comment: 'Reference to the crop being viewed'
            },
            crop_name: {
                type: Sequelize.STRING(255),
                allowNull: false,
                comment: 'Name of the crop viewed'
            },
            crop_image_path: {
                type: Sequelize.STRING(500),
                allowNull: true,
                comment: 'Path to the crop image'
            },
            viewed_at: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
                comment: 'Timestamp of when the crop was viewed'
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
        await queryInterface.addIndex('farmer_history', ['viewer_user_id']);
        await queryInterface.addIndex('farmer_history', ['crop_owner_user_id']);
        await queryInterface.addIndex('farmer_history', ['crop_sell_id']);
        await queryInterface.addIndex('farmer_history', ['viewed_at']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('farmer_history');
    }
};
