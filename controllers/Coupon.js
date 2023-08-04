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

    if (await CouponModel.exists({
        title: req.body.title,
        type: req.body.type,
        url: req.body.url,
        expiry: req.body.expiry
    })) {
        return res.status(400).send({
            message: "Coupon already exists"
        });
    }

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

exports.removeFavourites = async (req, res) => {
    console.log(req.body)
    const couponId = await CouponModel.exists({
        title: req.body.title,
        type: req.body.type,
        url: req.body.url,
        expiry: req.body.expiry
    })

    if (couponId === null) {
        return res.status(400).send({
            message: "Coupon does not exist"
        });
    }

    CouponModel.findOneAndDelete(couponId).then(data => {
        res.send({
            message: "Coupon removed successfully",
            user: data
        })
    }).catch(err => {
        res.status(500).send({
            message: err.message || "Some error occurred while deleting the coupon"
        });
    });
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

// get scoop coupons
exports.searchSCP = async (req, res) => {
	try {
		const coupons = await scrapeSCPcoupons();
		res.status(200).json(coupons);
	} catch (err) {
		res.status(404).json({ message: err.message });
	}
};

async function scrapeSCPcoupons() {
	try {
		const main_url = "https://scoopwholefoodsshop.com";
        const sub_url=  "/collections/promotion"
        const url = main_url + sub_url;
		// Fetch HTML of the page we want to scrape
		const { data } = await axios.get(url);
		// Load HTML we fetched in the previous line
		const $ = cheerio.load(data);
		const maxPgNum = parseInt($(".pagination--number").last().text());
        //console.log(maxPgNum);
		const items = [];

		for (let i = 1; i < maxPgNum + 1; i++) {
			const pgNum = i.toString();
            //console.log(i);
            const url = `https://scoopwholefoodsshop.com/collections/promotion?page=${pgNum}#collection-root`;
			// Fetch HTML of the page we want to scrape
			const { data } = await axios.get(url);
			// Load HTML we fetched in the previous line
			const $ = cheerio.load(data);

			const listItems = $(".product--root");
			//console.log(listItems.length);

			listItems.each((idx, el) => {
				const coupon = {
					title: "",
					url: url,
					type: "SCOOP",
					expiry: "",
				};

                const href = $(el).find('a').attr('href')
                if (href && href.charAt(0) === "/") {
                    coupon.url = main_url + href
                }

				const title = $(el).find('a > .product--details-container > .product--details > .product--details-wrapper > .product--title').text();
				//console.log(title);
                const price = $(el).find('a > .product--details-container > .product--details > .product--price-container > .product--price-wrapper > .product--price').text();
				//console.log(title, price);
				coupon.title = title + price;
				items.push(coupon);
				//console.log(coupon.title);
			});
		}

		//console.dir(items);
        //console.log(items.length);
		return items;
	} catch (err) {
		console.error(err);
	}
}