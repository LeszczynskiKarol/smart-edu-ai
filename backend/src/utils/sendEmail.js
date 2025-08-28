// backend/src/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // false dla portu 587 (TLS)
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
    tls: {
      ciphers: 'SSLv3',
      rejectUnauthorized: true,
    },
  });

  try {
    await transporter.verify();
  } catch (verifyError) {
    console.error('Błąd weryfikacji transportera:', verifyError);
    throw verifyError;
  }

  const message = {
    from: {
      name: process.env.FROM_NAME,
      address: process.env.FROM_EMAIL,
    },
    to: options.email,
    subject: options.subject,
    html: options.isHtml ? options.message : undefined,
    text: !options.isHtml ? options.message : undefined,
    // Usunięto headers z X-SES-CONFIGURATION-SET
  };

  try {
    const info = await transporter.sendMail(message);

    return info;
  } catch (error) {
    console.error('Błąd podczas wysyłania e-maila:', error);
    console.error('Szczegóły błędu:', {
      code: error.code,
      command: error.command,
      response: error.response,
    });
    throw error;
  }
};

module.exports = sendEmail;
