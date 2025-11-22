const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

const BASE = "https://vill.co.in/states/maharashtra";

async function load(url) {
  try {
    const res = await axios.get(url, { timeout: 10000 });
    return cheerio.load(res.data);
  } catch (err) {
    console.log(`❌ ERROR ${err.response?.status} → ${url}`);
    return null;
  }
}

// --------------------------------------------------
// 1️⃣ Get all districts
// --------------------------------------------------
async function getDistricts() {
  const url = `${BASE}/districts/`;
  console.log("Fetching districts:", url);

  const $ = await load(url);
  if (!$) return [];

  let list = [];

  $("a").each((i, el) => {
    const href = $(el).attr("href");
    if (href && href.includes("/districts/") && href.endsWith("/")) {
      const name = $(el).text().trim();
      const slug = href.split("/")[5]; // example: dhule
      list.push({ name, slug });
    }
  });

  return list;
}

// --------------------------------------------------
// 2️⃣ Get talukas (Blocks)
// --------------------------------------------------
async function getTalukas(dist) {
  const url = `${BASE}/districts/${dist.slug}/`;
  console.log(`  Fetching talukas: ${url}`);

  const $ = await load(url);
  if (!$) return [];

  let list = [];

  $("a").each((i, el) => {
    const href = $(el).attr("href");

    if (href && href.includes("/blocks/") && href.endsWith("/")) {
      const name = $(el).text().trim();
      const slug = href.split("/")[7]; // example: shirpur
      list.push({ name, slug });
    }
  });

  return list;
}

// --------------------------------------------------
// 3️⃣ Get villages
// --------------------------------------------------
async function getVillages(dist, taluka) {
  const url = `${BASE}/districts/${dist.slug}/blocks/${taluka.slug}/villages/`;

  console.log(`     Fetching villages → ${url}`);

  const $ = await load(url);
  if (!$) return [];

  let list = [];

  $("a").each((i, el) => {
    const name = $(el).text().trim();
    const href = $(el).attr("href");

    if (
      name &&
      href &&
      href.includes("/villages/") &&
      !name.toLowerCase().includes("taluka") &&
      !name.toLowerCase().includes("district")
    ) {
      list.push(name);
    }
  });

  return list;
}

// --------------------------------------------------
// MAIN FUNCTION
// --------------------------------------------------
(async () => {
  let finalData = [];

  const districts = await getDistricts();
  console.log("\nDistricts found:", districts.length);

  for (const dist of districts) {
    console.log(`\n===== District: ${dist.name} =====`);

    const talukas = await getTalukas(dist);
    if (talukas.length === 0) {
      console.log("  ❌ No talukas found");
      continue;
    }

    for (const taluka of talukas) {
      const villages = await getVillages(dist, taluka);

      console.log(`       ✔ Taluka ${taluka.name}: ${villages.length} villages`);

      villages.forEach(v => {
        finalData.push({
          district: dist.name,
          taluka: taluka.name,
          village: v
        });
      });
    }
  }

  console.log("\nTotal villages scraped:", finalData.length);

  const seederContent = `
"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert("villages", ${JSON.stringify(finalData, null, 2)});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("villages", null, {});
  }
};
`;

  fs.writeFileSync("seeders/9999-villages-seeder.js", seederContent);

  console.log("\nSeeder written to seeders/9999-villages-seeder.js");
})();
