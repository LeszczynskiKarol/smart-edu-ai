// backend/scripts/showAllExamples.js
const mongoose = require('mongoose');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

// ZAŁADUJ WSZYSTKIE MODELE!
const Example = require('../src/models/Example');
const WorkType = require('../src/models/WorkType');
const Subject = require('../src/models/Subject');

async function show() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Połączono\n');

    // Pobierz WSZYSTKIE examples
    const examples = await Example.find({});

    if (examples.length === 0) {
      console.log('❌ BRAK Examples W BAZIE!');
      process.exit(1);
    }

    console.log(`📋 WSZYSTKIE EXAMPLES (${examples.length}):\n`);

    for (const ex of examples) {
      console.log(`"${ex.title}"`);
      console.log(`   _id: ${ex._id}`);
      console.log(`   slug: ${ex.slug}`);
      console.log(`   slugEn: ${ex.slugEn}`);
      console.log(`   level: ${ex.level}`);
      console.log(`   workType ID: ${ex.workType}`);

      // Znajdź WorkType ręcznie
      const wt = await WorkType.findById(ex.workType);
      if (wt) {
        console.log(`   WorkType name: ${wt.name}`);
        console.log(`   WorkType slugEn: ${wt.slugEn}`);
      } else {
        console.log(`   WorkType: BRAK!`);
      }
      console.log('');
    }

    console.log(`\n🔧 Aby zmienić slugEn w WorkType, uruchom:`);
    console.log(
      `   node backend/scripts/updateWorkTypeSlug.js <ID> bachelor\n`
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌', error);
    process.exit(1);
  }
}

show();
