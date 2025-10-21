// backend/server.js - POPRAWIONA WERSJA
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cookieParser = require('cookie-parser');
const textGenerationRoutes = require('./routes/textGenerationRoutes');
const http = require('http');
const mongoose = require('mongoose');
const makeRoutes = require('./src/routes/makeRoutes');
const cors = require('cors');
const helmet = require('helmet');
const multer = require('multer');
const errorHandler = require('./src/middlewares/errorHandler');
const makeWebhookRoutes = require('./src/routes/makeWebhookRoutes');
const userRoutes = require('./src/routes/userRoutes');
const contentGenerationRoutes = require('./src/routes/contentGenerationRoutes');
const workTypeRoutes = require('./src/routes/workTypeRoutes');
const workTypePageRoutes = require('./src/routes/workTypePageRoutes');
const paperRoutes = require('./src/routes/paperRoutes');
const thesisExampleRoutes = require('./src/routes/thesisExampleRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const subjectRoutes = require('./src/routes/subjectRoutes');
const uploadRoutes = require('./src/routes/uploadRoutes');
const policyRoutes = require('./src/routes/policyRoutes');
const newsletterRoutes = require('./src/routes/newsletterRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const termsRoutes = require('./src/routes/termsRoutes');
const documentRoutes = require('./src/routes/documentRoutes');
const adminRoutes = require('./src/routes/adminRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const stripeWebhookController = require('./src/controllers/stripeWebhookController');
const exampleRoutes = require('./src/routes/exampleRoutes');

const app = express();
const server = http.createServer(app);

app.use(cookieParser());
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8080',
      'https://hook.eu2.make.com',
      'https://s3.eu-north-1.amazonaws.com',
      'https://piszemy.com.pl.s3.eu-north-1.amazonaws.com',
      'https://app-reactapp.ngrok.app',
      'https://server-reactapp.ngrok.app',
      'https://www.smart-edu.ai',
      'https://smart-edu.ai',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'stripe-signature',
      'x-make-webhook-secret',
    ],
    credentials: true,
    exposedHeaders: ['stripe-signature', 'ETag'],
  })
);

// Stripe webhook endpoint - must be before any body parsers
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    // Pass directly to controller
    stripeWebhookController.handleStripeWebhook(req, res);
  }
);

// JSON parsing for all other routes
app.use((req, res, next) => {
  if (req.originalUrl === '/api/stripe/webhook') {
    next();
  } else {
    express.json({ limit: '50mb' })(req, res, next);
  }
});

// URL-encoded bodies parsing
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ========================================
// ROUTES REGISTRATION
// ========================================

// Stripe
app.use('/api/stripe', require('./src/routes/stripeWebhookRoutes'));

// Users and Auth
app.use('/api/users', userRoutes);

// Examples and Articles
app.use('/api/examples', exampleRoutes);
app.use('/api/articles', require('./src/routes/articleRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/thesis-examples', thesisExampleRoutes);
app.use('/api/admin/examples', require('./src/routes/adminExampleRoutes'));

// Content and Orders
app.use('/api/content', contentGenerationRoutes);
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/text-generation', textGenerationRoutes);

// Notifications and Messages
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));
app.use('/api/threads', require('./src/routes/threadRoutes'));

// Payments
app.use('/api/payments', paymentRoutes);

// File Upload
app.use('/api/upload', uploadRoutes);

// ========================================
// MAKE.COM ROUTES - NOWY SYSTEM
// ========================================
app.use('/api/make', makeRoutes); // GŁÓWNE ENDPOINTY MAKE.COM

// Stary webhook (jeśli potrzebny dla backward compatibility)
// Rejestrujemy na innej ścieżce żeby nie było konfliktu
app.use('/wp-json/moj-custom-endpoint/v1', makeWebhookRoutes);
// ========================================

// Work Types
app.use('/api/work-types', workTypeRoutes);
app.use('/api/work-type-pages', workTypePageRoutes);

// Newsletter and Contact
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/contact', contactRoutes);

// Subjects and Paper
app.use('/api/subjects', subjectRoutes);
app.use('/api/paper', paperRoutes);

// Terms and Policy
app.use('/api/terms', termsRoutes);
app.use('/api/policy', policyRoutes);

// Documents
app.use('/api', documentRoutes);

// Analytics and Admin
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    webhook_url: `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/webhook`,
    make_endpoints: {
      test: `${process.env.NEXT_PUBLIC_API_URL}/api/make/test`,
      ordered_texts: `${process.env.NEXT_PUBLIC_API_URL}/api/make/ordered-texts`,
      generated_texts: `${process.env.NEXT_PUBLIC_API_URL}/api/make/generated-texts`,
    },
  });
});

// Error handling
app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log('📦 Database:', mongoose.connection.name);
  })
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Server initialization
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV}`);
  console.log(`\n📡 Available endpoints:`);
  console.log(
    `   Stripe Webhook: ${process.env.NEXT_PUBLIC_API_URL}/api/stripe/webhook`
  );
  console.log(
    `   Make.com Test: ${process.env.NEXT_PUBLIC_API_URL}/api/make/test`
  );
  console.log(
    `   Make.com Orders: ${process.env.NEXT_PUBLIC_API_URL}/api/make/ordered-texts`
  );
  console.log(
    `   Health Check: ${process.env.NEXT_PUBLIC_API_URL}/api/health\n`
  );
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
});

module.exports = { app, server };
