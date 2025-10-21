// backend/src/models/ScrapedContent.js
const mongoose = require('mongoose');

const ScrapedContentSchema = new mongoose.Schema(
  {
    orderedTextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderedText',
      required: true,
      index: true,
    },
    googleSearchResultId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'GoogleSearchResult',
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    scrapedText: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['pending', 'scraping', 'completed', 'failed'],
      default: 'pending',
    },
    selectedForGeneration: {
      type: Boolean,
      default: false,
    },
    selectionReason: {
      type: String,
    },
    errorMessage: String,
    scrapedAt: Date,
    textLength: {
      type: Number,
      default: 0,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model('ScrapedContent', ScrapedContentSchema);
