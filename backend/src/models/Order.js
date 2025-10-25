// backend/src/models/Order.js - ZAKTUALIZOWANY
const mongoose = require('mongoose');

// Definicja UserAttachmentSchema
const UserAttachmentSchema = new mongoose.Schema({
  filename: String,
  url: String,
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

// ✅ NOWE - Schemat dla danych strony tytułowej
const TitlePageDataSchema = new mongoose.Schema(
  {
    studentName: String,
    studentIndexNumber: String,
    university: String,
    faculty: String,
    fieldOfStudy: String,
    specialization: String,
    supervisor: String,
    city: String,
    year: String,
    workType: String, // np. "Praca licencjacka", "Praca magisterska"
  },
  { _id: false }
);

const OrderItemSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: false,
  },
  length: {
    type: Number,
    required: true,
    enum: [
      1000, 2000, 3000, 4000, 5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000,
      13000, 14000, 15000, 16000, 17000, 18000, 19000, 20000, 30000,
    ],
  },
  price: {
    type: Number,
    required: true,
  },
  contentType: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: ['pol', 'eng', 'ger', 'ukr', 'fra', 'esp', 'ros', 'por'],
  },
  guidelines: {
    type: String,
    default: '',
  },
  content: {
    type: String,
    default: '',
  },
  keywords: [String],
  sourceLinks: [String],
  includeFAQ: { type: Boolean, default: false },
  includeTable: { type: Boolean, default: false },
  tone: {
    type: String,
    enum: ['nieformalny', 'oficjalny', 'bezosobowy'],
    default: 'nieformalny',
  },
  status: {
    type: String,
    enum: ['oczekujące', 'w trakcie', 'zakończone'],
    default: 'oczekujące',
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  startTime: {
    type: Date,
  },
  estimatedCompletionTime: {
    type: Date,
  },
  searchLanguage: String,
  searchLanguageFull: String,
  hiddenByUser: {
    type: Boolean,
    default: false,
  },
  bibliography: {
    type: Boolean,
    default: false,
  },
});

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: Number,
      unique: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [OrderItemSchema],
    totalPrice: {
      type: Number,
      required: true,
    },
    totalPriceOriginal: {
      type: Number,
      required: true,
    },
    totalPricePLN: {
      type: Number,
      required: true,
    },
    exchangeRate: {
      type: Number,
      default: null,
    },
    status: {
      type: String,
      enum: ['oczekujące', 'w trakcie', 'zakończone', 'anulowane'],
      default: 'oczekujące',
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    deliveryDate: {
      type: Date,
    },
    currency: {
      type: String,
      enum: ['PLN', 'USD'],
      default: 'PLN',
      required: true,
    },
    userAttachments: [UserAttachmentSchema],
    attachments: {
      pdf: {
        filename: String,
        url: String,
        uploadDate: Date,
      },
      docx: {
        filename: String,
        url: String,
        uploadDate: Date,
      },
      image: {
        filename: String,
        url: String,
        uploadDate: Date,
      },
      other: [
        {
          filename: String,
          url: String,
          uploadDate: Date,
        },
      ],
    },
    stripeInvoiceId: String,
    // ✅ NOWE POLE - dane strony tytułowej
    titlePageData: {
      type: TitlePageDataSchema,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const lastOrder = await this.constructor.findOne(
      {},
      {},
      { sort: { orderNumber: -1 } }
    );
    this.orderNumber =
      lastOrder && lastOrder.orderNumber ? lastOrder.orderNumber + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('Order', OrderSchema);
