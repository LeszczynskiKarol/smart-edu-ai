// backend/src/models/OrderedText.js
const mongoose = require('mongoose');

const OrderedTextSchema = new mongoose.Schema(
  {
    // Podstawowe informacje
    temat: {
      type: String,
      required: true,
    },
    idZamowienia: {
      type: String,
      required: true,
      index: true,
    },
    itemId: {
      type: String,
      required: true,
      index: true,
    },

    // Ceny
    cena: {
      type: Number,
      required: true,
    },
    cenaZamowienia: {
      type: Number,
      required: true,
    },

    // Parametry treści
    rodzajTresci: {
      type: String,
      required: true,
    },
    dlugoscTekstu: {
      type: Number,
      required: true,
    },
    liczbaZnakow: {
      type: Number,
      required: true,
    },

    // Wytyczne i ustawienia
    wytyczneIndywidualne: {
      type: String,
      default: '',
    },
    tonIStyl: {
      type: String,
      enum: ['nieformalny', 'oficjalny', 'bezosobowy'],
      default: 'nieformalny',
    },

    // Język
    jezyk: {
      type: String,
      required: true,
    },
    jezykWyszukiwania: {
      type: String,
      default: 'pl',
    },
    countryCode: {
      type: String,
      default: 'polski',
    },

    // Model i opcje
    model: {
      type: String,
      default: 'Claude 2.0',
    },
    bibliografia: {
      type: Boolean,
      default: false,
    },
    faq: {
      type: Boolean,
      default: false,
    },
    tabele: {
      type: Boolean,
      default: false,
    },
    boldowanie: {
      type: Boolean,
      default: false,
    },
    listyWypunktowane: {
      type: Boolean,
      default: true,
    },

    // Słowa kluczowe i linki
    frazy: {
      type: String,
      default: '',
    },
    link1: String,
    link2: String,
    link3: String,
    link4: String,

    // Status i daty
    status: {
      type: String,
      enum: ['Oczekujące', 'W trakcie', 'Zakończone', 'Anulowane'],
      default: 'Oczekujące',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },

    // Użytkownik
    email: {
      type: String,
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },

    // Dodatkowe pola
    ileTekstow: {
      type: Number,
      default: 1,
    },
    lacznaLiczbaZnakow: {
      type: Number,
    },
    idTekstu: {
      type: Number,
    },

    // Referencje do oryginalnego zamówienia
    originalOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    originalItemId: {
      type: mongoose.Schema.Types.ObjectId,
    },
  },
  {
    timestamps: true,
  }
);

// Index dla szybkiego wyszukiwania
OrderedTextSchema.index({ idZamowienia: 1, itemId: 1 });
OrderedTextSchema.index({ status: 1, startDate: -1 });
OrderedTextSchema.index({ email: 1 });

module.exports = mongoose.model('OrderedText', OrderedTextSchema);
