// backend/src/models/ContentGenerationLog.js
const mongoose = require('mongoose');

const GenerationStepSchema = new mongoose.Schema({
  stepNumber: Number,
  stepName: String,
  status: {
    type: String,
    enum: ['pending', 'running', 'completed', 'failed'],
    default: 'pending',
  },
  startTime: Date,
  endTime: Date,
  duration: Number, // w milisekundach
  input: mongoose.Schema.Types.Mixed,
  output: mongoose.Schema.Types.Mixed,
  error: String,
  tokensUsed: {
    input: Number,
    output: Number,
    total: Number,
  },
});

const ContentGenerationLogSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    orderItem: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    status: {
      type: String,
      enum: ['queued', 'processing', 'completed', 'failed'],
      default: 'queued',
    },
    steps: [GenerationStepSchema],
    totalDuration: Number,
    totalTokensUsed: {
      input: Number,
      output: Number,
      total: Number,
    },
    startedAt: Date,
    completedAt: Date,
    error: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'ContentGenerationLog',
  ContentGenerationLogSchema
);
