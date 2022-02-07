"use strict";
var dotenv = require('dotenv');
var path = require('path');

dotenv.config({
    path: path.resolve(__dirname, process.env.NODE_ENV + '.env')
});

module.exports = {
    
    NODE_ENV: process.env.NODE_ENV || 'development',
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 3500,
    USER_BD: process.env.USER_BD,
    PASS_BD: process.env.PASS_BD,
    CONNECT_STRING:process.env.CONNECT_STRING,
    COOKIE_SECRET:process.env.COOKIE_SECRET,
    SECRET:process.env.SECRET,
    FRONT_URL:process.env.FRONT_URL,
    URL_FOLDER:process.env.THE_PATH
};
