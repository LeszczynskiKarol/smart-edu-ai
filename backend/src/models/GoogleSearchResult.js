// backend/src/models/GoogleSearchResult.js
const mongoose = require('mongoose');

const GoogleSearchResultSchema = new mongoose.Schema(
  {
    orderedTextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderedText',
      required: true,
      index: true,
    },
    searchQuery: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      required: true,
    },
    results: [
      {
        title: String,
        htmlTitle: String,
        link: String,
        displayLink: String,
        snippet: String,
        htmlSnippet: String,
        formattedUrl: String,
        htmlFormattedUrl: String,
      },
    ],
    totalResults: String,
    searchTime: Number,
    status: {
      type: String,
      enum: ['completed', 'failed', 'pending'],
      default: 'pending',
    },
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GoogleSearchResult', GoogleSearchResultSchema);
