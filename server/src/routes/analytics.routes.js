const express = require('express');
const router = express.Router();
const { getLinkAnalytics, getUserSummaryAnalytics } = require('../controllers/analytics.controller');
const { verifyToken } = require('../middleware/auth');

router.get('/summary', verifyToken, getUserSummaryAnalytics);
router.get('/:id', verifyToken, getLinkAnalytics);

module.exports = router;
