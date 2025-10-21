const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Ładuj .env z głównego katalogu
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');

async function createAdmin() {
  try {
    // Sprawdź czy MONGODB_URI istnieje
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI nie jest ustawione w pliku .env');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Dane nowego admina
    const adminData = {
      name: 'Admin',
      email: 'admin@smart-edu.ai', // ZMIEŃ NA SWÓJ EMAIL
      password: 'AdminHaslo123!', // ZMIEŃ NA BEZPIECZNE HASŁO
      role: 'admin',
      isVerified: true,
      accountBalance: 0,
      totalSpent: 0,
      notificationPermissions: {
        browser: false,
        sound: false,
      },
      newsletterPreferences: {
        categories: [],
      },
      companyDetails: {
        companyName: '',
        nip: '',
        address: '',
        postalCode: '',
        city: '',
        buildingNumber: '',
      },
    };

    // Sprawdź czy admin już istnieje
    const existingAdmin = await User.findOne({ email: adminData.email });

    if (existingAdmin) {
      console.log('⚠️  Admin z tym emailem już istnieje!');
      console.log('Email:', existingAdmin.email);
      console.log('Role:', existingAdmin.role);

      // Jeśli chcesz zresetować hasło istniejącemu adminowi:
      const resetPassword = process.argv.includes('--reset');
      if (resetPassword) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(adminData.password, salt);

        existingAdmin.password = hashedPassword;
        await existingAdmin.save();

        console.log('✅ Hasło zostało zresetowane!');
        console.log('Email:', adminData.email);
        console.log('Nowe hasło:', adminData.password);
      }

      process.exit(0);
    }

    // Hashuj hasło
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminData.password, salt);
    adminData.password = hashedPassword;

    // Utwórz nowego admina
    const admin = new User(adminData);
    await admin.save();

    console.log('✅ Admin został utworzony pomyślnie!');
    console.log('');
    console.log('📧 Email:', admin.email);
    console.log('🔑 Hasło:', 'AdminHaslo123!'); // Pokaż oryginalne hasło
    console.log('👤 Role:', admin.role);
    console.log('');
    console.log('⚠️  WAŻNE: Zmień hasło po pierwszym logowaniu!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Błąd podczas tworzenia admina:', error);
    process.exit(1);
  }
}

// Uruchom funkcję
createAdmin();
