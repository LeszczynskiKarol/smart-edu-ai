// src/utils/s3Upload.js
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

let s3Client;

if (typeof window === 'undefined') {
  // Kod wykonywany tylko po stronie serwera
  if (!process.env.NEXT_PUBLIC_AWS_BUCKET_NAME) {
    console.warn('AWS_BUCKET_NAME is not defined in environment variables');
  }

  s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });
}

const uploadSingle = async (file) => {
  if (!file) {
    throw new Error('Nie przesłano pliku');
  }

  let buffer, fileName, fileType;

  if (file.buffer && file.originalname && file.mimetype) {
    // File from multer
    buffer = file.buffer;
    fileName = file.originalname;
    fileType = file.mimetype;
  } else if (file instanceof Blob || file instanceof File) {
    // Standard File or Blob object
    buffer = await file.arrayBuffer();
    fileName = file.name;
    fileType = file.type;
  } else if (typeof file === 'object' && file.originalname && file.location) {
    // File already uploaded by multer-s3
    return {
      originalname: file.originalname,
      location: file.location,
    };
  } else {
    console.error('Nieprawidłowy format pliku:', file);
    throw new Error('Nieprawidłowy format pliku');
  }

  const params = {
    Bucket: process.env.NEXT_AWS_BUCKET_NAME,
    Key: `orders/${Date.now()}-${fileName}`,
    Body: buffer,
    ContentType: fileType,
  };

  try {
    const command = new PutObjectCommand(params);
    await s3Client.send(command);
    return {
      originalname: fileName,
      location: `https://${process.env.NEXT_AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`,
    };
  } catch (err) {
    console.error('Error uploading to S3:', err);
    throw err;
  }
};

module.exports = { uploadSingle };
