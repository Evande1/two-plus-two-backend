const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const dbConfig = require('./config/database.config.js');
const mongoose = require('mongoose');
const { scrapeData } = require('./cheerio.js');

mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
}).then(() => {
    console.log("Databse Connected Successfully!!");    
}).catch(err => {
    console.log('Could not connect to the database', err);
    process.exit();
});
app.get('/', (req, res) => {
    res.json({message: "Hello Crud Node Express"});
});
app.listen(5000, () => {
    console.log("Server is listening on port 5000");
});
app.get('/cheerio', (req, res) => {
    // Scraping code
    scrapeData().then((data) => {
        res.json({"data": data});
    })
});