// backend/server.js
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http');
const mongoose = require('mongoose');
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
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
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
app.use('/wp-json/moj-custom-endpoint/v1', makeWebhookRoutes);
app.use('/api/stripe', require('./src/routes/stripeWebhookRoutes'));
app.use('/api/users', userRoutes);
app.use('/api/examples', exampleRoutes);
app.use('/api/articles', require('./src/routes/articleRoutes'));
app.use('/api/categories', require('./src/routes/categoryRoutes'));
app.use('/api/thesis-examples', thesisExampleRoutes);
app.use('/api/content', contentGenerationRoutes);
app.use('/api/orders', require('./src/routes/orderRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/messages', require('./src/routes/messageRoutes'));
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/work-types', workTypeRoutes);
app.use('/api/admin/examples', require('./src/routes/adminExampleRoutes'));
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/terms', termsRoutes);
app.use('/api/paper', paperRoutes);
app.use('/api/policy', policyRoutes);
app.use('/api/make', makeWebhookRoutes);
app.use('/api/threads', require('./src/routes/threadRoutes'));
app.use('/api', documentRoutes);
app.use('/api/work-type-pages', workTypePageRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    webhook_url: `${process.env.NEXT_PUBLIC_API_URL}/api/stripe/webhook`,
  });
});

// Error handling
app.use(errorHandler);

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Server initialization
const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(
    `Webhook endpoint: ${process.env.NEXT_PUBLIC_API_URL}/api/stripe/webhook`
  );
  console.log('Environment:', process.env.NODE_ENV);
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
