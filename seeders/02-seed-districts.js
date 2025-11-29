"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const districts = [
      "Ahmednagar", "Akola", "Amravati", "Aurangabad", "Beed", "Bhandara",
      "Buldhana", "Chandrapur", "Dhule", "Gadchiroli", "Gondia", "Hingoli",
      "Jalgaon", "Jalna", "Kolhapur", "Latur", "Mumbai City", "Mumbai Suburban",
      "Nagpur", "Nanded", "Nandurbar", "Nashik", "Osmanabad", "Palghar",
      "Parbhani", "Pune", "Raigad", "Ratnagiri", "Sangli", "Satara", "Sindhudurg",
      "Solapur", "Thane", "Wardha", "Washim", "Yavatmal"
    ];

    await queryInterface.bulkInsert(
      "districts",
      districts.map((d, index) => ({
        id: index + 1,
        name: d,
        state_id: 1, // Maharashtra
        created_at: new Date(),
        updated_at: new Date(),
      })),
      {
        ignoreDuplicates: true
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("districts", null, {});
  },
};
