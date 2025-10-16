// backend/src/controllers/makeWebhookController.js
const Order = require('../models/Order');

exports.handleImportPost = async (req, res) => {
  try {
    const { orderId, itemId, content } = req.body;

    if (!orderId || !itemId || !content) {
      return res.status(400).json({
        success: false,
        message: 'Brak wymaganych danych (orderId, itemId lub content)',
      });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      console.log(`Nie znaleziono zamówienia o ID: ${orderId}`);
      return res.status(404).json({
        success: false,
        message: 'Zamówienie nie znalezione',
      });
    }

    // Znajdujemy konkretny item po ID
    const item = order.items.id(itemId);
    if (!item) {
      console.log(`Nie znaleziono itemu o ID: ${itemId}`);
      return res.status(404).json({
        success: false,
        message: 'Item nie znaleziony',
      });
    }

    // Aktualizujemy tylko ten konkretny item
    item.content = content;
    item.status = 'zakończone';

    // Sprawdzamy czy wszystkie itemy są zakończone
    const allItemsCompleted = order.items.every(
      (item) => item.status === 'zakończone'
    );

    // Tylko jeśli wszystkie itemy są zakończone, zmieniamy status całego zamówienia
    if (allItemsCompleted) {
      order.status = 'zakończone';

      // Wysyłanie powiadomienia email tylko gdy całe zamówienie jest gotowe
      //const user = await User.findById(order.user);
      //if (user && user.email) {
      //  const locale = req.locale || req.body.locale || 'pl';
      //        i18n.setLocale(locale);

      //const emailContent = `
      //<h2>${i18n.__mf('orders.completion.title', { orderNumber: order.orderNumber })}</h2>
      //<p>${i18n.__mf('orders.completion.allCompleted', { orderNumber: order.orderNumber })}</p>
      //<p><a href="${process.env.FRONTEND_URL}/dashboard/orders/${order._id}" class="button">
      //${i18n.__('orders.completion.viewContent')}</a></p>
      //`;

      //const emailData = {
      //          title: 'Smart-Copy.ai',
      //headerTitle: 'Smart-Copy.ai',
      //content: emailContent,
      //};

      //const emailHtml = generateEmailTemplate(emailData);

      //await sendEmail({
      //          email: user.email,
      //subject: i18n.__mf('orders.completion.subject', {
      //            orderNumber: order.orderNumber,
      //}),
      //message: emailHtml,
      //isHtml: true,
      //});
      //}
    }

    await order.save();

    return res.status(200).json({
      success: true,
      message: 'Treść zamówienia została zaktualizowana',
      order: {
        id: order._id,
        status: order.status,
        orderNumber: order.orderNumber,
      },
    });
  } catch (error) {
    console.error('Błąd podczas importowania treści:', error);
    res.status(500).json({
      success: false,
      message: 'Wystąpił błąd podczas importowania treści',
      error: error.message,
    });
  }
};
