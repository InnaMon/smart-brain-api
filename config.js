const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    PORT: process.env.PORT,
    CLARIFAI_API: process.env.CLARIFAI_API,
    DATABASE_URL: process.env.DATABASE_URL
};