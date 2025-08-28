// backend/src/utils/htmlParser.js
const htmlparser2 = require('htmlparser2');

exports.parseHTML = (html) => {
  const elements = [];
  let currentElement = null;
  let currentText = '';

  const parser = new htmlparser2.Parser({
    onopentag(name) {
      if (currentText.trim()) {
        elements.push({
          type: currentElement || 'p',
          text: currentText.trim(),
        });
      }
      currentElement = name;
      currentText = '';
    },
    ontext(text) {
      currentText += text;
    },
    onclosetag() {
      if (currentText.trim()) {
        elements.push({
          type: currentElement || 'p',
          text: currentText.trim(),
        });
      }
      currentElement = null;
      currentText = '';
    },
  });

  parser.write(html);
  parser.end();

  return elements;
};
