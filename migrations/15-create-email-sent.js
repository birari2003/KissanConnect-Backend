'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('farmer_profiles', 'email_sent', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Flag to track if email has been sent to this farmer'
    });
    
    await queryInterface.addColumn('farmer_profiles', 'email_sent_at', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Timestamp when email was sent'
    });
    
    await queryInterface.addColumn('farmer_profiles', 'email_sent_count', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of emails sent to this farmer'
    });
    
    await queryInterface.addIndex('farmer_profiles', ['email_sent']);
  },
  
  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('farmer_profiles', 'email_sent');
    await queryInterface.removeColumn('farmer_profiles', 'email_sent_at');
    await queryInterface.removeColumn('farmer_profiles', 'email_sent_count');
  }
};