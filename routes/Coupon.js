const express = require('express');
const couponController = require('../controllers/Coupon');
const router = express.Router();

router.get('/:type', couponController.search);