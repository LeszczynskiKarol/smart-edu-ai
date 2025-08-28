// src/utils/emailTemplate.js

function generateEmailTemplate(data) {
  return `
        <!DOCTYPE html>
  <html lang="pl">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>${data.title}</title>
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style>
        body {
          font-family: "Roboto", Arial, sans-serif;
          line-height: 1.6;
          color: #1f2937;
          margin: 0;
          padding: 0;
          background-color: #f3f4f6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #ffffff;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
          background: linear-gradient(to bottom, #f8fafc, #ffffff);
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
        }
        .logo-icon {
          width: 32px;
          height: 32px;
          fill: #2563eb;
        }
        .content {
          padding: 20px;
          color: #374151;
        }
        .footer {
          background: linear-gradient(to top, #f8fafc, #ffffff);
          padding: 20px;
          text-align: center;
          border-radius: 0 0 8px 8px;
          color: #6b7280;
        }
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          font-family: "Roboto", Arial, sans-serif;
          color: #111827;
        }
        h1 {
          font-size: 24px;
          font-weight: 600;
        }
        h2 {
          font-size: 20px;
          color: #1f2937;
        }
        .button {
          display: inline-block;
          padding: 10px 20px;
          background-color: #2563eb;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 500;
          transition: background-color 0.3s ease;
        }
        .button:hover {
          background-color: #1d4ed8;
        }
        .card {
          background-color: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 5px;
          padding: 15px;
          margin-bottom: 15px;
        }
        .card-title {
          font-weight: 600;
          color: #111827;
        }
        a {
          color: #2563eb;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <svg
            class="logo-icon"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              d="M22 8a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h12a4 4 0 0 0 4-4Z"
            />
            <path d="M12 17v-6" />
            <path d="m9 11 3-3 3 3" />
          </svg>
          <h1>${data.headerTitle}</h1>
        </div>
        <div class="content">${data.content}</div>
        <div class="footer">
          <p>© ${new Date().getFullYear()}</p>
          <p>
            <a href="${process.env.FRONTEND_URL}"></a>
          </p>
        </div>
      </div>
    </body>
  </html>
  
      `;
}

module.exports = { generateEmailTemplate };
