// backend/scripts/checkExampleWorkType.js
const mongoose = require('mongoose');
const path = require('path');
const Example = require('../src/models/Example');
const WorkType = require('../src/models/WorkType');

require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Połączono\n');

    const example = await Example.findOne({ title: 'Test' }).populate(
      'workType'
    );

    if (!example) {
      console.log('❌ Nie znaleziono Example "Test"');
      process.exit(1);
    }

    console.log('📋 Example "Test":');
    console.log(`  title: ${example.title}`);
    console.log(`  WorkType._id: ${example.workType._id}`);
    console.log(`  WorkType.name: ${example.workType.name}`);
    console.log(`  WorkType.slugEn: ${example.workType.slugEn}`);

    console.log('\n🔧 POTRZEBUJESZ ZMIENIĆ slugEn na "bachelor"!');
    console.log(
      `   Uruchom: node backend/scripts/updateWorkTypeSlug.js ${example.workType._id} bachelor`
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌', error.message);
    process.exit(1);
  }
}

check();
