"use strict";
var oracleCn = require("../connection");
var nodemailer = require('nodemailer');
var handlebars = require('handlebars');
var fs = require('fs');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'check-in@hscp.cl',
        pass: 'hscp286!.,'
    },
    tls: {
        rejectUnauthorized: false
    },
    logger: false,
    debug: false // include SMTP traffic in the logs
});
var Cryptr = require('cryptr');
var cryptr = new Cryptr('Qn8zjsPJfrenon');

const config = require('../config');


const updateDate = (date) => {
    let splited = date.split('-')

    switch (splited[1]) {
        case '01':
            splited[1] = 'jan'
            break;
        case '02':
            splited[1] = 'feb'
            break;
        case '03':
            splited[1] = 'mar'
            break;
        case '04':
            splited[1] = 'apr'
            break;
        case '05':
            splited[1] = 'may'
            break;
        case '06':
            splited[1] = 'jun'
            break;
        case '07':
            splited[1] = 'jul'
            break;
        case '08':
            splited[1] = 'ago'
            break;
        case '09':
            splited[1] = 'sep'
            break;
        case '10':
            splited[1] = 'oct'
            break;
        case '11':
            splited[1] = 'nov'
            break;
        case '12':
            splited[1] = 'dec'
            break;

        default:
            break;
    }

    return `${splited[0]}-${splited[1]}-${splited[2]}`
}

module.exports = {
    getFromArrival: async (data) => {
        var from_date = await updateDate(data.dateCheck)

        var sqlA = `SELECT resort, resv_status, RESV_NAME_ID resv_name_id , CONFIRMATION_NO confirmation_no,
                    ROOM_CATEGORY_LABEL, ARRIVAL, DEPARTURE, NIGHTS, INSERT_DATE, GUEST_FIRST_NAME nombreTitular,
                    GUEST_NAME lastNameTitular, GUEST_COUNTRY, EMAIL email, RATE_CODE, TRAVEL_AGENT_ID, COMPANY_ID,
                    CURRENCY_CODE, block_code from name_reservation where insert_date  >= :from_date                                
                    and RESORT = 'HTSCR' AND RESV_STATUS = 'RESERVED' and EMAIL IS NOT NULL and block_code IS NULL
                    AND TRAVEL_AGENT_ID IN ('11048', '11725', '12510', '11222', '14227')
                    AND RATE_CODE IN ('IHOLS', 'IHOEB1', 'IHOEB', 'IHOLS', 'LSTAYUSD','CANRFUSD', 'CANRFUSD1',
                    'IHOSINDE','IHOBAR', 'IHOSINDE', 'DIRECTO USD', 'DIRECTOSDUSD', 'DIRECTO CLP',
                    'DIRECTOSDCLP', 'WALKIN USD', 'WALKINSDUSD', 'WALKINSDCLP', 'WALKIN CLP',
                    'SINDESUSD', 'BARUSD', 'DAY USE', 'COLABORADOR', 'COLABORADOR2')`;

        let sqlB = `SELECT resort, resv_status, RESV_NAME_ID resv_name_id , CONFIRMATION_NO confirmation_no,
                    ROOM_CATEGORY_LABEL, ARRIVAL, DEPARTURE, NIGHTS, INSERT_DATE, GUEST_FIRST_NAME nombreTitular,
                    GUEST_NAME lastNameTitular, GUEST_COUNTRY, EMAIL email, RATE_CODE, TRAVEL_AGENT_ID, COMPANY_ID, 
                    CURRENCY_CODE, block_code from name_reservation where insert_date  >= :from_date and RESORT = 'HTSCR'
                    AND RESV_STATUS = 'RESERVED' and EMAIL IS NOT NULL and block_code IS NULL AND COMPANY_ID IN ('12524',
                            '12532',
                            '12876',
                            '24715',
                            '19501',
                            '21983',
                            '51567',
                            '18483',
                            '29402',
                            '19462',
                            '18270',
                            '56017',
                            '27025',
                            '36753',
                            '11463',
                            '26593')
        AND RATE_CODE IN ('IHOLS',
                          'IHOEB1',
                          'IHOEB',
                          'IHOLS',
                          'LSTAYUSD',
                          'CANRFUSD',
                          'CANRFUSD1',
                          'IHOSINDE',
                          'IHOBAR',
                          'IHOSINDE',
                          'DIRECTO USD',
                          'DIRECTOSDUSD',
                          'DIRECTO CLP',
                          'DIRECTOSDCLP',
                          'WALKIN USD',
                          'WALKINSDUSD',
                          'WALKINSDCLP',
                          'WALKIN CLP',
                          'SINDESUSD',
                          'BARUSD',
                          'DAY USE',
                          'COLABORADOR',
                          'COLABORADOR2')`

        try {
            const a = await oracleCn.open(sqlA, [from_date], false)
            const b = await oracleCn.open(sqlB, [from_date], false)

            const joined = await a.concat(b);

            console.log(`Cantidad Total de guest ${joined.length} con fecha ${from_date}`)


            if (joined.length !== 0) {
                return joined
            } else {
                return 'No guests in the list'
            }

        } catch (error) {
            console.log(error)
        }
    },
    getGuest: async data => {
        var resv_name_id = data.resv_name_id;
        var pin_resort = data.hotel;
        var sqlA = `SELECT
        RESORT,
        RESV_STATUS,
        RESV_NAME_ID,
        CONFIRMATION_NO CONF,
        ROOM_CATEGORY_LABEL,
        ARRIVAL,
        DEPARTURE,
        nights,
        insert_date,
        GUEST_FIRST_NAME nombreTitular,
        GUEST_NAME lastNameTitular,
        GUEST_COUNTRY Country,
        EMAIL,
        RATE_CODE,
        TRAVEL_AGENT_ID,
        company_ID,
        CURRENCY_CODE
        FROM NAME_RESERVATION
        WHERE RESORT = :PIN_RESORT
        AND RESV_NAME_ID = :PIN_RESV_NAME_ID
        AND RESV_STATUS = 'RESERVED'
        AND EMAIL IS NOT NULL
        and block_code IS NULL
        AND COMPANY_ID IN ('12524',
                            '12532',
                            '12876',
                            '24715',
                            '19501',
                            '21983',
                            '51567',
                            '18483',
                            '29402',
                            '19462',
                            '18270',
                            '56017',
                            '27025',
                            '36753',
                            '11463',
                            '26593')
        AND RATE_CODE IN ('IHOLS', 'IHOEB1', 'IHOEB', 'IHOLS', 'LSTAYUSD',
                                  'CANRFUSD', 'CANRFUSD1', 'IHOSINDE',
                                  'IHOBAR', 'IHOSINDE', 'DIRECTO USD', 'DIRECTOSDUSD',
                                  'DIRECTO CLP', 'DIRECTOSDCLP', 'WALKIN USD',
                                  'WALKINSDUSD', 'WALKINSDCLP', 'WALKIN CLP',
                                  'SINDESUSD', 'BARUSD', 'DAY USE', 'COLABORADOR', 'COLABORADOR2')`
        var sqlB = `SELECT
        RESORT,
        RESV_STATUS,
        RESV_NAME_ID,
        CONFIRMATION_NO CONF,
        ROOM_CATEGORY_LABEL,
        ARRIVAL,
        DEPARTURE,
        nights,
        insert_date,
        GUEST_FIRST_NAME nombreTitular,
        GUEST_NAME lastNameTitular,
        GUEST_COUNTRY Country,
        EMAIL,
        RATE_CODE,
        TRAVEL_AGENT_ID,
        company_ID,
        CURRENCY_CODE
        FROM NAME_RESERVATION
        WHERE RESORT = :PIN_RESORT
        AND RESV_NAME_ID = :PIN_RESV_NAME_ID
        AND RESV_STATUS = 'RESERVED'
        AND EMAIL IS NOT NULL
        and block_code IS NULL
        AND TRAVEL_AGENT_ID IN ('11048', '11725', '12510', '11222', '14227')
        AND RATE_CODE IN ('IHOLS', 'IHOEB1', 'IHOEB', 'IHOLS', 'LSTAYUSD',
                                  'CANRFUSD', 'CANRFUSD1', 'IHOSINDE',
                                  'IHOBAR', 'IHOSINDE', 'DIRECTO USD', 'DIRECTOSDUSD',
                                  'DIRECTO CLP', 'DIRECTOSDCLP', 'WALKIN USD',
                                  'WALKINSDUSD', 'WALKINSDCLP', 'WALKIN CLP',
                                  'SINDESUSD', 'BARUSD', 'DAY USE', 'COLABORADOR', 'COLABORADOR2')`
        try {

            const a = await oracleCn.open(sqlA, [pin_resort, resv_name_id], false)
            const b = await oracleCn.open(sqlB, [pin_resort, resv_name_id], false)

            const joined = await a.concat(b);
            console.log('total guest: ', joined.length)

            // NO REMBOLSABLES:
            joined.forEach(element => {
                if (element.RATE_CODE === 'IHOLS' || 'IHOEB1' || 'IHOEB' || 'IHOLS' || 'LSTAYUSD' || 'CANRFUSD' || 'CANRFUSD1') {
                    element.REFUNDABLE = false
                } else {
                    element.REFUNDABLE = true
                }
            });

            if (joined.length !== 0) {
                return joined
            } else {
                return 'No guests in the list'
            }

        } catch (error) {
            console.log(error)
            throw new Error('Error 505 api : getGuest => ', JSON.stringify(error));
        }
    },
    sendEmail: async (data) => {
        var resv_name_id = data.resv_name_id;
        var pin_resort = data.hotel;
        var sqlA = `SELECT
        RESORT,
        RESV_STATUS,
        RESV_NAME_ID,
        CONFIRMATION_NO CONF,
        ROOM_CATEGORY_LABEL,
        ARRIVAL,
        DEPARTURE,
        nights,
        insert_date,
        GUEST_FIRST_NAME nombreTitular,
        GUEST_NAME lastNameTitular,
        GUEST_COUNTRY Country,
        EMAIL,
        RATE_CODE,
        TRAVEL_AGENT_ID,
        company_ID,
        CURRENCY_CODE
        FROM NAME_RESERVATION
        WHERE RESORT = :PIN_RESORT
        AND RESV_NAME_ID = :PIN_RESV_NAME_ID
        AND RESV_STATUS = 'RESERVED'
        AND EMAIL IS NOT NULL
        and block_code IS NULL
        AND COMPANY_ID IN ('12524',
                            '12532',
                            '12876',
                            '24715',
                            '19501',
                            '21983',
                            '51567',
                            '18483',
                            '29402',
                            '19462',
                            '18270',
                            '56017',
                            '27025',
                            '36753',
                            '11463',
                            '26593')
        AND RATE_CODE IN ('IHOLS', 'IHOEB1', 'IHOEB', 'IHOLS', 'LSTAYUSD',
                                  'CANRFUSD', 'CANRFUSD1', 'IHOSINDE',
                                  'IHOBAR', 'IHOSINDE', 'DIRECTO USD', 'DIRECTOSDUSD',
                                  'DIRECTO CLP', 'DIRECTOSDCLP', 'WALKIN USD',
                                  'WALKINSDUSD', 'WALKINSDCLP', 'WALKIN CLP',
                                  'SINDESUSD', 'BARUSD', 'DAY USE', 'COLABORADOR', 'COLABORADOR2')`
        var sqlB = `SELECT
        RESORT,
        RESV_STATUS,
        RESV_NAME_ID,
        CONFIRMATION_NO CONF,
        ROOM_CATEGORY_LABEL,
        ARRIVAL,
        DEPARTURE,
        nights,
        insert_date,
        GUEST_FIRST_NAME nombreTitular,
        GUEST_NAME lastNameTitular,
        GUEST_COUNTRY Country,
        EMAIL,
        RATE_CODE,
        TRAVEL_AGENT_ID,
        company_ID,
        CURRENCY_CODE
        FROM NAME_RESERVATION
        WHERE RESORT = :PIN_RESORT
        AND RESV_NAME_ID = :PIN_RESV_NAME_ID
        AND RESV_STATUS = 'RESERVED'
        AND EMAIL IS NOT NULL
        and block_code IS NULL
        AND TRAVEL_AGENT_ID IN ('11048', '11725', '12510', '11222', '14227')
        AND RATE_CODE IN ('IHOLS', 'IHOEB1', 'IHOEB', 'IHOLS', 'LSTAYUSD',
                                  'CANRFUSD', 'CANRFUSD1', 'IHOSINDE',
                                  'IHOBAR', 'IHOSINDE', 'DIRECTO USD', 'DIRECTOSDUSD',
                                  'DIRECTO CLP', 'DIRECTOSDCLP', 'WALKIN USD',
                                  'WALKINSDUSD', 'WALKINSDCLP', 'WALKIN CLP',
                                  'SINDESUSD', 'BARUSD', 'DAY USE', 'COLABORADOR', 'COLABORADOR2')`
        try {

            const a = await oracleCn.open(sqlA, [pin_resort, resv_name_id], false)
            const b = await oracleCn.open(sqlB, [pin_resort, resv_name_id], false)

            const joined = await a.concat(b);
            console.log('joined total: ', joined.length)

            // NO REMBOLSABLES:
            joined.forEach(element => {
             //   element.EMAIL = 'hernanhumglz@gmail.com'
                if (element.RATE_CODE === 'IHOLS' || 'IHOEB1' || 'IHOEB' || 'IHOLS' || 'LSTAYUSD' || 'CANRFUSD' || 'CANRFUSD1') {
                    element.REFUNDABLE = false
                } else {
                    element.REFUNDABLE = true
                }
            });

            console.log(`EMAIL TO: ${JSON.stringify(joined)}`)

            if (joined.length !== 0) {

                const handle = module.exports.sendCheckIn({ data: joined, hotel: data.hotel })
                    .then(data => ([data, null]))
                    .catch(error => Promise.resolve([null, error]));

                const [response, responseErr] = await handle;
                if (responseErr) throw new Error('Error 505 api : sendEmail => ', JSON.stringify(responseErr));

                return response
            } else {
                return 'No guests in the list'
            }


        } catch (error) {
            console.log(error)
            throw new Error('Error 505 api : sendEmail => ', JSON.stringify(error));
        }

    },
    sendCheckIn: function (data) {

        return new Promise(function (resolve, reject) {
            var dateNow = data.data;
            var hotel = data.hotel;
            var email = data.email;
            var resv_name_id = data.resv_name_id;
            var arrayConstruct = [];
            var array = [];
            for (var i = 0; i < dateNow.length; ++i) {
                var personalData = {
                    NAMETITULAR: dateNow[i].NOMBRETITULAR,
                    LASTNAMETITULAR: dateNow[i].LASTNAMETITULAR,
                    EMAIL: dateNow[i].EMAIL,
                    RESV_NAME_ID: dateNow[i].RESV_NAME_ID,
                    hotel: hotel
                };
                module.exports.sendEmailSending(dateNow[i].NOMBRETITULAR, dateNow[i].LASTNAMETITULAR, dateNow[i].EMAIL, dateNow[i].RESV_NAME_ID, hotel)
                    .then(function (resp) {
                        console.log("response sendEmailSending:", i, (dateNow.length - 1));
                        array = {
                            "resultEmail": resp,
                            personalData: personalData
                        };
                        arrayConstruct.push(array);
                        if (i >= (dateNow.length - 1)) {
                            resolve(arrayConstruct);
                        }
                    })
                    .catch(function (error) {
                        array = {
                            "resultEmail": error,
                            personalData: personalData
                        };
                        arrayConstruct.push(array);
                        console.log("catch:", i, (dateNow.length - 1));
                        if (i >= (dateNow.length - 1)) {
                            reject(arrayConstruct);
                        }
                    });
            }
        });
    },
    sendEmailSending: function (name, lastname, email, resv_name_id, hotel) {

        if (name === void 0) {
            name = '';
        }
        if (lastname === void 0) {
            lastname = '';
        }
        if (email === void 0) {
            email = '';
        }
        if (resv_name_id === void 0) {
            resv_name_id = '';
        }
        if (hotel === void 0) {
            hotel = "";
        }
        return new Promise(function (resolve, reject) {
            var encryptedData = "";
            module.exports.encrypt({ encryptData: resv_name_id + "/" + hotel })
                .then(function (respEncryt) {
                    encryptedData = respEncryt.data;
                    var urlBtn = "https://pagos.hscp.cl/order/" + encryptedData;

                    const readHTMLFile = (path, callback) => {
                        fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
                            if (err) {
                                callback(err);
                                throw err;
                            }
                            else {
                                callback(null, html);
                            }
                        });
                    };

                    readHTMLFile(`${config.URL_FOLDER}/assets/santacruz.html`, (err, html) => {
                        var template = handlebars.compile(html);
                        var replacements = {
                            name,
                            lastname,
                            urlBtn
                        };

                        console.log('The type of the file is: ', typeof html)

                        var htmlToSend = template(replacements);

                        var mailOptions = {
                            from: 'checkin@hscp.cl',
                            to: email,
                            subject: "Pago en Linea - Confirma tu reserva en Hotel Santa Cruz Plaza",
                            html: htmlToSend
                        };

                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.log(error);
                                console.log('mailOptions' + mailOptions);
                                reject({ status: error, mailOptions: mailOptions });
                            }
                            else {
                                console.log('Email sent: ' + info.response);
                                resolve({ status: info.response });
                            }
                        });
                    });

                })
                .catch(function (error) {
                    reject(error);
                });
        });
    },
    encrypt: (data) => {
        return new Promise(function (resolve, reject) {
            var dataToEncryp = data.encryptData;
            var encryptedString = cryptr.encrypt(dataToEncryp);
            resolve({
                // iv: iv.toString('hex'),
                data: encryptedString
            });
        });
    },
    decrypt: (data) => {
        return new Promise(function (resolve, reject) {
            console.log("decrypt:", data);
            var dataEncrypted = data;
            var decryptedString = cryptr.decrypt(dataEncrypted);
            resolve({ data: decryptedString });
        });
    },
    getAmount: async (RESV_NAME_ID) => {
        var sqlA = `SELECT t.RESV_NAME_ID, t.DEPOSIT_AMOUNT, t.RULE_CODE,
            n.Quantity, n.product, n.price FROM RESERVATION_DEPOSIT_SCHEDULE t , RESERVATION_PRODUCT_PRICES n
            WHERE t.RESV_NAME_ID = :RESV_NAME_ID and t.resv_name_id = n.resv_name_id
            AND t.RULE_CODE IN ('FLEX','NONREF')`;

        let sqlB = `SELECT resv_name_id, deposit_amount, RULE_CODE FROM reservation_deposit_schedule WHERE resv_name_id = :resv_name_id`

        try {
            const a = await oracleCn.open(sqlA, [RESV_NAME_ID], false)
            const b = await oracleCn.open(sqlB, [RESV_NAME_ID], false)

            const dataJoined = await a.concat(b);

            if (dataJoined.length !== 0) {
                return dataJoined
            } else {
                return 'No data in the list'
            }
        } catch (error) {
            console.log(error)
            throw new Error('Error 505 api : getAmount => ', JSON.stringify(error));
        }
    },
    decryptFirst: async (data) => {

        var dataEncrypted = data;
        var decryptedString = cryptr.decrypt(dataEncrypted);
        console.log("decryptedString:", decryptedString);
        var res = decryptedString.split("/");
        var resv_name_id = res[0]
        var pin_resort = res[1]

        var sqlA = `SELECT
        RESORT,
        RESV_STATUS,
        RESV_NAME_ID,
        CONFIRMATION_NO CONF,
        ROOM_CATEGORY_LABEL,
        ARRIVAL,
        DEPARTURE,
        nights,
        insert_date,
        GUEST_FIRST_NAME nombreTitular,
        GUEST_NAME lastNameTitular,
        GUEST_COUNTRY Country,
        EMAIL,
        RATE_CODE,
        TRAVEL_AGENT_ID,
        company_ID,
        CURRENCY_CODE
        FROM NAME_RESERVATION
        WHERE RESORT = :PIN_RESORT
        AND RESV_NAME_ID = :PIN_RESV_NAME_ID
        AND RESV_STATUS = 'RESERVED'
        AND EMAIL IS NOT NULL
        and block_code IS NULL
        AND COMPANY_ID IN ('12524',
                            '12532',
                            '12876',
                            '24715',
                            '19501',
                            '21983',
                            '51567',
                            '18483',
                            '29402',
                            '19462',
                            '18270',
                            '56017',
                            '27025',
                            '36753',
                            '11463',
                            '26593')
        AND RATE_CODE IN ('IHOLS', 'IHOEB1', 'IHOEB', 'IHOLS', 'LSTAYUSD',
                                  'CANRFUSD', 'CANRFUSD1', 'IHOSINDE',
                                  'IHOBAR', 'IHOSINDE', 'DIRECTO USD', 'DIRECTOSDUSD',
                                  'DIRECTO CLP', 'DIRECTOSDCLP', 'WALKIN USD',
                                  'WALKINSDUSD', 'WALKINSDCLP', 'WALKIN CLP',
                                  'SINDESUSD', 'BARUSD', 'DAY USE', 'COLABORADOR', 'COLABORADOR2')`

        var sqlB = `SELECT
        RESORT,
        RESV_STATUS,
        RESV_NAME_ID,
        CONFIRMATION_NO CONF,
        ROOM_CATEGORY_LABEL,
        ARRIVAL,
        DEPARTURE,
        nights,
        insert_date,
        GUEST_FIRST_NAME nombreTitular,
        GUEST_NAME lastNameTitular,
        GUEST_COUNTRY Country,
        EMAIL,
        RATE_CODE,
        TRAVEL_AGENT_ID,
        company_ID,
        CURRENCY_CODE
        FROM NAME_RESERVATION
        WHERE RESORT = :PIN_RESORT
        AND RESV_NAME_ID = :PIN_RESV_NAME_ID
        AND RESV_STATUS = 'RESERVED'
        AND EMAIL IS NOT NULL
        and block_code IS NULL
        AND TRAVEL_AGENT_ID IN ('11048', '11725', '12510', '11222', '14227')
        AND RATE_CODE IN ('IHOLS', 'IHOEB1', 'IHOEB', 'IHOLS', 'LSTAYUSD',
                                  'CANRFUSD', 'CANRFUSD1', 'IHOSINDE',
                                  'IHOBAR', 'IHOSINDE', 'DIRECTO USD', 'DIRECTOSDUSD',
                                  'DIRECTO CLP', 'DIRECTOSDCLP', 'WALKIN USD',
                                  'WALKINSDUSD', 'WALKINSDCLP', 'WALKIN CLP',
                                  'SINDESUSD', 'BARUSD', 'DAY USE', 'COLABORADOR', 'COLABORADOR2')`

        try {

            const a = await oracleCn.open(sqlA, [pin_resort, resv_name_id], false)
            const b = await oracleCn.open(sqlB, [pin_resort, resv_name_id], false)

            const joined = await a.concat(b);
            console.log('joined total: ', joined.length)

            // NO REMBOLSABLES:
            joined.forEach(element => {
                if (element.RATE_CODE === 'IHOLS' || 'IHOEB1' || 'IHOEB' || 'IHOLS' || 'LSTAYUSD' || 'CANRFUSD' || 'CANRFUSD1') {
                    element.REFUNDABLE = false
                } else {
                    element.REFUNDABLE = true
                }
            });

            console.log(`JOINED DATA: ${JSON.stringify(joined)}`)

            if (joined.length !== 0) {
                return joined
            } else {
                return 'No guests in the list'
            }


        } catch (error) {
            console.log(error)
            throw new Error('Error 505 api : sendEmail => ', JSON.stringify(error));
        }
    }
};
