// backend/src/controllers/adminUserController.js
const User = require('../models/User');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const crypto = require('crypto');
const sendEmail = require('../utils/sendEmail');
const { generateEmailTemplate } = require('../utils/emailTemplate');
const i18n = require('../config/i18n');

// @desc    Get all users with pagination and filters
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      role = '',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Role filter
    if (role) {
      query.role = role;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const users = await User.find(query)
      .select('-password')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await User.countDocuments(query);

    // Pobierz statystyki dla każdego użytkownika
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const orderStats = await Order.aggregate([
          { $match: { user: user._id } },
          {
            $group: {
              _id: null,
              totalOrders: { $sum: 1 },
              totalSpent: { $sum: '$totalPrice' },
            },
          },
        ]);

        return {
          ...user,
          stats: orderStats[0] || { totalOrders: 0, totalSpent: 0 },
        };
      })
    );

    res.status(200).json({
      success: true,
      data: usersWithStats,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / limit),
        count,
      },
    });
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania użytkowników',
      error: error.message,
    });
  }
};

// @desc    Get single user by ID
// @route   GET /api/admin/users/:id
// @access  Private/Admin
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Użytkownik nie znaleziony',
      });
    }

    // Pobierz statystyki
    const orderStats = await Order.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
        },
      },
    ]);

    const recentOrders = await Order.find({ user: user._id })
      .sort('-createdAt')
      .limit(5)
      .select('orderNumber totalPrice status createdAt');

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: orderStats[0] || { totalOrders: 0, totalSpent: 0 },
        recentOrders,
      },
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania użytkownika',
      error: error.message,
    });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
  try {
    const { name, email, role, companyDetails, isVerified } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Użytkownik nie znaleziony',
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (companyDetails) user.companyDetails = companyDetails;
    if (typeof isVerified !== 'undefined') user.isVerified = isVerified;

    await user.save();

    res.status(200).json({
      success: true,
      data: user,
      message: 'Użytkownik zaktualizowany pomyślnie',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji użytkownika',
      error: error.message,
    });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Użytkownik nie znaleziony',
      });
    }

    // Nie pozwalaj usunąć swojego konta
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        message: 'Nie możesz usunąć swojego własnego konta',
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Użytkownik usunięty pomyślnie',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas usuwania użytkownika',
      error: error.message,
    });
  }
};

// @desc    Adjust user balance
// @route   POST /api/admin/users/:id/balance
// @access  Private/Admin
exports.adjustUserBalance = async (req, res) => {
  try {
    const { amount, reason } = req.body;
    const locale = req.user?.locale || 'pl';
    i18n.setLocale(locale);

    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'Nieprawidłowa kwota',
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Użytkownik nie znaleziony',
      });
    }

    const oldBalance = user.accountBalance;
    user.accountBalance += parseFloat(amount);

    // Zapisz transakcję w Payment
    const payment = await Payment.create({
      user: user._id,
      amount: Math.abs(amount),
      type: amount > 0 ? 'admin_top_up' : 'admin_deduction',
      status: 'completed',
      description: reason || 'Korekta salda przez admina',
      adminNote: `Zmiana: ${amount} (${oldBalance} → ${user.accountBalance})`,
    });

    await user.save();

    // Wyślij email do użytkownika
    const emailContent = `
      <h2>Zmiana salda konta</h2>
      <p>Twoje saldo zostało ${amount > 0 ? 'zwiększone' : 'zmniejszone'} przez administratora.</p>
      <div class="card">
        <p class="card-title">Szczegóły:</p>
        <ul>
          <li><strong>Kwota zmiany:</strong> ${amount > 0 ? '+' : ''}${amount.toFixed(2)} PLN</li>
          <li><strong>Nowe saldo:</strong> ${user.accountBalance.toFixed(2)} PLN</li>
          ${reason ? `<li><strong>Powód:</strong> ${reason}</li>` : ''}
        </ul>
      </div>
    `;

    const emailData = {
      title: 'Zmiana salda konta - Smart-Edu.ai',
      headerTitle: 'Smart-Edu.ai',
      content: emailContent,
    };

    const emailHtml = generateEmailTemplate(emailData);

    try {
      await sendEmail({
        email: user.email,
        subject: 'Zmiana salda konta',
        message: emailHtml,
        isHtml: true,
      });
    } catch (emailError) {
      console.error('Error sending email:', emailError);
    }

    res.status(200).json({
      success: true,
      data: {
        oldBalance,
        newBalance: user.accountBalance,
        amount: parseFloat(amount),
      },
      message: 'Saldo zaktualizowane pomyślnie',
    });
  } catch (error) {
    console.error('Error adjusting balance:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas aktualizacji salda',
      error: error.message,
    });
  }
};

// @desc    Reset user password
// @route   POST /api/admin/users/:id/reset-password
// @access  Private/Admin
exports.resetUserPassword = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const locale = req.user?.locale || 'pl';
    i18n.setLocale(locale);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Użytkownik nie znaleziony',
      });
    }

    // Wygeneruj token resetowania
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 godziny

    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const emailContent = `
      <h2>Reset hasła</h2>
      <p>Administrator zresetował Twoje hasło.</p>
      <p>Kliknij poniższy link, aby ustawić nowe hasło:</p>
      <p style="text-align: center; margin-top: 30px;">
        <a href="${resetUrl}" class="button">Ustaw nowe hasło</a>
      </p>
      <p>Link będzie ważny przez 24 godziny.</p>
    `;

    const emailData = {
      title: 'Reset hasła - Smart-Edu.ai',
      headerTitle: 'Smart-Edu.ai',
      content: emailContent,
    };

    const emailHtml = generateEmailTemplate(emailData);

    await sendEmail({
      email: user.email,
      subject: 'Reset hasła - Smart-Edu.ai',
      message: emailHtml,
      isHtml: true,
    });

    res.status(200).json({
      success: true,
      message: 'Link do resetowania hasła został wysłany',
    });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas resetowania hasła',
      error: error.message,
    });
  }
};

// @desc    Get user orders
// @route   GET /api/admin/users/:id/orders
// @access  Private/Admin
exports.getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const orders = await Order.find({ user: req.params.id })
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments({ user: req.params.id });

    res.status(200).json({
      success: true,
      data: orders,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(count / limit),
        count,
      },
    });
  } catch (error) {
    console.error('Error getting user orders:', error);
    res.status(500).json({
      success: false,
      message: 'Błąd podczas pobierania zamówień',
      error: error.message,
    });
  }
};
