// backend/src/models/WorkType.js
const mongoose = require('mongoose');

const workTypeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  nameEn: {
    type: String,
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
});

workTypeSchema.pre('save', function (next) {
  if (this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  if (this.nameEn) {
    this.slugEn = this.nameEn
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
  }
  next();
});

module.exports = mongoose.model('WorkType', workTypeSchema);
