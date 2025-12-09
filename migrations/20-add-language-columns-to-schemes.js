'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.addColumn('government_schemes', 'title_mr', {
            type: Sequelize.STRING(255),
            allowNull: true,
            after: 'title'
        });
        await queryInterface.addColumn('government_schemes', 'title_hi', {
            type: Sequelize.STRING(255),
            allowNull: true,
            after: 'title_mr'
        });
        await queryInterface.addColumn('government_schemes', 'description_mr', {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'description'
        });
        await queryInterface.addColumn('government_schemes', 'description_hi', {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'description_mr'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('government_schemes', 'title_mr');
        await queryInterface.removeColumn('government_schemes', 'title_hi');
        await queryInterface.removeColumn('government_schemes', 'description_mr');
        await queryInterface.removeColumn('government_schemes', 'description_hi');
    }
};
