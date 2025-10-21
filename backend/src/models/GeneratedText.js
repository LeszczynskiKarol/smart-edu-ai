// backend/src/models/GeneratedText.js
const mongoose = require('mongoose');

const GeneratedTextSchema = new mongoose.Schema(
  {
    // Referencje
    orderedTextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderedText',
      required: true,
      index: true,
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

    // Treść
    content: {
      type: String,
      required: true,
    },

    // Metadata
    temat: {
      type: String,
      required: true,
    },
    rodzajTresci: {
      type: String,
      required: true,
    },
    dlugoscTekstu: {
      type: Number,
      required: true,
    },
    jezyk: {
      type: String,
      required: true,
    },

    // Status generowania
    status: {
      type: String,
      enum: ['Generowanie', 'Zakończone', 'Błąd'],
      default: 'Generowanie',
    },

    // Daty
    startGenerationDate: {
      type: Date,
      default: Date.now,
    },
    completionDate: {
      type: Date,
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

    // Dodatkowe informacje
    model: {
      type: String,
      default: 'Claude 2.0',
    },
    wordCount: {
      type: Number,
    },
    characterCount: {
      type: Number,
    },

    // Błędy (jeśli wystąpiły)
    errorMessage: {
      type: String,
    },

    // Czy tekst został dostarczony użytkownikowi
    delivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indeksy
GeneratedTextSchema.index({ idZamowienia: 1, itemId: 1 });
GeneratedTextSchema.index({ status: 1 });
GeneratedTextSchema.index({ email: 1 });
GeneratedTextSchema.index({ orderedTextId: 1 });

// Pre-save hook do obliczania liczby słów i znaków
GeneratedTextSchema.pre('save', function (next) {
  if (this.content && this.isModified('content')) {
    this.characterCount = this.content.length;
    this.wordCount = this.content
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
  }
  next();
});

module.exports = mongoose.model('GeneratedText', GeneratedTextSchema);
