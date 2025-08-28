// backend/src/utils/exchangeRateUtils.js
const axios = require('axios');

let currentRate = null;
let lastUpdate = null;
const RATE_VALIDITY_MINUTES = 60;

const fetchExchangeRate = async () => {
  try {
    const response = await axios.get(
      'https://api.nbp.pl/api/exchangerates/rates/A/USD/'
    );
    const rate = response.data.rates[0].mid;
    currentRate = rate;
    lastUpdate = new Date();
    return rate;
  } catch (error) {
    console.error('Error fetching exchange rate:', error);
    throw error;
  }
};

const getExchangeRate = async () => {
  // Jeśli nie mamy kursu lub minęło więcej niż RATE_VALIDITY_MINUTES minut
  if (
    !currentRate ||
    !lastUpdate ||
    new Date().getTime() - lastUpdate.getTime() >
      RATE_VALIDITY_MINUTES * 60 * 1000
  ) {
    await fetchExchangeRate();
  }
  return currentRate;
};

module.exports = {
  getExchangeRate,
  fetchExchangeRate,
};
