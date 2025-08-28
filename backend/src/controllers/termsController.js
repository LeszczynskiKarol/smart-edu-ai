// backend/src/controllers/termsController.js
exports.getPrivacyPolicy = async (req, res) => {
  try {
    const locale = req.query.locale || 'pl';

    res.status(200).json({
      success: true,
      message: 'Privacy policy fetched successfully',
      locale: locale,
    });
  } catch (error) {
    console.error('Error fetching privacy policy:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching privacy policy',
    });
  }
};

exports.getTermsOfService = async (req, res) => {
  try {
    const locale = req.query.locale || 'pl';

    res.status(200).json({
      success: true,
      message: 'Terms of service fetched successfully',
      locale: locale,
    });
  } catch (error) {
    console.error('Error fetching terms of service:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching terms of service',
    });
  }
};
