const i18n = require('../src/config/i18n');

const i18nMiddleware = (req, res, next) => {
  // Najpierw sprawdź cookie NEXT_LOCALE
  const cookieLocale = req.cookies?.NEXT_LOCALE;
  
  const locale = 
    req.body?.locale || 
    req.query?.locale || 
    cookieLocale ||  // Dodaj sprawdzanie cookie przed accept-language
    req.headers['accept-language']?.split(',')[0] ||
    'pl';

  
  req.locale = locale.substring(0, 2);
  i18n.setLocale(req.locale);
  
  next();
};

module.exports = { i18nMiddleware };
