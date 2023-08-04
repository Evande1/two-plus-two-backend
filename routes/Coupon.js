const express = require('express');
const couponController = require('../controllers/Coupon');
const router = express.Router();

// router.get('/:type', couponController.search);
router.get('/kfc', couponController.searchKFC);
router.get('/bk', couponController.searchBK);
router.get('/scp', couponController.searchSCP);
router.post('/addfavourites', couponController.addFavourites);
router.get('/getfavourites', couponController.getFavourites);
router.post('/removefavourites', couponController.removeFavourites);

module.exports = router;