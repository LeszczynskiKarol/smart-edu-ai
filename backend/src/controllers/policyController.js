// backend/src/controllers/policyController.js
exports.getPrivacyPolicy = async (req, res) => {
  try {
    const locale = req.query.locale || 'pl';
    const translations = {
      pl: require('../../messages/pl.json'),
      en: require('../../messages/en.json'),
    };

    const privacyPolicy = translations[locale].Privacy;

    if (!privacyPolicy) {
      return res.status(404).json({
        success: false,
        message: 'Privacy policy not found for this language',
      });
    }

    res.status(200).json({
      success: true,
      data: privacyPolicy,
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
