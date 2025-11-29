"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("states", [
      {
        id: 1,
        name: "Maharashtra",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ], {
      ignoreDuplicates: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("states", null, {});
  },
};
