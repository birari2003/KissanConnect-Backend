'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        // Job Title
        await queryInterface.addColumn('job_profiles', 'job_title_mr', {
            type: Sequelize.STRING(255),
            allowNull: true,
            after: 'job_title'
        });
        await queryInterface.addColumn('job_profiles', 'job_title_hi', {
            type: Sequelize.STRING(255),
            allowNull: true,
            after: 'job_title_mr'
        });

        // Description
        await queryInterface.addColumn('job_profiles', 'description_mr', {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'description'
        });
        await queryInterface.addColumn('job_profiles', 'description_hi', {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'description_mr'
        });

        // Requirements
        await queryInterface.addColumn('job_profiles', 'requirements_mr', {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'requirements'
        });
        await queryInterface.addColumn('job_profiles', 'requirements_hi', {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'requirements_mr'
        });

        // Benefits
        await queryInterface.addColumn('job_profiles', 'benefits_mr', {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'benefits'
        });
        await queryInterface.addColumn('job_profiles', 'benefits_hi', {
            type: Sequelize.TEXT,
            allowNull: true,
            after: 'benefits_mr'
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.removeColumn('job_profiles', 'job_title_mr');
        await queryInterface.removeColumn('job_profiles', 'job_title_hi');
        await queryInterface.removeColumn('job_profiles', 'description_mr');
        await queryInterface.removeColumn('job_profiles', 'description_hi');
        await queryInterface.removeColumn('job_profiles', 'requirements_mr');
        await queryInterface.removeColumn('job_profiles', 'requirements_hi');
        await queryInterface.removeColumn('job_profiles', 'benefits_mr');
        await queryInterface.removeColumn('job_profiles', 'benefits_hi');
    }
};
