// backend/src/utils/currencyUtils.js
const { getExchangeRate } = require('./exchangeRateUtils');

const convertPLNtoUSD = async (amountPLN, providedRate = null) => {
  const rate = providedRate || (await getExchangeRate());
  if (!rate)
    throw new Error('Exchange rate is required for currency conversion');
  return Number((amountPLN / rate).toFixed(2));
};

const convertUSDtoPLN = async (amountUSD, providedRate = null) => {
  const rate = providedRate || (await getExchangeRate());
  if (!rate)
    throw new Error('Exchange rate is required for currency conversion');
  return Number((amountUSD * rate).toFixed(2));
};

module.exports = {
  convertPLNtoUSD,
  convertUSDtoPLN,
};
