"use strict";
const express = require('express');
const router = express.Router();
const manualService = require('../services/manual.service');
const restricted = require('../services/restricted.js')
const webpayPlusController = require("../controller/webpay_plus");
const config = require('../config');
var fs = require("fs");

const decrypt_first = (req, res, next) => {
    res.contentType('application/json').status(200);
    manualService.decryptFirst(req.body.encrypted)
        .then(async data => {
            req.session.bred = `O-${data[0].RESORT}-${Math.floor(Math.random() * 10000) + 1}`
            res.json({ data, status: 200, error: null });
        })
        .catch(err => {
            console.log("error:", err);
            res.contentType('application/json').status(500);
            res.json({ data: null, status: 500, error: err });
        });
}
const sendEmailCheckIn = async (req, res, next) => {

    try {
        const data = await manualService.sendEmail(req.body)
        //____________SUCCESS
        res.contentType('application/json').status(200);
        res.json({ data, status: 200, error: null });
    } catch (error) {
        console.log(error)
        res.json({ data: null, status: 500, error: 'sendEmailCheckIn Endpoint' });
    }
}
const getAmountData = async (req, res, next) => {

    try {
        const data = await manualService.getAmount(req.params.id)
        //____________SUCCESS
        req.data = data;
        webpayPlusController.create(req, res, next)

    } catch (error) {
        console.log(error)
        res.json({ data: null, status: 500, error: 'getAmountData Endpoint' });
    }
}
const getUsers = (req, res, next) => {
    res.contentType('application/json').status(200);
    manualService.getFromArrival(req.body)
        .then(resp => {
            console.log("response:", resp);
            res.json({ resp: resp });
        })
        .catch(err => {
            console.log("error:", err);
            res.contentType('application/json').status(500);
            res.json({ err: err });
        });
}
const sendEmail = (req, res, next) => {
    res.contentType('application/json').status(200);
    manualService.replaceExtras(req.body.replaceStr, req.body.text)
        .then(resp => {
            console.log("response:", resp);
            res.json({ resp: resp });
        })
        .catch(err => {
            console.log("error:", err);
            res.contentType('application/json').status(500);
            res.json({ err: err });
        });
}
const getPDF = async (req, res, next) => {
    try {

        var file = path.join(`${config.URL_FOLDER}/files/Pdf-${req.params.id}.pdf`, 'comprobante_pago.pdf');
        fs.readFile(file, function (err, data) {
            res.contentType("application/pdf");
            res.send(data)
        })

        // const stat = fs.statSync(`${config.URL_FOLDER}/files/Pdf-${req.params.id}.pdf`);
        // const file = fs.createReadStream(`${config.URL_FOLDER}/files/Pdf-${req.params.id}.pdf`);

        // file.on('error', (error) => {
        //     res.json({ data: null, status: 500, error: `getPDF: ${error.message.split(',')[0]}` });
        // });

        // res.setHeader('Content-Length', stat.size);
        // res.setHeader('Content-Type', 'application/pdf');
        // res.setHeader('Content-Disposition', 'attachment; filename=comprobante_pago.pdf');
        // file.pipe(res);

    } catch (error) {
        console.log(error)
        res.json({ data: null, status: 500, error: `getPDF: ${error.message.split(',')[0]}` });
    }
}
// routes
router.get('/get_pdf/:id', restricted, getPDF);
router.get('/get_amount/:id', restricted, getAmountData);
router.post('/send_email_checkIn', sendEmailCheckIn);
router.post('/send_email', sendEmail);
router.post('/get_users', getUsers);
router.post('/decrypt_first', decrypt_first);

module.exports = router;



