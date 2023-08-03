const CouponModel = require('../models/CouponModel');
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");

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
// get kfc coupons
exports.searchKFC = async (req, res) => {
    try {
        const coupons = await scrapeKFCcoupons();
        res.status(200).json(coupons);
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
}

async function scrapeKFCcoupons() {
      try {
        const url = "https://www.kfc.com.sg/Coupon/Promotion";
        // Fetch HTML of the page we want to scrape
        const { data } = await axios.get(url);
        // Load HTML we fetched in the previous line
        const $ = cheerio.load(data);
        const items = [];
        const listItems = $('.coupon-box > .row > .col-xs-12 > .row > .col-xs-12 > .row > .col-xs-6');
        listItems.each((idx, el) => {
            const coupon = { title: "", url: url, type: "KFC", expiry: ""};
            coupon.title = $(el).attr("data-promo-title");
            const expiry = $(el).find('.menu-item > .name-desc > .description').text();
            if (expiry.indexOf('Expires on') != -1) {
                coupon.expiry = expiry.substring(expiry.indexOf('Expires on') + 12)
            }
            items.push(coupon);
            // console.log(coupon.title);
            // photo? 
            // expiry date
        })
        console.dir(items);
        return items;

      } catch (err) {
        console.error(err);
      }
    }