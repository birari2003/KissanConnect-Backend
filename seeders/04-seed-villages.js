"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const villages = [
      // ===============================
      // PUNE CITY (taluka_id = 245)
      // ===============================
      { name: "Somwar Peth", taluka_id: 245 },
      { name: "Shivajinagar", taluka_id: 245 },
      { name: "Yerawada", taluka_id: 245 },
      { name: "Koregaon Park", taluka_id: 245 },

      // ===============================
      // HAVELI (taluka_id = 246)
      // ===============================
      { name: "Wagholi", taluka_id: 246 },
      { name: "Kharadi", taluka_id: 246 },
      { name: "Hadapsar", taluka_id: 246 },
      { name: "Undri", taluka_id: 246 },
      { name: "Kondhwa", taluka_id: 246 },

      // ===============================
      // AMBEGAON (taluka_id = 247)
      // ===============================
      { name: "Ghodegaon", taluka_id: 247 },
      { name: "Manchar", taluka_id: 247 },
      { name: "Dhamari", taluka_id: 247 },

      // ===============================
      // BARAMATI (taluka_id = 248)
      // ===============================
      { name: "Kashti", taluka_id: 248 },
      { name: "Bhigwan", taluka_id: 248 },
      { name: "Malegaon Khurd", taluka_id: 248 },

      // ===============================
      // BHOR (taluka_id = 249)
      // ===============================
      { name: "Bhor", taluka_id: 249 },
      { name: "Varve", taluka_id: 249 },
      { name: "Niranjanpur", taluka_id: 249 },

      // ===============================
      // DAUND (taluka_id = 250)
      // ===============================
      { name: "Daund", taluka_id: 250 },
      { name: "Yavat", taluka_id: 250 },
      { name: "Varvand", taluka_id: 250 },

      // ===============================
      // INDAPUR (taluka_id = 251)
      // ===============================
      { name: "Indapur", taluka_id: 251 },
      { name: "Bhigwan", taluka_id: 251 },
      { name: "Kalamb", taluka_id: 251 },

      // ===============================
      // JUNNAR (taluka_id = 252)
      // ===============================
      { name: "Junnar", taluka_id: 252 },
      { name: "Shirpunje", taluka_id: 252 },
      { name: "Otur", taluka_id: 252 },

      // ===============================
      // KHED (taluka_id = 253)
      // ===============================
      { name: "Chakan", taluka_id: 253 },
      { name: "Rajgurunagar", taluka_id: 253 },
      { name: "Alandi", taluka_id: 253 },

      // ===============================
      // MAWAL (taluka_id = 254)
      // ===============================
      { name: "Talegaon Dabhade", taluka_id: 254 },
      { name: "Vadgaon Maval", taluka_id: 254 },
      { name: "Lonavla", taluka_id: 254 },

      // ===============================
      // MULSHI (taluka_id = 255)
      // ===============================
      { name: "Pirangut", taluka_id: 255 },
      { name: "Lavale", taluka_id: 255 },
      { name: "Hinjewadi", taluka_id: 255 },

      // ===============================
      // PURANDHAR (taluka_id = 256)
      // ===============================
      { name: "Saswad", taluka_id: 256 },
      { name: "Jejuri", taluka_id: 256 },
      { name: "Dive", taluka_id: 256 },

      // ===============================
      // SHIRUR (taluka_id = 257)
      // ===============================
      { name: "Shirur", taluka_id: 257 },
      { name: "Ranjangaon", taluka_id: 257 },
      { name: "Tisgaon", taluka_id: 257 },

      // ===============================
      // VELHE (taluka_id = 258)
      // ===============================
      { name: "Velhe", taluka_id: 258 },
      { name: "Panshet", taluka_id: 258 },

      // ===============================
      // PIMPRI-CHINCHWAD (taluka_id = 259)
      // ===============================
      { name: "Nigdi", taluka_id: 259 },
      { name: "Chinchwad", taluka_id: 259 },
      { name: "Akurdi", taluka_id: 259 },
    ];

    await queryInterface.bulkInsert(
      "villages",
      villages.map((v, index) => ({
        id: index + 1,
        name: v.name,
        taluka_id: v.taluka_id,
        created_at: new Date(),
        updated_at: new Date(),
      }))
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("villages", null, {});
  },
};
