// backend/src/models/Category.js
const mongoose = require('mongoose');
const slugify = require('slugify');

const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Proszę podać nazwę kategorii'],
      unique: true,
      trim: true,
      maxlength: [50, 'Nazwa kategorii nie może być dłuższa niż 50 znaków'],
    },
    slug: String,
    description: {
      type: String,
      maxlength: [500, 'Opis nie może być dłuższy niż 500 znaków'],
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

module.exports = mongoose.model('Category', CategorySchema);