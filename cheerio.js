// Loading the dependencies. We don't need pretty
// because we shall not log html to the terminal
const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");

// URL of the page we want to scrape
const url = "https://www.bkcoupons.sg";

// Async function which scrapes the data
async function scrapeData() {
    try {
        // Fetch HTML of the page we want to scrape
        const { data } = await axios.get(url);
        // Load HTML we fetched in the previous line
        const $ = cheerio.load(data);

        const $hp_coupon_item = $('div.hp-coupon-item').not('#shareWithFriends')
        const items = []

        $hp_coupon_item.each((idx, el) => {
            // console.log(pretty($(el).html(), { ocd: true }))
            const obj = {
                'title': '',
                'url': '',
            }

            const title = $(el).find('div.coupon-card-btn-main').find('a.share-btn-mobile').attr('data-title')
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

        // console.log(items)

        return items

    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    scrapeData
}