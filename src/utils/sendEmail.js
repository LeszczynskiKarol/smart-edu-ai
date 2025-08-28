// backend/src/utils/sendEmail.js
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Stwórz transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // Definiuj opcje wiadomości
  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    html: options.isHtml ? options.message : undefined,
    text: !options.isHtml ? options.message : undefined,
  };

  try {
    // Wyślij email

    const info = await transporter.sendMail(message);

    return info;
  } catch (error) {
    console.error('Błąd podczas wysyłania e-maila:', error);
    throw error;
  }
};

module.exports = sendEmail;
