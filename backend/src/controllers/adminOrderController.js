// backend/src/controllers/adminOrderController.js
const Order = require('../models/Order');
const User = require('../models/User');
// const Comment = require('../models/Comment');
const multer = require('multer');
const {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} = require('@aws-sdk/client-s3');
const path = require('path');

// Konfiguracja S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'eu-north-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// Konfiguracja multer dla przesyłania plików
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
}).single('file');

// Pobierz wszystkie zamówienia
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania zamówień',
      error: error.message,
    });
  }
};

// Pobierz zamówienie po ID
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate('user', 'name email')
      .lean();

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Zamówienie nie znalezione',
      });
    }

    return res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania zamówienia',
      error: error.message,
    });
  }
};

// Aktualizuj status zamówienia
exports.updateOrderStatus = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }

      const { orderId } = req.params;
      const { status } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Zamówienie nie znalezione',
        });
      }

      // Aktualizuj status
      order.status = status;
      order.lastUpdated = new Date();

      // DODANE: Aktualizuj status WSZYSTKICH itemów
      if (status === 'zakończone') {
        order.items.forEach((item) => {
          item.status = 'zakończone';
        });
      } else if (status === 'w trakcie') {
        order.items.forEach((item) => {
          if (item.status === 'oczekujące') {
            item.status = 'w trakcie';
            if (!item.startTime) {
              item.startTime = new Date();
            }
          }
        });
      } else if (status === 'anulowane') {
        order.items.forEach((item) => {
          item.status = 'oczekujące';
        });
      }

      // Jeśli załączono pliki do zamówienia zakończonego
      if (req.file && status === 'zakończone') {
        const fileExtension = path.extname(req.file.originalname);
        const fileName = `order-${orderId}-${Date.now()}${fileExtension}`;
        const s3Key = `orders/${orderId}/completed/${fileName}`;

        const uploadParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: s3Key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

        if (!order.attachments) {
          order.attachments = {};
        }
        if (!order.attachments.other) {
          order.attachments.other = [];
        }
        order.attachments.other.push({
          filename: req.file.originalname,
          url: fileUrl,
          uploadDate: new Date(),
        });
      }

      await order.save();

      return res.status(200).json({
        success: true,
        data: order,
        message: 'Status zamówienia zaktualizowany',
      });
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji statusu',
      error: error.message,
    });
  }
};

// Załącz plik do zamówienia
exports.attachFileToOrder = async (req, res) => {
  try {
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          error: err.message,
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Brak pliku',
        });
      }

      const { orderId } = req.params;
      const { fileType } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Zamówienie nie znalezione',
        });
      }

      // Przygotuj nazwę pliku i ścieżkę S3
      const fileExtension = path.extname(req.file.originalname);
      const fileName = `${fileType}-${Date.now()}${fileExtension}`;
      const s3Key = `orders/${orderId}/${fileType}/${fileName}`;

      // Upload do S3
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Key: s3Key,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      await s3Client.send(new PutObjectCommand(uploadParams));

      const fileUrl = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

      // Zapisz w bazie
      if (!order.attachments) {
        order.attachments = {};
      }

      if (fileType === 'other') {
        if (!order.attachments.other) {
          order.attachments.other = [];
        }
        order.attachments.other.push({
          filename: req.file.originalname,
          url: fileUrl,
          uploadDate: new Date(),
        });
      } else {
        order.attachments[fileType] = {
          filename: req.file.originalname,
          url: fileUrl,
          uploadDate: new Date(),
        };
      }

      await order.save();

      return res.status(200).json({
        success: true,
        data: order,
        message: 'Plik został dodany',
      });
    });
  } catch (error) {
    console.error('Error attaching file:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas dodawania pliku',
      error: error.message,
    });
  }
};

// Usuń załącznik z zamówienia
exports.deleteOrderAttachment = async (req, res) => {
  try {
    const { orderId, fileType, fileIndex } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Zamówienie nie znalezione',
      });
    }

    let fileToDelete;

    if (fileType === 'other') {
      const index = parseInt(fileIndex);
      if (!order.attachments?.other?.[index]) {
        return res.status(404).json({
          success: false,
          message: 'Plik nie znaleziony',
        });
      }
      fileToDelete = order.attachments.other[index];
      order.attachments.other.splice(index, 1);
    } else {
      if (!order.attachments?.[fileType]) {
        return res.status(404).json({
          success: false,
          message: 'Plik nie znaleziony',
        });
      }
      fileToDelete = order.attachments[fileType];
      delete order.attachments[fileType];
    }

    // Usuń z S3
    if (fileToDelete?.url) {
      const s3Key = fileToDelete.url.split('.amazonaws.com/')[1];
      if (s3Key) {
        const deleteParams = {
          Bucket: process.env.AWS_S3_BUCKET_NAME,
          Key: s3Key,
        };
        await s3Client.send(new DeleteObjectCommand(deleteParams));
      }
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Plik został usunięty',
    });
  } catch (error) {
    console.error('Error deleting attachment:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas usuwania pliku',
      error: error.message,
    });
  }
};

// Pobierz komentarze do zamówienia
exports.getOrderComments = async (req, res) => {
  try {
    const { orderId } = req.params;

    // Sprawdź czy istnieje model Comment
    let comments = [];
    try {
      const Comment = require('../models/Comment');
      comments = await Comment.find({ order: orderId })
        .populate('user', 'name email role')
        .sort({ createdAt: 1 });
    } catch (err) {
      // Model Comment nie istnieje, zwróć pustą tablicę
      console.log('Comment model not found, returning empty array');
    }

    return res.status(200).json({
      success: true,
      data: comments,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania komentarzy',
      error: error.message,
    });
  }
};

exports.deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findByIdAndDelete(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: 'Zamówienie nie znalezione' });
    }

    return res
      .status(200)
      .json({ success: true, message: 'Zamówienie usunięte' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// Pobierz statystyki dla admina
exports.getAdminStats = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'oczekujące' });
    const processingOrders = await Order.countDocuments({
      status: 'w trakcie',
    });
    const completedOrders = await Order.countDocuments({
      status: 'zakończone',
    });
    const cancelledOrders = await Order.countDocuments({ status: 'anulowane' });

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isVerified: true });

    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    return res.status(200).json({
      success: true,
      data: {
        orders: {
          total: totalOrders,
          pending: pendingOrders,
          processing: processingOrders,
          completed: completedOrders,
          cancelled: cancelledOrders,
        },
        users: {
          total: totalUsers,
          active: activeUsers,
        },
        revenue: {
          total: totalRevenue[0]?.total || 0,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania statystyk',
      error: error.message,
    });
  }
};

exports.updateItemContent = async (req, res) => {
  try {
    const { orderId, itemId } = req.params;
    const { content } = req.body;

    if (!content && content !== '') {
      return res.status(400).json({
        success: false,
        message: 'Brak treści do zapisania',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Zamówienie nie znalezione',
      });
    }

    const item = order.items.id(itemId);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Item nie znaleziony',
      });
    }

    item.content = content;

    if (content && content.length > 0 && item.status === 'oczekujące') {
      item.status = 'w trakcie';
    }

    await order.save();

    return res.status(200).json({
      success: true,
      data: {
        item,
        message: 'Treść została zaktualizowana',
      },
    });
  } catch (error) {
    console.error('Error updating item content:', error);
    return res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji treści',
      error: error.message,
    });
  }
};

module.exports = exports;
