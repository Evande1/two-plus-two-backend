const express = require('express');
const couponController = require('../controllers/Coupon');
const router = express.Router();

// router.get('/:type', couponController.search);
router.get('/kfc', couponController.searchKFC);

module.exports = router;