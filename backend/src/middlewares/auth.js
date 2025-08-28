// backend/src/middlewares/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Obiekt z tłumaczeniami
const errorMessages = {
  en: {
    notAuthorized: 'Not authorized to access this route',
    userNotFound: 'User not found',
    accountNotVerified:
      'Account not verified. Please check your email and verify your account.',
    noPermission: 'You do not have permission to perform this action',
  },
  pl: {
    notAuthorized: 'Brak autoryzacji do dostępu do tej ścieżki',
    userNotFound: 'Nie znaleziono użytkownika',
    accountNotVerified:
      'Konto nie zostało zweryfikowane. Sprawdź swoją skrzynkę email i zweryfikuj konto.',
    noPermission: 'Brak uprawnień do wykonania tej akcji',
  },
};

// Pomocnicza funkcja do pobierania tłumaczenia
const getTranslatedMessage = (key, locale = 'pl') => {
  return errorMessages[locale]?.[key] || errorMessages.pl[key];
};

exports.protect = async (req, res, next) => {
  let token;
  // Pobierz preferowany język z nagłówka lub query params
  const locale =
    req.headers['accept-language']?.split(',')[0]?.slice(0, 2) ||
    req.query.locale ||
    'pl';

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.auth_token) {
    token = req.cookies.auth_token;
    res.clearCookie('auth_token');
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: getTranslatedMessage('notAuthorized', locale),
    });
  }

  if (!token || token === 'null') {
    console.log('No valid token found');
    return res.status(401).json({
      success: false,
      error: getTranslatedMessage('notAuthorized', locale),
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);
    if (!req.user) {
      console.log('User not found');
      return res.status(401).json({
        success: false,
        error: getTranslatedMessage('userNotFound', locale),
      });
    }

    // Zapisz locale w req do wykorzystania w następnych middleware'ach
    req.locale = locale;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: getTranslatedMessage('notAuthorized', locale),
    });
  }
};

exports.checkVerification = async (req, res, next) => {
  const locale = req.locale || 'pl';

  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: getTranslatedMessage('accountNotVerified', locale),
    });
  }
  next();
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    const locale = req.locale || 'pl';

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: getTranslatedMessage('noPermission', locale),
      });
    }
    next();
  };
};

exports.optionalProtect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.auth_token) {
    token = req.cookies.auth_token;
    res.clearCookie('auth_token');
  }

  try {
    if (token && token !== 'null') {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id);
    } else {
      req.user = {
        _id: 'anonymous',
        role: 'anonymous',
      };
    }
    next();
  } catch (error) {
    // W przypadku błędu walidacji tokena, traktuj jak anonimowego użytkownika
    req.user = {
      _id: 'anonymous',
      role: 'anonymous',
    };
    next();
  }
};
