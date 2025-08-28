// backend/src/controllers/paperController.js
exports.getPaper = async (req, res) => {
  try {
    const locale = req.query.locale || 'pl';

    res.status(200).json({
      success: true,
      message: 'Paper fetched successfully',
      locale: locale,
    });
  } catch (error) {
    console.error('Error fetching paper:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching paper',
    });
  }
};
