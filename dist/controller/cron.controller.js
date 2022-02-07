"use strict";
var express = require('express');
var router = express.Router();
var cronService = require('../services/cron.service');
var cron = require('../schema/index.schema').cron;
var schedule = require('node-schedule');
// routes
// router.post('/getAll', sumProtein);
function checkReminder() {
    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
    rule.hour = 13;
    rule.minute = 0;
    var j = schedule.scheduleJob(rule, function () {
        cronService.getUserReminder()
            .then(function (resp) {
            console.log("users To checkReminder:", resp);
        })
            .catch(function (err) {
            console.log("error in checkReminder", err);
        });
    });
}
function checkNormal() {
    var rule = new schedule.RecurrenceRule();
    rule.dayOfWeek = [0, 1, 2, 3, 4, 5, 6];
    rule.hour = 10;
    rule.minute = 0;
    var j = schedule.scheduleJob(rule, function () {
        cronService.getUserNormal()
            .then(function (resp) {
            console.log("users To checkReminder:", resp);
        })
            .catch(function (err) {
            console.log("error in checkReminder", err);
        });
    });
}
function checkHourly() {
    console.log("starting hourly");
    var j = schedule.scheduleJob('1 * * * *', function () {
        cronService.getUserhourly()
            .then(function (resp) {
            console.log("users To checkReminder:", resp);
        })
            .catch(function (err) {
            console.log("error in checkReminder", err);
        });
    });
}
checkReminder();
checkNormal();
checkHourly();
module.exports = router;
