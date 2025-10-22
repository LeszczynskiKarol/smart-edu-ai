// backend/src/models/SourceSelection.js

const mongoose = require('mongoose');

const sourceSelectionSchema = new mongoose.Schema(
  {
    orderedTextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderedText',
      required: true,
      unique: true,
    },
    promptUsed: {
      type: String,
    },
    selectedIndices: {
      type: String, // np. "1,2,4,5,6"
    },
    response: {
      type: String, // Odpowiedź Claude
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('SourceSelection', sourceSelectionSchema);
