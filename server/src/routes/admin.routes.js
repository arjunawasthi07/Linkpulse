const express = require('express');
const router = express.Router();
const { getPlatformStats, getAllUsers, getAllLinks, deleteUser } = require('../controllers/admin.controller');
const { verifyToken, requireAdmin } = require('../middleware/auth');

router.use(verifyToken, requireAdmin);

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/links', getAllLinks);

module.exports = router;
