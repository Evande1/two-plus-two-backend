const CouponModel = require('../models/CouponModel');
const axios = require("axios");
const cheerio = require("cheerio");
const fs = require("fs");
const coupon = require('../models/CouponModel');

// create a new fav coupon
exports.addFavourites = async (req, res) => {
    console.log(req.body)
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
        })
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while adding the coupon"
        });
    });
};

exports.getFavourites = async (req, res) => {
    coupon.find({}).select({
        title: 1,
        type: 1,
        url: 1,
        expiry: 1,
        _id: 0,
    }).then(data => {
        res.status(200).json(data);
    }).catch(err => {
        res.status(404).json({ message: err.message })
    })
}

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

// get bk coupons
exports.searchBK = async (req, res) => {
    try {
        const coupons = await scrapeBKcoupons();
        res.status(200).json(coupons);
    } catch (err) {
        res.status(404).json({ message: err.message })
    }
}

// Async function which scrapes the data
async function scrapeBKcoupons() {
    try {
        // URL of the page we want to scrape
        const url = "https://www.bkcoupons.sg";
        // Fetch HTML of the page we want to scrape
        const { data } = await axios.get(url);
        // Load HTML we fetched in the previous line
        const $ = cheerio.load(data);

        const $hp_coupon_item = $('div.hp-coupon-item').not('#shareWithFriends')
        const items = []

        $hp_coupon_item.each((idx, el) => {
            // console.log(pretty($(el).html(), { ocd: true }))
            const obj = {
                title: '',
                url: '',
                type: 'BK',
                expiry: ''
            }

            const title = $(el).find('div.coupon-card-btn-main > a.share-btn-mobile').attr('data-title')
            if (title) {
                obj.title = title
            }

            const href = $(el).find('a').attr('href')
            if (href && href.charAt(0) === "/") {
                obj.url = url + href
            }

            items.push(obj)
            // console.log(obj)
        })

        console.dir(items);

        return items

    } catch (err) {
        console.error(err);
    }
}