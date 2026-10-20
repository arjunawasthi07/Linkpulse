const express = require('express');
const router = express.Router();
const {
  createLink,
  getUserLinks,
  getLinkById,
  updateLink,
  deleteLink,
  getQrCode,
} = require('../controllers/links.controller');
const { verifyToken, optionalAuth } = require('../middleware/auth');
const { createLinkLimiter } = require('../middleware/rateLimiter');

// Create link (both guests and authenticated users can create links; authenticated links attach to account)
router.post('/', createLinkLimiter, optionalAuth, createLink);

// User links dashboard
router.get('/', verifyToken, getUserLinks);
router.get('/:id', verifyToken, getLinkById);
router.put('/:id', verifyToken, updateLink);
router.delete('/:id', verifyToken, deleteLink);

// Public QR Code retrieval
router.get('/qr/:slug', getQrCode);

module.exports = router;
