const CouponModel = require('../models/Coupon');

// create a new fav coupon
exports.addFavourites = async (req, res) => {
    if (!req.body.title) {
        return res.status(400).send({
            message: "Coupon title cannot be empty"
        });
    }
    if (!req.body.type) {
        return res.status(400).send({
            message: "Coupon type cannot be empty"
        });
    }
    if (!req.body.url) {
        return res.status(400).send({
            message: "Coupon url cannot be empty"
        });
    }
    const coupon = new CouponModel({
        title: req.body.title,
        type: req.body.type,
        url: req.body.url,
        expiry: req.body.expiry
    });

    await coupon.save().then(data => {
        res.send({
            message: "Coupon added successfully",
            user: data
        }).catch(err => {
            res.status(500).send({
                message: err.message || "Some error occurred while adding the coupon"
            });
        });
    });
};
// get all coupons from website
exports.search = (req, res) => {
    
}