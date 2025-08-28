const i18n = require('i18n');
const path = require('path');

i18n.configure({
  locales: ['en', 'pl'],
  defaultLocale: 'en',
  directory: path.join(__dirname, '../locales'), // ścieżka względem src/config
  objectNotation: true,
  updateFiles: false,
  syncFiles: false,
  register: global
});

module.exports = i18n;
