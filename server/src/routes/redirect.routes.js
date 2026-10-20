const express = require('express');
const router = express.Router();
const { handleRedirect, getGateInfo, verifyPasswordAndUnlock } = require('../controllers/redirect.controller');

// Password gate endpoints
router.get('/api/gate-info/:slug', getGateInfo);
router.post('/api/verify-password/:slug', verifyPasswordAndUnlock);

// Short URL redirect endpoint
router.get('/:slug', handleRedirect);

module.exports = router;
