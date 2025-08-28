// backend/src/routes/debugRoutes.js
const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  console.log('DEBUG:', req.body.args);
  res.status(200).end();
});

module.exports = router;
