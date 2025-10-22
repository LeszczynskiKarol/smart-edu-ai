// backend/src/models/GeneratedTextContent.js

const mongoose = require('mongoose');

const generatedTextContentSchema = new mongoose.Schema(
  {
    orderedTextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderedText',
      required: true,
      unique: true,
    },
    textStructureId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TextStructure',
      required: true,
    },
    idZamowienia: {
      type: String,
      required: true,
    },
    itemId: {
      type: String,
      required: true,
    },

    // Wygenerowana treść
    fullContent: {
      type: String,
      required: true,
    },
    promptUsed: {
      type: String,
    },

    // Sekcje (każdy nagłówek osobno)
    sections: [
      {
        headerNumber: Number,
        headerTitle: String,
        content: String,
        wordCount: Number,
      },
    ],

    // Statystyki
    totalWords: Number,
    totalCharacters: Number,

    // Metadata
    status: {
      type: String,
      enum: ['generating', 'completed', 'failed'],
      default: 'generating',
    },

    errorMessage: String,
    generationTime: Number, // ms
    tokensUsed: Number,

    // Informacja o dostarczeniu do Make.com
    delivered: {
      type: Boolean,
      default: false,
    },
    deliveredAt: Date,
  },
  {
    timestamps: true,
  }
);

generatedTextContentSchema.index({ orderedTextId: 1 });
generatedTextContentSchema.index({ idZamowienia: 1 });
generatedTextContentSchema.index({ status: 1 });

module.exports = mongoose.model(
  'GeneratedTextContent',
  generatedTextContentSchema
);
