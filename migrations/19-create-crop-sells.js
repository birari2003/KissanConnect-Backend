'use strict';
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('crop_sells', {
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
            quantity: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
            },
            unit: {
                type: Sequelize.STRING(50),
                allowNull: false,
                comment: 'Unit of measurement (Quintal, kg, ton, bag)'
            },
            price_per_unit: {
                type: Sequelize.DECIMAL(10, 2),
                allowNull: false
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

        await queryInterface.addIndex('crop_sells', ['user_id']);
        await queryInterface.addIndex('crop_sells', ['crop_name']);
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('crop_sells');
    }
};
