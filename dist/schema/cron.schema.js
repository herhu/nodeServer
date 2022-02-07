"use strict";
var Joi = require('joi');
module.exports = function (validateRequest) {
    return {
        cron: function (req, res, next) {
            var schema = Joi.object({
                name: Joi.string().required(),
            });
            validateRequest(req, res, next, schema);
        }
    };
};
