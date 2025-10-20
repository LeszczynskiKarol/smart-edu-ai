// backend/src/controllers/userController.js
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Subscriber = require('../models/Subscriber');
const { generateEmailTemplate } = require('../utils/emailTemplate');
const Payment = require('../models/Payment');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const generateVerificationCode = require('../utils/generateVerificationCode');
const jwt = require('jsonwebtoken');
const i18n = require('../../src/config/i18n');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { OAuth2Client } = require('google-auth-library');
const ConversionService = require('../services/ConversionService');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.handleTikTokCallback = async (req, res) => {
  const { code, state } = req.query;

  try {
    // Wymiana kodu na access token
    const tokenResponse = await fetch(
      'https://open-api.tiktok.com/oauth/access_token/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_key: process.env.TIKTOK_CLIENT_KEY,
          client_secret: process.env.TIKTOK_CLIENT_SECRET,
          code,
          grant_type: 'authorization_code',
          redirect_uri: process.env.TIKTOK_REDIRECT_URI,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (!tokenData.data?.access_token) {
      throw new Error('Nie udało się uzyskać access tokenu');
    }

    // Pobranie danych użytkownika
    const userResponse = await fetch('https://open-api.tiktok.com/user/info/', {
      headers: {
        Authorization: `Bearer ${tokenData.data.access_token}`,
      },
    });

    const userData = await userResponse.json();

    // Znajdź lub stwórz użytkownika
    let user = await User.findOne({ tiktokId: userData.data.open_id });

    if (!user) {
      // Nowy użytkownik
      user = await User.create({
        name: userData.data.display_name,
        email: `${userData.data.open_id}@tiktok.user`, // tymczasowy email
        tiktokId: userData.data.open_id,
        avatar: userData.data.avatar_url,
        isVerified: true,
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.redirect(
      `/auth/callback?token=${token}&isNewUser=${!user.lastLoginAt}`
    );
  } catch (error) {
    console.error('TikTok auth error:', error);
    res.redirect('/login?error=tiktok_auth_failed');
  }
};

exports.login = async (req, res) => {
  const { email, password, recaptchaToken } = req.body;

  try {
    {
      {
        const recaptchaResponse = await verifyRecaptcha(
          recaptchaToken,
          req.headers.host
        );

        if (!recaptchaResponse.success) {
          return res.status(400).json({
            success: false,
            message: 'Weryfikacja reCAPTCHA nie powiodła się',
          });
        }
      }
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

async function verifyRecaptcha(token) {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY;

  try {
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const params = new URLSearchParams();
    params.append('secret', secretKey);
    params.append('response', token);

    const response = await fetch(verifyUrl, {
      method: 'POST',
      body: params,
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('Błąd weryfikacji reCAPTCHA:', error);
    return { success: false, message: error.message };
  }
}

exports.verifyAccount = async (req, res) => {
  const { code, locale = 'pl' } = req.body;
  i18n.setLocale(locale);

  try {
    const user = await User.findOne({ verificationCode: code });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: i18n.__('auth.verification.invalidCode'),
      });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    await user.save();

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      message: i18n.__('auth.verification.success'),
      token,
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      success: false,
      message: i18n.__('auth.verification.error'),
    });
  }
};

async function verifyGoogleToken(token) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    return ticket.getPayload();
  } catch (error) {
    console.error('Google token verification error:', error);
    return null;
  }
}

exports.topUpAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      originalAmount,
      discountedAmount,
      appliedDiscount,
      currency = 'PLN',
      analyticalSessionId,
    } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const paymentMethods =
      currency.toUpperCase() === 'PLN'
        ? ['blik', 'card', 'p24', 'paypal']
        : ['card', 'paypal'];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethods,
      payment_method_options: {
        p24: {
          tos_shown_and_accepted: true,
        },
      },
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: currency === 'PLN' ? 'Doładowanie konta' : 'Account Top-up',
              description:
                currency === 'PLN'
                  ? `Doładowanie ${originalAmount.toFixed(2)} zł z rabatem ${appliedDiscount}%`
                  : `Top-up $${originalAmount.toFixed(2)} with ${appliedDiscount}% discount`,
            },
            unit_amount: Math.round(discountedAmount * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}&payment_type=top_up`,
      cancel_url: `${process.env.FRONTEND_URL}/dashboard?top_up_canceled=true`,
      customer_email: user.email,
      locale: 'pl',
      metadata: {
        userId: user._id.toString(),
        type: 'account_top_up',
        originalAmount: originalAmount.toString(),
        discountedAmount: discountedAmount.toString(),
        appliedDiscount: appliedDiscount.toString(),
        currency: currency,
        userToken: req.headers.authorization.split(' ')[1],
        analyticalSessionId: analyticalSessionId,
        firstReferrer: req.body.firstReferrer || '',
        originalReferrer: req.body.originalReferrer || '',
      },
    });

    res.status(200).json({
      success: true,
      paymentUrl: session.url,
    });
  } catch (error) {
    console.error('Error creating top-up session:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing top-up',
      error: error.message,
    });
  }
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, companyDetails, recaptchaToken } = req.body;
    const locale = req.locale || req.body.locale || 'pl';

    const recaptchaResponse = await verifyRecaptcha(recaptchaToken);

    if (!recaptchaResponse.success) {
      return res.status(400).json({
        success: false,
        message: 'Weryfikacja reCAPTCHA nie powiodła się',
      });
    }

    i18n.setLocale(locale);

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        success: false,
        message: i18n.__('auth.registration.userExists'),
      });
    }

    const verificationCode = generateVerificationCode();

    user = new User({
      name,
      email,
      password,
      role: 'client',
      companyDetails,
      verificationCode,
      isVerified: false,
    });

    try {
      await user.save();
    } catch (saveError) {
      console.error('10a. Błąd zapisywania użytkownika:', saveError);
      throw saveError;
    }

    const subscriber = new Subscriber({
      email: user.email,
      name: user.name,
      user: user._id,
      preferences: {
        categories: [
          'Nowości',
          'Promocje',
          'Porady',
          'Branżowe',
          'Technologia',
        ],
      },
      isActive: true,
    });

    try {
      await subscriber.save();
    } catch (subError) {
      console.error('Subscriber error:', subError);
    }

    const emailContent = `
      <h2>${i18n.__({ phrase: 'auth.registration.email.title', locale })}</h2>
      <p>${i18n.__({ phrase: 'auth.registration.email.codeMessage', locale })} <strong>${verificationCode}</strong></p>
    `;

    const emailData = {
      title: i18n.__({ phrase: 'auth.registration.email.headerTitle', locale }),
      headerTitle: i18n.__({
        phrase: 'auth.registration.email.headerTitle',
        locale,
      }),
      content: emailContent,
    };

    const emailHtml = generateEmailTemplate(emailData);

    await sendEmail({
      email: user.email,
      subject: i18n.__('auth.registration.email.subject'),
      message: emailHtml,
      isHtml: true,
    });

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
      message: i18n.__('auth.registration.success'),
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({
      success: false,
      message: i18n.__('auth.registration.error'),
    });
  }
};

exports.handleGoogleLogin = async (req, res) => {
  try {
    console.log('🔍 Google login started');
    const { token, sessionId } = req.body;
    console.log('🔍 Token received:', token ? 'YES' : 'NO');

    const payload = await verifyGoogleToken(token);
    console.log('🔍 Payload:', payload ? 'VALID' : 'NULL');

    if (!payload) {
      console.log('❌ Invalid token');
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token',
      });
    }

    console.log('👤 Email:', payload.email);
    let user = await User.findOne({ email: payload.email });
    console.log('👤 User exists:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('📝 Creating new user...');
      user = new User({
        name: payload.name,
        email: payload.email,
        password: crypto.randomBytes(20).toString('hex'),
        role: 'client',
        isVerified: true,
        googleId: payload.sub,
      });

      await user.save();
      console.log('✅ User created:', user._id);

      const referrerSource = req.body.firstReferrer || 'unknown';
      await ConversionService.trackConversion(
        sessionId,
        user._id,
        'conversion_registration_google',
        {
          source: referrerSource,
          firstReferrer: req.body.originalReferrer,
          path: req.body.path || '/register',
          isNewUser: true,
        }
      );

      const subscriber = new Subscriber({
        email: user.email,
        name: user.name,
        user: user._id,
        preferences: {
          categories: [
            'Nowości',
            'Promocje',
            'Porady',
            'Branżowe',
            'Technologia',
          ],
        },
        isActive: true,
      });

      try {
        await subscriber.save();
      } catch (subError) {
        console.error('Subscriber error:', subError);
      }
    }

    console.log('🔑 Generating JWT...');
    const jwtToken = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    console.log('✅ Google login success');
    res.status(200).json({
      success: true,
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    console.error('❌ Google auth error:', error);
    console.error('❌ Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Error processing Google authentication',
      error: error.message, // Dodaj to żeby wiedzieć co się wywala
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    res.status(200).json({
      success: true,
      user: user,
    });
  } catch (error) {
    console.error('Error in getMe:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};

exports.getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const stats = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
        },
      },
    ]);

    const result =
      stats.length > 0 ? stats[0] : { totalOrders: 0, totalSpent: 0 };

    res.status(200).json({
      success: true,
      data: {
        totalOrders: result.totalOrders,
        totalSpent: result.totalSpent,
      },
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'Nie udało się pobrać statystyk użytkownika',
      error: error.message,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, companyDetails } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, companyDetails } },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log('User not found');
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        companyDetails: updatedUser.companyDetails,
      },
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

const validatePassword = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumbers &&
    hasSpecialChar
  );
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        success: false,
        message:
          'Nowe hasło musi mieć co najmniej 8 znaków, zawierać dużą literę, cyfrę i znak specjalny',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(401).json({
        success: false,
        message:
          'Obecne hasło jest błędne. Wprowadź prawidłowe obecne hasło, którym się logujesz.',
      });
    }

    user.password = newPassword;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: 'Hasło zostało zmienione pomyślnie' });
  } catch (error) {
    console.error('Error changing password:', error);
    res
      .status(500)
      .json({ success: false, message: 'Wystąpił błąd podczas zmiany hasła' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const locale = req.locale || req.body.locale || 'pl';
    i18n.setLocale(locale);

    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: i18n.__('auth.forgotPassword.userNotFound'),
      });
    }

    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const emailContent = `
      <h2>${i18n.__('auth.forgotPassword.email.title')}</h2>
      <p>${i18n.__('auth.forgotPassword.email.message')}</p>
      <p>
        <a href="${resetUrl}" class="button">${i18n.__('auth.forgotPassword.email.buttonText')}</a>
      </p>
      <p>${i18n.__('auth.forgotPassword.email.ignoreMessage')}</p>
      <p>${i18n.__('auth.forgotPassword.email.expiryMessage')}</p>
    `;

    const emailData = {
      title: i18n.__('auth.forgotPassword.email.subject'),
      headerTitle: i18n.__('auth.forgotPassword.email.title'),
      content: emailContent,
    };

    const emailHtml = generateEmailTemplate(emailData);

    try {
      await sendEmail({
        email: user.email,
        subject: i18n.__('auth.forgotPassword.email.subject'),
        message: emailHtml,
        isHtml: true,
      });

      res.status(200).json({
        success: true,
        message: i18n.__('auth.forgotPassword.emailSent'),
      });
    } catch (error) {
      console.error('Error sending email:', error);
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();

      return res.status(500).json({
        success: false,
        message: i18n.__('auth.forgotPassword.emailError'),
      });
    }
  } catch (error) {
    console.error('Error in forgotPassword:', error);
    res.status(500).json({
      success: false,
      message: i18n.__('auth.forgotPassword.serverError'),
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const locale = req.locale || req.body.locale || 'pl';
    i18n.setLocale(locale);

    const { token, newPassword } = req.body;
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: i18n.__('auth.resetPassword.invalidToken'),
      });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: i18n.__('auth.resetPassword.success'),
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: i18n.__('auth.resetPassword.error'),
    });
  }
};

exports.updateNotificationPermissions = async (req, res) => {
  try {
    const { browser, sound } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        $set: {
          'notificationPermissions.browser': browser,
          'notificationPermissions.sound': sound,
        },
      },
      { new: true }
    );
    if (!user) {
      console.log('User not found');
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user.notificationPermissions });
  } catch (error) {
    console.error('Error updating notification permissions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

exports.refreshSession = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const currentTime = Math.floor(Date.now() / 1000);
    if (req.user.exp > currentTime) {
      return res.status(200).json({
        success: true,
        token: req.headers.authorization.split(' ')[1],
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          companyDetails: user.companyDetails,
          notificationPermissions: user.notificationPermissions,
        },
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyDetails: user.companyDetails,
        notificationPermissions: user.notificationPermissions,
      },
    });
  } catch (error) {
    console.error('Error in refreshSession:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};

exports.getLatestTopUp = async (req, res) => {
  try {
    const latestTopUp = await Payment.findOne({
      user: req.user.id,
      type: 'top_up',
    }).sort('-createdAt');
    if (!latestTopUp) {
      return res
        .status(404)
        .json({ success: false, message: 'Nie znaleziono żadnych doładowań' });
    }

    res.json({
      success: true,
      amount: latestTopUp.amount,
      paidAmount: latestTopUp.paidAmount,
      appliedDiscount: latestTopUp.appliedDiscount,
      remainingBalance: req.user.accountBalance,
      stripeSessionId: latestTopUp.stripeSessionId,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: 'Błąd serwera', error: error.message });
  }
};

exports.logout = async (req, res) => {
  try {
    res.status(200).json({ success: true, message: 'Wylogowano pomyślnie' });
  } catch (error) {
    console.error('Błąd podczas wylogowywania:', error);
    res
      .status(500)
      .json({ success: false, message: 'Wystąpił błąd podczas wylogowywania' });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('Nie znaleziono użytkownika:', email);
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowe dane logowania',
      });
    }

    if (user.role !== 'admin') {
      console.log('Użytkownik nie jest adminem:', email);
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowe dane logowania',
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      console.log('Nieprawidłowe hasło dla:', email);
      return res.status(401).json({
        success: false,
        message: 'Nieprawidłowe dane logowania',
      });
    }

    console.log('Udane logowanie admina:', email);
    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Błąd logowania admina:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd serwera',
    });
  }
};
