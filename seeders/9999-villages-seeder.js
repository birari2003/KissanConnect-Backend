
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("villages", []);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("villages", null, {});
  }
};
