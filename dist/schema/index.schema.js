"use strict";
var manual = require('./manual.schema')(validateRequest);
var cron = require('./cron.schema')(validateRequest);
function validateRequest(req, res, next, schema) {
    var options = {
        abortEarly: false,
        allowUnknown: true,
        stripUnknown: true // remove unknown props
    };
    var _a = schema.validate(req.body, options), error = _a.error, value = _a.value;
    if (error) {
        // req.error = {type: "Validation error", data: error.details.map((x:any) => x.message) };
        // next();
        // next({error: "Validation error", data: error.details.map((x:any) => x.message).join(', ') });
        res.contentType('application/json').status(400);
        res.send({ type: "Validation error", data: error.details.map(function (x) { return x.message; }) });
    }
    else {
        req.body = value;
        next();
    }
}
//account
module.exports.cron = cron;
module.exports.manual = manual;
