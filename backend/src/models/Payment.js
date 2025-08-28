// backend/src/models/Payment.js
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (v) {
          return !isNaN(v);
        },
        message: (props) => `${props.value} is not a valid amount!`,
      },
    },
    currency: {
      type: String,
      enum: ['PLN', 'USD'],
      default: 'PLN',
      required: true,
    },
    exchangeRate: {
      type: Number,
      default: null,
      validate: {
        validator: function (v) {
          return v === null || (typeof v === 'number' && !isNaN(v));
        },
        message: (props) => `${props.value} is not a valid exchange rate!`,
      },
    },
    amountPLN: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: function (v) {
          return !isNaN(v);
        },
        message: (props) => `${props.value} is not a valid PLN amount!`,
      },
    },
    paidAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    type: {
      type: String,
      enum: ['top_up', 'order_payment'],
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    stripeSessionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeInvoiceId: {
      type: String,
      unique: true,
      sparse: true,
    },
    appliedDiscount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    relatedOrder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: function () {
        return this.type === 'order_payment';
      },
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
  }
);

// Dodaj indeksy
PaymentSchema.index({ stripeSessionId: 1 });
PaymentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
