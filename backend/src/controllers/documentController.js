// backend/src/controllers/documentController.js
const path = require('path');
const docx = require('docx');
const { Document, Paragraph } = docx;
const PDFDocument = require('pdfkit');
const { parseHTML } = require('../utils/htmlParser');

const truncateFileName = (text) => {
  // Usuń znaki diakrytyczne i zamień na podstawowe ASCII
  const normalizedText = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Usuń wszystkie znaki specjalne, pozostaw tylko litery, cyfry, spacje i myślniki
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    // Zamień spacje na myślniki
    .replace(/\s+/g, '-')
    // Usuń wielokrotne myślniki
    .replace(/-+/g, '-')
    // Zamień na małe litery
    .toLowerCase();

  const words = normalizedText.split('-');
  if (words.length <= 5 && normalizedText.length <= 50) return normalizedText;

  const truncated = words.slice(0, 5).join('-');
  return truncated.length > 50
    ? truncated.slice(0, 47) + '...'
    : truncated + '...';
};

exports.generateDOCX = (req, res) => {
  const { content } = req.body;
  const elements = parseHTML(content);
  const firstTextElement = elements.find((el) => el.text)?.text || 'document';
  const fileName = truncateFileName(firstTextElement);

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'myNumbering',
          levels: [
            {
              level: 0,
              format: 'decimal', // 1, 2, 3...
              text: '%1.',
              alignment: 'start',
              style: {
                paragraph: {
                  indent: { left: 720, hanging: 260 },
                },
              },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: elements.flatMap((element) => {
          switch (element.type) {
            case 'h1':
              return new Paragraph({
                text: element.text,
                heading: docx.HeadingLevel.HEADING_1,
                spacing: { before: 240, after: 120 },
                bold: true,
                size: 32, // odpowiednik 24pt
              });
            case 'h2':
              return new Paragraph({
                text: element.text,
                heading: docx.HeadingLevel.HEADING_2,
                spacing: { before: 200, after: 100 },
                bold: true,
                size: 32,
              });
            case 'p':
              return new Paragraph({
                children: [
                  new docx.TextRun({
                    text: element.text,
                    bold: element.bold,
                    size: 24, // odpowiednik 12pt
                  }),
                ],
                spacing: { after: 200 },
                alignment: docx.AlignmentType.JUSTIFIED,
              });
            case 'strong':
              return new Paragraph({
                children: [
                  new docx.TextRun({
                    text: element.text,
                    bold: true,
                    size: 24,
                  }),
                ],
                spacing: { after: 200 },
                alignment: docx.AlignmentType.JUSTIFIED,
              });
            case 'ul':
            case 'ol':
              return element.type === 'ul'
                ? element.items.map(
                    (item) =>
                      new Paragraph({
                        bullet: { level: 0 },
                        children: [
                          new docx.TextRun({
                            text: item.trim(),
                            size: 24,
                          }),
                        ],
                        spacing: { before: 120, after: 120 },
                        indent: { left: 720 },
                      })
                  )
                : element.items.map(
                    (item, index) =>
                      new Paragraph({
                        numbering: {
                          reference: 'myNumbering',
                          level: 0,
                        },
                        children: [
                          new docx.TextRun({
                            text: item.trim(),
                            size: 24,
                          }),
                        ],
                        spacing: { before: 120, after: 120 },
                      })
                  );
            default:
              return new Paragraph({
                children: [
                  new docx.TextRun({
                    text: element.text,
                    size: 24,
                  }),
                ],
              });
          }
        }),
      },
    ],
  });

  docx.Packer.toBuffer(doc).then((buffer) => {
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${fileName}.docx`
    );
    res.send(buffer);
  });
};

exports.generatePDF = (req, res) => {
  const { content } = req.body;
  const elements = parseHTML(content);

  const firstTextElement = elements.find((el) => el.text)?.text || 'document';
  const fileName = truncateFileName(firstTextElement);

  const doc = new PDFDocument({
    margins: { top: 50, bottom: 50, left: 50, right: 50 },
    size: 'A4',
    lang: 'pl',
  });

  doc.registerFont(
    'CustomFont',
    path.join(__dirname, '../fonts/DejaVuSans.ttf')
  );
  doc.registerFont(
    'CustomFontBold',
    path.join(__dirname, '../fonts/DejaVuSans-Bold.ttf')
  );

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=${fileName}.pdf`);
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => {
    const result = Buffer.concat(chunks);
    res.end(result);
  });

  doc.pipe(res);

  elements.forEach((element) => {
    switch (element.type) {
      case 'h1':
        doc
          .font('CustomFontBold')
          .fontSize(24)
          .text(element.text, {
            align: 'left',
            continued: false,
          })
          .moveDown();
        break;
      case 'h2':
        doc
          .font('CustomFontBold')
          .fontSize(20)
          .text(element.text, {
            align: 'left',
            continued: false,
          })
          .moveDown(1.2);
        break;

      case 'p':
        if (element.bold) {
          doc.font('CustomFontBold');
        } else {
          doc.font('CustomFont');
        }
        doc
          .fontSize(12)
          .text(element.text, {
            align: 'justify',
            continued: false,
          })
          .moveDown();
        break;
      case 'ul':
        element.items.forEach((item) => {
          doc
            .font('CustomFont')
            .fontSize(12)
            .text(`• ${item}`, {
              align: 'left',
              continued: false,
              indent: 20,
            })
            .moveDown(0.5);
        });
        doc.moveDown(0.5);
        break;
      case 'ol':
        element.items.forEach((item, index) => {
          doc
            .font('CustomFont')
            .fontSize(12)
            .text(`${index + 1}. ${item}`, {
              align: 'left',
              continued: false,
              indent: 20,
            })
            .moveDown(0.5);
        });
        doc.moveDown(0.5);
        break;
      case 'strong':
        doc
          .font('CustomFontBold')
          .fontSize(12)
          .text(element.text, {
            align: 'justify',
            continued: false,
          })
          .moveDown();
        break;
    }
  });

  doc.end();
};
