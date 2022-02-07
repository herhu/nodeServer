"use strict";
module.exports = function (app) {
    app.use('/manual', require('./manual.controller'));
    app.use('/cron', require('./cron.controller'));
};
