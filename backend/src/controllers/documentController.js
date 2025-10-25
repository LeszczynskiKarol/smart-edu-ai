// backend/src/controllers/documentController.js
const path = require('path');
const docx = require('docx');
const {
  Document,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  PageNumber,
  Footer,
  PageBreak,
} = docx;
const PDFDocument = require('pdfkit');
const { parseHTML } = require('../utils/htmlParser');
const Order = require('../models/Order');

const truncateFileName = (text) => {
  const normalizedText = text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  const words = normalizedText.split('-');
  if (words.length <= 5 && normalizedText.length <= 50) return normalizedText;
  const truncated = words.slice(0, 5).join('-');
  return truncated.length > 50
    ? truncated.slice(0, 47) + '...'
    : truncated + '...';
};

const shouldStartNewPage = (h2Text) => {
  const normalizedText = h2Text.toLowerCase().trim();
  const keywords = [
    'wstęp',
    'wprowadzenie',
    'rozdział',
    'chapter',
    'zakończenie',
    'podsumowanie',
    'wnioski',
    'bibliografia',
    'literatura',
    'references',
  ];
  return keywords.some((keyword) => normalizedText.includes(keyword));
};

const isWstep = (text) => {
  return text.toLowerCase().trim().includes('wstęp');
};

// ============================================
// DOCX GENERATOR
// ============================================
exports.generateDOCX = async (req, res) => {
  const { content, topic, orderId, contentType } = req.body;

  const isAcademicWork =
    contentType === 'licencjacka' || contentType === 'magisterska';

  let titlePageData = null;
  if (orderId && isAcademicWork) {
    try {
      const order = await Order.findById(orderId);
      if (order && order.titlePageData) {
        titlePageData = order.titlePageData;
      }
    } catch (error) {
      console.error('Błąd podczas pobierania danych strony tytułowej:', error);
    }
  }

  const elements = parseHTML(content);
  const firstTextElement = elements.find((el) => el.text)?.text || 'document';
  const fileName = truncateFileName(topic || firstTextElement);
  const documentTitle = topic || firstTextElement;

  // ✅ Znajdź indeks elementu "Wstęp"
  let wstepIndex = -1;
  elements.forEach((el, idx) => {
    if (el.type === 'h2' && isWstep(el.text)) {
      wstepIndex = idx;
    }
  });

  // Podziel elementy na dwie części: przed Wstępem i od Wstępu
  const beforeWstep =
    wstepIndex >= 0 ? elements.slice(0, wstepIndex) : elements;
  const fromWstep = wstepIndex >= 0 ? elements.slice(wstepIndex) : [];

  const styles = {
    default: {
      document: {
        run: { font: 'Times New Roman', size: 24 },
        paragraph: { spacing: { line: 360, after: 200 } },
      },
    },
    paragraphStyles: [
      {
        id: 'Normal',
        name: 'Normal',
        run: { font: 'Times New Roman', size: 24 },
        paragraph: {
          spacing: { line: 360, after: 200 },
          alignment: AlignmentType.JUSTIFIED,
        },
      },
      {
        id: 'Heading1',
        name: 'Heading 1',
        basedOn: 'Normal',
        next: 'Normal',
        run: { font: 'Times New Roman', size: 32, bold: true },
        paragraph: {
          spacing: { before: 400, after: 200, line: 360 },
          alignment: AlignmentType.CENTER,
        },
      },
      {
        id: 'Heading2',
        name: 'Heading 2',
        basedOn: 'Normal',
        next: 'Normal',
        run: { font: 'Times New Roman', size: 28, bold: true },
        paragraph: { spacing: { before: 300, after: 200, line: 360 } },
      },
      {
        id: 'Heading3',
        name: 'Heading 3',
        basedOn: 'Normal',
        next: 'Normal',
        run: { font: 'Times New Roman', size: 26, bold: true },
        paragraph: { spacing: { before: 240, after: 120, line: 360 } },
      },
    ],
  };

  const numbering = {
    config: [
      {
        reference: 'myNumbering',
        levels: [
          {
            level: 0,
            format: 'decimal',
            text: '%1.',
            alignment: 'start',
            style: { paragraph: { indent: { left: 720, hanging: 360 } } },
          },
        ],
      },
    ],
  };

  const convertElement = (element) => {
    switch (element.type) {
      case 'h1':
        return new Paragraph({
          text: element.text,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200, line: 360 },
        });
      case 'h2':
        return new Paragraph({
          text: element.text,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200, line: 360 },
          pageBreakBefore: shouldStartNewPage(element.text),
        });
      case 'h3':
        return new Paragraph({
          text: element.text,
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 240, after: 120, line: 360 },
        });
      case 'p':
        return new Paragraph({
          children: [
            new TextRun({
              text: element.text,
              bold: element.bold,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
          spacing: { after: 200, line: 360 },
          alignment: AlignmentType.JUSTIFIED,
        });
      case 'strong':
        return new Paragraph({
          children: [
            new TextRun({
              text: element.text,
              bold: true,
              size: 24,
              font: 'Times New Roman',
            }),
          ],
          spacing: { after: 200, line: 360 },
          alignment: AlignmentType.JUSTIFIED,
        });
      case 'ul':
        return element.items.map(
          (item) =>
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({
                  text: item.trim(),
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: { before: 120, after: 120, line: 360 },
              indent: { left: 720 },
            })
        );
      case 'ol':
        return element.items.map(
          (item) =>
            new Paragraph({
              numbering: { reference: 'myNumbering', level: 0 },
              children: [
                new TextRun({
                  text: item.trim(),
                  size: 24,
                  font: 'Times New Roman',
                }),
              ],
              spacing: { before: 120, after: 120, line: 360 },
            })
        );
      default:
        return new Paragraph({
          children: [
            new TextRun({
              text: element.text || '',
              size: 24,
              font: 'Times New Roman',
            }),
          ],
          spacing: { line: 360 },
        });
    }
  };

  const sections = [];

  // ✅ SEKCJA 1: Strona tytułowa (BEZ numeracji)
  if (isAcademicWork && titlePageData) {
    const titlePageChildren = [];

    if (titlePageData.university) {
      titlePageChildren.push(
        new Paragraph({
          text: titlePageData.university,
          alignment: AlignmentType.CENTER,
          spacing: { before: 400, after: 200 },
          style: 'Heading1',
        })
      );
    }
    if (titlePageData.faculty) {
      titlePageChildren.push(
        new Paragraph({
          text: titlePageData.faculty,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }
    if (titlePageData.fieldOfStudy) {
      titlePageChildren.push(
        new Paragraph({
          text: `Kierunek: ${titlePageData.fieldOfStudy}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: titlePageData.specialization ? 100 : 400 },
        })
      );
    }
    if (titlePageData.specialization) {
      titlePageChildren.push(
        new Paragraph({
          text: `Specjalizacja: ${titlePageData.specialization}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
        })
      );
    }
    titlePageChildren.push(
      new Paragraph({ text: '', spacing: { before: 800 } })
    );
    if (titlePageData.workType) {
      titlePageChildren.push(
        new Paragraph({
          text: titlePageData.workType,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }
    titlePageChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: documentTitle,
            bold: true,
            size: 32,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 400 },
      })
    );
    titlePageChildren.push(
      new Paragraph({ text: '', spacing: { before: 1200 } })
    );
    if (titlePageData.studentName) {
      titlePageChildren.push(
        new Paragraph({
          text: titlePageData.studentName,
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
        })
      );
    }
    if (titlePageData.studentIndexNumber) {
      titlePageChildren.push(
        new Paragraph({
          text: `Nr indeksu: ${titlePageData.studentIndexNumber}`,
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }
    if (titlePageData.supervisor) {
      titlePageChildren.push(
        new Paragraph({
          text: `Promotor: ${titlePageData.supervisor}`,
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 400 },
        })
      );
    }
    const cityYear = [];
    if (titlePageData.city) cityYear.push(titlePageData.city);
    if (titlePageData.year) cityYear.push(titlePageData.year);
    if (cityYear.length > 0) {
      titlePageChildren.push(
        new Paragraph({
          text: cityYear.join(', '),
          alignment: AlignmentType.CENTER,
          spacing: { before: 800 },
        })
      );
    }

    sections.push({
      properties: {
        page: {
          margin: { top: 1418, right: 1418, bottom: 1418, left: 1418 },
        },
      },
      children: titlePageChildren,
    });

    // Treść przed Wstępem (bez numeracji)
    if (beforeWstep.length > 0) {
      sections.push({
        properties: {
          page: {
            margin: { top: 1418, right: 1418, bottom: 1418, left: 1418 },
          },
        },
        children: beforeWstep.flatMap(convertElement),
      });
    }

    // ✅ SEKCJA OD "WSTĘPU" - Z NUMERACJĄ OD 1
    if (fromWstep.length > 0) {
      sections.push({
        properties: {
          page: {
            margin: { top: 1418, right: 1418, bottom: 1418, left: 1418 },
            pageNumbers: {
              start: 1, // ✅ Numeracja od 1
              formatType: 'decimal',
            },
          },
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 20,
                    font: 'Times New Roman',
                  }),
                ],
              }),
            ],
          }),
        },
        children: fromWstep.flatMap(convertElement),
      });
    }
  } else {
    // Nie ma strony tytułowej - jedna sekcja z numeracją
    sections.push({
      properties: {
        page: {
          margin: { top: 1418, right: 1418, bottom: 1418, left: 1418 },
        },
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.RIGHT,
              children: [
                new TextRun({
                  children: [PageNumber.CURRENT],
                  size: 20,
                  font: 'Times New Roman',
                }),
              ],
            }),
          ],
        }),
      },
      children: elements.flatMap(convertElement),
    });
  }

  const doc = new Document({
    styles,
    numbering,
    sections,
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

// ============================================
// PDF GENERATOR
// ============================================
exports.generatePDF = async (req, res) => {
  const { content, topic, orderId, contentType } = req.body;

  const isAcademicWork =
    contentType === 'licencjacka' || contentType === 'magisterska';

  let titlePageData = null;
  if (orderId && isAcademicWork) {
    try {
      const order = await Order.findById(orderId);
      if (order && order.titlePageData) {
        titlePageData = order.titlePageData;
      }
    } catch (error) {
      console.error('Błąd:', error);
    }
  }

  const elements = parseHTML(content);
  const firstTextElement = elements.find((el) => el.text)?.text || 'document';
  const fileName = truncateFileName(topic || firstTextElement);
  const documentTitle = topic || firstTextElement;

  const doc = new PDFDocument({
    margins: { top: 70.87, bottom: 70.87, left: 70.87, right: 70.87 },
    size: 'A4',
    lang: 'pl',
    bufferPages: true,
  });

  doc.registerFont(
    'DejaVuSans',
    path.join(__dirname, '../fonts/DejaVuSans.ttf')
  );
  doc.registerFont(
    'DejaVuSansBold',
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

  let wstepPageNumber = -1; // ✅ Numer strony ze Wstępem
  let currentPageInDoc = 0;

  // Strona tytułowa
  if (isAcademicWork && titlePageData) {
    if (titlePageData.university) {
      doc
        .font('DejaVuSansBold')
        .fontSize(16)
        .text(titlePageData.university, { align: 'center' });
      doc.moveDown(0.5);
    }
    if (titlePageData.faculty) {
      doc
        .font('DejaVuSans')
        .fontSize(12)
        .text(titlePageData.faculty, { align: 'center' });
      doc.moveDown(0.3);
    }
    if (titlePageData.fieldOfStudy) {
      doc
        .font('DejaVuSans')
        .fontSize(11)
        .text(`Kierunek: ${titlePageData.fieldOfStudy}`, { align: 'center' });
      if (titlePageData.specialization) {
        doc.moveDown(0.2);
        doc.text(`Specjalizacja: ${titlePageData.specialization}`, {
          align: 'center',
        });
      }
      doc.moveDown(3);
    }
    if (titlePageData.workType) {
      doc
        .font('DejaVuSansBold')
        .fontSize(13)
        .text(titlePageData.workType, { align: 'center' });
      doc.moveDown(1);
    }
    doc
      .font('DejaVuSansBold')
      .fontSize(18)
      .text(documentTitle, { align: 'center' });
    doc.moveDown(4);
    if (titlePageData.studentName) {
      doc
        .font('DejaVuSans')
        .fontSize(12)
        .text(titlePageData.studentName, { align: 'center' });
      doc.moveDown(0.3);
    }
    if (titlePageData.studentIndexNumber) {
      doc
        .font('DejaVuSans')
        .fontSize(11)
        .text(`Nr indeksu: ${titlePageData.studentIndexNumber}`, {
          align: 'center',
        });
      doc.moveDown(1);
    }
    if (titlePageData.supervisor) {
      doc
        .font('DejaVuSans')
        .fontSize(11)
        .text(`Promotor: ${titlePageData.supervisor}`, { align: 'center' });
      doc.moveDown(4);
    }
    const cityYear = [];
    if (titlePageData.city) cityYear.push(titlePageData.city);
    if (titlePageData.year) cityYear.push(titlePageData.year);
    if (cityYear.length > 0) {
      doc
        .font('DejaVuSans')
        .fontSize(12)
        .text(cityYear.join(', '), { align: 'center' });
    }
    doc.addPage();
    currentPageInDoc = 1;
  }

  const lineHeight = 1.5;

  elements.forEach((element) => {
    const pageBeforeElement =
      doc.bufferedPageRange().start + doc.bufferedPageRange().count - 1;

    switch (element.type) {
      case 'h1':
        if (shouldStartNewPage(element.text)) {
          doc.addPage();
          currentPageInDoc++;
        }
        doc
          .font('DejaVuSansBold')
          .fontSize(18)
          .text(element.text, {
            align: 'left',
            continued: false,
            lineGap: 6 * lineHeight,
          });
        doc.moveDown(1);
        break;

      case 'h2':
        if (shouldStartNewPage(element.text)) {
          doc.addPage();
          currentPageInDoc++;
        }
        // ✅ Sprawdź czy to Wstęp
        if (wstepPageNumber === -1 && isWstep(element.text)) {
          wstepPageNumber =
            doc.bufferedPageRange().start + doc.bufferedPageRange().count - 1;
          console.log(`📍 Wstęp znaleziony na stronie: ${wstepPageNumber}`);
        }
        doc
          .font('DejaVuSansBold')
          .fontSize(16)
          .text(element.text, {
            align: 'left',
            continued: false,
            lineGap: 5 * lineHeight,
          });
        doc.moveDown(0.8);
        break;

      case 'h3':
        doc
          .font('DejaVuSansBold')
          .fontSize(14)
          .text(element.text, {
            align: 'left',
            continued: false,
            lineGap: 4 * lineHeight,
          });
        doc.moveDown(0.6);
        break;

      case 'p':
        doc.font(element.bold ? 'DejaVuSansBold' : 'DejaVuSans');
        doc.fontSize(12).text(element.text, {
          align: 'justify',
          continued: false,
          lineGap: 6 * lineHeight,
        });
        doc.moveDown(0.5);
        break;

      case 'ul':
        element.items.forEach((item) => {
          doc
            .font('DejaVuSans')
            .fontSize(12)
            .text(`• ${item}`, {
              align: 'left',
              continued: false,
              indent: 20,
              lineGap: 6 * lineHeight,
            });
          doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
        break;

      case 'ol':
        element.items.forEach((item, index) => {
          doc
            .font('DejaVuSans')
            .fontSize(12)
            .text(`${index + 1}. ${item}`, {
              align: 'left',
              continued: false,
              indent: 20,
              lineGap: 6 * lineHeight,
            });
          doc.moveDown(0.3);
        });
        doc.moveDown(0.5);
        break;

      case 'strong':
        doc
          .font('DejaVuSansBold')
          .fontSize(12)
          .text(element.text, {
            align: 'justify',
            continued: false,
            lineGap: 6 * lineHeight,
          });
        doc.moveDown(0.5);
        break;
    }
  });

  // ✅ NUMERACJA STRON - OD STRONY ZE WSTĘPEM
  if (isAcademicWork && wstepPageNumber >= 0) {
    const range = doc.bufferedPageRange();
    let pageCounter = 0;

    for (let i = range.start; i < range.start + range.count; i++) {
      // ✅ Numeruj TYLKO od strony ze Wstępem
      if (i >= wstepPageNumber) {
        pageCounter++;

        doc.switchToPage(i);

        const bottomY = doc.page.height - doc.page.margins.bottom + 10;
        const rightX = doc.page.width - doc.page.margins.right - 50;

        doc
          .font('DejaVuSans')
          .fontSize(10)
          .text(String(pageCounter), rightX, bottomY, {
            width: 50,
            align: 'right',
          });
      }
    }

    console.log(
      `✅ Numeracja PDF: ${pageCounter} stron od strony ${wstepPageNumber + 1}`
    );
  }

  doc.end();
};
