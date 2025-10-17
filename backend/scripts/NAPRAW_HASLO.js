// backend/scripts/NAPRAW_HASLO.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function naprawHaslo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Połączono z MongoDB');

    // DOKŁADNIE TO HASŁO BĘDZIE DZIAŁAĆ
    const NOWE_HASLO = 'admin123';

    console.log('\n🔧 Ustawiam nowe hasło...');
    console.log('📧 Email: admin@smart-edu.ai');
    console.log('🔑 Hasło:', NOWE_HASLO);

    // Hashuj hasło TUTAJ, w tym samym procesie co sprawdzanie
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(NOWE_HASLO, salt);

    console.log('\n🔐 Wygenerowany hash:', hash);

    // Aktualizuj w bazie
    const result = await mongoose.connection.collection('users').updateOne(
      { email: 'admin@smart-edu.ai' },
      {
        $set: {
          password: hash,
          role: 'admin',
          isVerified: true,
        },
      }
    );

    console.log('\n✅ Zaktualizowano:', result.modifiedCount, 'rekord(ów)');

    // TESTUJ OD RAZU
    console.log('\n🧪 Testuję hasło...');
    const user = await mongoose.connection.collection('users').findOne({
      email: 'admin@smart-edu.ai',
    });

    if (user) {
      const isMatch = await bcrypt.compare(NOWE_HASLO, user.password);
      console.log('✅ Test hasła:', isMatch ? 'DZIAŁA! ✓' : 'NIE DZIAŁA ✗');

      if (isMatch) {
        console.log('\n🎉 GOTOWE! Użyj tych danych do logowania:');
        console.log('📧 Email: admin@smart-edu.ai');
        console.log('🔑 Hasło: admin123');
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ BŁĄD:', error);
    process.exit(1);
  }
}

naprawHaslo();
