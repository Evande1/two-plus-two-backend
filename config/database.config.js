require('dotenv').config();

module.exports = {
    url: `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@two-plus-two.imfnuv0.mongodb.net/?retryWrites=true&w=majority`
}