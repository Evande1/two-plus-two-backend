var mongoose = require('mongoose');

var schema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        default:''
    },
    type: {
        type: String,
        required: true
    },
    expiry: {
        type: Date,
        default: null
    }
})

var coupon = new mongoose.model('Coupon', schema);

module.exports = coupon;