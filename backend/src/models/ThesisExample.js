// backend/src/models/ThesisExample.js
const mongoose = require('mongoose');

const thesisExampleSchema = new mongoose.Schema({
  // Kategoria pracy
  category: {
    type: String,
    enum: ['bachelor', 'master', 'coursework'],
    required: true,
    index: true,
  },

  // Tytuły
  title: { type: String, required: true },
  titleEn: { type: String, required: true },

  // Treść
  content: { type: String, required: true },
  contentEn: { type: String, required: true },

  // Slugi
  slug: { type: String, required: true, index: true },
  slugEn: { type: String, required: true, index: true },

  // Meta
  metaTitlePl: String,
  metaTitleEn: String,
  metaDescriptionPl: String,
  metaDescriptionEn: String,

  // Dodatkowe informacje
  subject: String, // np. "Historia", "Matematyka"
  subjectEn: String,
  tags: [String],

  // Długość (przybliżona liczba słów)
  wordCount: Number,

  // Statystyki
  views: { type: Number, default: 0 },

  // Status
  published: { type: Boolean, default: true },
  featured: { type: Boolean, default: false },

  // Daty
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Indeksy
thesisExampleSchema.index({ category: 1, slug: 1 }, { unique: true });
thesisExampleSchema.index({ category: 1, slugEn: 1 }, { unique: true });
thesisExampleSchema.index({ title: 'text', titleEn: 'text', tags: 'text' });

module.exports = mongoose.model('ThesisExample', thesisExampleSchema);
