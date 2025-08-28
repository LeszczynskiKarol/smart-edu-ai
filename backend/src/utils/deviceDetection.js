// backend/src/utils/deviceDetection.js
const UAParser = require('ua-parser-js');

exports.detectDevice = (userAgent) => {
  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    browser: `${result.browser.name} ${result.browser.version}`,
    os: `${result.os.name} ${result.os.version}`,
    device: result.device.type || 'desktop',
  };
};
