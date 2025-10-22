// backend/src/models/AcademicWork.js
const mongoose = require('mongoose');

const ChapterSchema = new mongoose.Schema({
  chapterNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
  },
  title: String,
  content: String, // Cała treść rozdziału
  characterCount: Number,
  tokensUsed: Number,
  generationTime: Number,
  promptUsed: String,
  status: {
    type: String,
    enum: ['pending', 'generating', 'completed', 'failed'],
    default: 'pending',
  },
  errorMessage: String,
});

const AcademicWorkSchema = new mongoose.Schema(
  {
    orderedTextId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'OrderedText',
      required: true,
      index: true,
    },
    workType: {
      type: String,
      enum: ['lic', 'mgr'],
      required: true,
    },

    status: {
      type: String,
      enum: [
        'generating_toc',
        'toc_completed',
        'chapter_1_generating',
        'chapter_1_completed',
        'chapter_2_generating',
        'chapter_2_completed',
        'chapter_3_generating',
        'chapter_3_completed',
        'chapter_4_generating',
        'chapter_4_completed',
        'generating_introduction',
        'introduction_completed',
        'generating_conclusion',
        'conclusion_completed',
        'generating_bibliography',
        'bibliography_completed',
        'assembling',
        'completed',
        'failed',
      ],
      default: 'generating_toc',
    },

    tableOfContents: {
      type: String,
      description: 'Prosty spis treści (do wyświetlenia użytkownikowi)',
    },

    fullStructure: {
      type: String,
      description: 'Pełna struktura z opisami (do użytku przez Claude)',
    },
    // 🆕 WSTĘP I ZAKOŃCZENIE
    introduction: {
      content: String,
      characterCount: Number,
      tokensUsed: Number,
      generationTime: Number,
      promptUsed: String,
      status: {
        type: String,
        enum: ['pending', 'generating', 'completed', 'failed'],
        default: 'pending',
      },
    },

    conclusion: {
      content: String,
      characterCount: Number,
      tokensUsed: Number,
      generationTime: Number,
      promptUsed: String,
      status: {
        type: String,
        enum: ['pending', 'generating', 'completed', 'failed'],
        default: 'pending',
      },
    },
    bibliography: {
      content: String,
      characterCount: Number,
      sourcesCount: Number,
      tokensUsed: Number,
      generationTime: Number,
      promptUsed: String,
      status: {
        type: String,
        enum: ['pending', 'generating', 'completed', 'failed'],
        default: 'pending',
      },
    },

    tocTokensUsed: Number,
    tocGenerationTime: Number,
    tocPromptUsed: String,

    // Rozdziały
    chapters: [ChapterSchema],

    // Finalna praca
    finalDocument: String,
    totalCharacterCount: Number,
    totalTokensUsed: Number,
    totalGenerationTime: Number,

    // Metadane
    startTime: Date,
    completionTime: Date,
    errorMessage: String,
  },
  {
    timestamps: true,
  }
);

// Index dla szybkiego wyszukiwania
AcademicWorkSchema.index({ orderedTextId: 1 });
AcademicWorkSchema.index({ status: 1 });

module.exports = mongoose.model('AcademicWork', AcademicWorkSchema);
