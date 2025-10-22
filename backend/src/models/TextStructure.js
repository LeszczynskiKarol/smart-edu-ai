// backend/src/models/TextStructure.js

const mongoose = require('mongoose');

const textStructureSchema = new mongoose.Schema(
  {
    orderedTextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderedText',
      required: true,
      unique: true,
    },
    idZamowienia: {
      type: String,
      required: true,
    },
    itemId: {
      type: String,
      required: true,
    },

    // Typ pracy - decyduje o promptcie
    workType: {
      type: String,
      enum: ['mgr', 'lic', 'other'],
      required: true,
    },

    // Źródła użyte (z limitowaniem)
    usedSources: [
      {
        url: String,
        textLength: Number,
        snippet: String,
        truncated: Boolean, // Czy został skrócony
      },
    ],
    totalSourcesLength: {
      type: Number,
      default: 0,
    },

    // Wygenerowana struktura
    structure: {
      type: String, // HTML ze strukturą nagłówków
      required: true,
    },

    // Metadata
    headersCount: Number,
    estimatedSections: Number,

    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating',
    },
    promptUsed: {
      type: String,
    },

    errorMessage: String,

    generationTime: Number, // ms
    tokensUsed: Number,
  },
  {
    timestamps: true,
  }
);

textStructureSchema.index({ orderedTextId: 1 });
textStructureSchema.index({ idZamowienia: 1 });
textStructureSchema.index({ status: 1 });

module.exports = mongoose.model('TextStructure', textStructureSchema);
