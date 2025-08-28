// backend/src/utils/htmlParser.js
const htmlparser2 = require('htmlparser2');
const iconv = require('iconv-lite');

exports.parseHTML = (html) => {
  const utf8Content = iconv.decode(Buffer.from(html), 'UTF-8');
  const elements = [];
  let currentElement = null;
  let currentText = '';
  let isBold = false;
  let currentListItems = [];
  let isInList = false;
  let listType = null;

  const parser = new htmlparser2.Parser({
    onopentag(name, attributes) {
      if (name === 'ul' || name === 'ol') {
        isInList = true;
        listType = name;
        currentListItems = [];
      } else if (name === 'li' && isInList) {
        // Czyszczenie tekstu przed nowym elementem listy
        currentText = '';
      } else if (!isInList) {
        if (currentText.trim()) {
          elements.push({
            type: currentElement || 'p',
            text: currentText.trim(),
            bold: currentElement === 'h2' || isBold,
          });
        }
        currentElement = name;
        if (name === 'strong' || name === 'b') {
          isBold = true;
        }
        currentText = '';
      }
    },
    ontext(text) {
      currentText += text;
    },
    onclosetag(name) {
      if (name === 'ul' || name === 'ol') {
        // Dodaj ostatni element listy, jeśli istnieje
        if (currentText.trim()) {
          currentListItems.push(currentText.trim());
        }

        // Przetwórz listę i dodaj jako jeden element
        elements.push({
          type: listType,
          items: currentListItems.map((item) =>
            // Usuń znaki bulletów i numeracji, które mogły się znaleźć w tekście
            item.replace(/^[•\-\d\.\s]+/, '').trim()
          ),
          bold: false,
        });

        isInList = false;
        listType = null;
        currentListItems = [];
        currentText = '';
      } else if (name === 'li' && isInList) {
        if (currentText.trim()) {
          currentListItems.push(currentText.trim());
        }
        currentText = '';
      } else if (!isInList) {
        if (currentText.trim()) {
          elements.push({
            type: currentElement || 'p',
            text: currentText.trim(),
            bold: currentElement === 'h2' || isBold,
          });
        }
        if (name === 'strong' || name === 'b') {
          isBold = false;
        }
        currentElement = null;
        currentText = '';
      }
    },
  });

  parser.write(utf8Content);
  parser.end();

  return elements;
};
