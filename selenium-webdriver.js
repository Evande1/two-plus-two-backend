const { Builder, By } = require('selenium-webdriver');

// URL of the page we want to scrape
const url = "https://www.bkcoupons.sg";

async function scrapeData() {
    try {
        driver = await new Builder().forBrowser('MicrosoftEdge').build();
        await driver.get(url);
        const elements = await driver.findElements(
            By.js(() => {
                return document.querySelectorAll('div.hp-coupon-item:not([id*="shareWithFriends"])')
            })
        );

        return await getItems(elements);
    } catch (error) {
        console.error(error);
    } finally {
        await driver.quit();
    }
}

async function getItems(elements) {
    const items = [];

    try {
        for (const element of elements) {
            const obj = {
                'title': '',
                'url': '',
            }

            const title = await element.findElement(By.css('div.coupon-card-btn-main > a.share-btn-mobile')).getAttribute('data-title')
            if (title) {
                obj.title = title
            }

            const href = await element.findElement(By.css('a')).getAttribute('href')
            if (href) {
                obj.url = href
            }

            items.push(obj)
        }
    } catch (error) {
        console.error(error);
    }

    return items;
}

module.exports = {
    scrapeData
}