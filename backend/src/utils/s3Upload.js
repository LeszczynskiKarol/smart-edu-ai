// backend/src/utils/s3Upload.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const multer = require('multer');
const multerS3 = require('multer-s3');

if (!process.env.NEXT_AWS_BUCKET_NAME) {
  throw new Error(
    'NEXT_AWS_BUCKET_NAME is not defined in environment variables'
  );
}

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.NEXT_AWS_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const fileName = `images/${Date.now()}-${file.originalname}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 },
});

const uploadSingle = async (file) => {
  if (!file) {
    throw new Error('Nie przesłano pliku');
  }

  // Jeśli plik już został przesłany przez multer-s3, zwróć jego lokalizację
  if (file.location) {
    return {
      originalname: file.originalname,
      location: `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.NEXT_AWS_BUCKET_NAME}/${params.Key}`,
    };
  }

  // Jeśli mamy plik z multera
  if (file.buffer && file.originalname && file.mimetype) {
    const params = {
      Bucket: process.env.NEXT_AWS_BUCKET_NAME,
      Key: `images/${Date.now()}-${file.originalname}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(params);
      await s3Client.send(command);
      return {
        originalname: file.originalname,
        location: `https://s3.${process.env.AWS_REGION}.amazonaws.com/${process.env.NEXT_AWS_BUCKET_NAME}/${params.Key}`,
      };
    } catch (err) {
      console.error('Error uploading to S3:', err);
      throw err;
    }
  }

  throw new Error('Nieprawidłowy format pliku');
};

module.exports = { upload, uploadSingle };
