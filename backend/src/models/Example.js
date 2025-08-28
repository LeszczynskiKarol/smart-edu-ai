// backend/src/models/Example.js
const mongoose = require('mongoose');

const exampleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    length: {
      type: String,
      enum: ['2000', '3000', '4000', '7000', '10000', '20000'],
      required: true,
    },
    titleEn: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    contentEn: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['primary', 'secondary', 'university'],
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    slugEn: {
      type: String,
      required: true,
      unique: true,
    },
    workType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'WorkType',
      required: true,
    },
    tags: [
      {
        type: String,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    metaTitlePl: {
      type: String,
      required: true,
    },
    metaTitleEn: {
      type: String,
      required: true,
    },
    metaDescriptionPl: {
      type: String,
      required: true,
    },
    metaDescriptionEn: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

exampleSchema.pre(/^find/, function (next) {
  this.populate('subject').populate('workType');
  next();
});

module.exports = mongoose.model('Example', exampleSchema);
