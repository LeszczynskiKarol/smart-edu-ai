// backend/scripts/checkDatabase.js
const mongoose = require('mongoose');
const path = require('path');
const WorkType = require('../src/models/WorkType');
const Example = require('../src/models/Example');

// POPRAWIONE ŁADOWANIE .env
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function check() {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      console.error('❌ MONGODB_URI nie jest ustawiony w .env!');
      console.log('📁 Sprawdź plik: backend/.env');
      process.exit(1);
    }

    console.log('🔌 Łączę z MongoDB...');
    await mongoose.connect(uri);
    console.log('✅ Połączono!\n');

    console.log('📋 WORK TYPES W BAZIE:');
    const workTypes = await WorkType.find({});

    if (workTypes.length === 0) {
      console.log('  ❌ BRAK WORK TYPES W BAZIE!');
    } else {
      workTypes.forEach((wt) => {
        console.log(`  ✅ ${wt.nameEn}`);
        console.log(`     name: "${wt.name}"`);
        console.log(`     slugEn: "${wt.slugEn}"`);
        console.log(`     _id: ${wt._id}\n`);
      });
    }

    console.log('\n📋 PRZYKŁADY W BAZIE (pierwsze 5):');
    const examples = await Example.find({}).populate('workType').limit(5);

    if (examples.length === 0) {
      console.log('  ❌ BRAK EXAMPLES W BAZIE!');
    } else {
      examples.forEach((ex) => {
        console.log(`  ✅ ${ex.title}`);
        console.log(
          `     WorkType: ${ex.workType?.nameEn || 'BRAK'} (slugEn: "${ex.workType?.slugEn || 'BRAK'}")`
        );
        console.log(`     slug: "${ex.slug}"`);
        console.log(`     slugEn: "${ex.slugEn}"\n`);
      });
    }

    await mongoose.disconnect();
    console.log('\n✅ Rozłączono');
    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  }
}

check();
