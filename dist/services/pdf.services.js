const pdf = require('phantom-html2pdf');
var nodemailer = require('nodemailer');
const pathLb = require('path');
const config = require('../config');
const handlebars = require('handlebars');
const fs = require('fs');

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

const manualService = require('../services/manual.service');

const readHTMLFile = (path, callback) => {
    fs.readFile(path, { encoding: 'utf-8' }, (err, html) => {
        if (err) {
            callback(err);
            throw err;
        }
        else {
            callback(null, html);
        }
    });
};

exports.constructPdf = async commitResponse => {

    return new Promise((resolve, reject) => {

        fs.readFile(`${config.URL_FOLDER}/assets/logos.png`, 'base64', async (err, dataimg) => {
            if (err) reject(err);

            let logo = "data:image/png;base64," + dataimg;

            readHTMLFile(`${config.URL_FOLDER}/assets/pdf.html`, async (err, html) => {
                const template = await handlebars.compile(html);
                let paymentType = commitResponse.payment_type_code === 'VN' ? 'VISA' : 'Mastercard';
                let resv_name_id = commitResponse.session_id.split('-')[1]
                let hotel = commitResponse.buy_order.split('-')[1]

                let guest = await manualService.getGuest({ resv_name_id, hotel })
                let guestName = `${guest[0].NOMBRETITULAR} ${guest[0].LASTNAMETITULAR}`
                //  let email = 'hernanhumglz@gmail.com'
                let email = guest[0].EMAIL;

                let newChechIn = new Date(guest[0].ARRIVAL);
                let newcheckOut = new Date(guest[0].DEPARTURE);
                let newTransactionDate = new Date(commitResponse.transaction_date)

                const replacements = {
                    amount: commitResponse.amount,
                    buyOrder: commitResponse.buy_order,
                    cardNumber: commitResponse.card_detail.card_number,
                    paymentType,
                    authorizationCode: commitResponse.authorization_code,
                    transactionDate: newTransactionDate.toISOString().slice(0, 10).replace(/-/g, "-"),
                    roomType: guest[0].ROOM_CATEGORY_LABEL,
                    checkIn: newChechIn.toISOString().slice(0, 10).replace(/-/g, "-"),
                    checkOut: newcheckOut.toISOString().slice(0, 10).replace(/-/g, "-"),
                    guestName: guestName,
                    conf: guest[0].CONF,
                    logo
                };

                const htmlToSend = template(replacements);

                const options = {
                    "html": htmlToSend,
                    "css": `${config.URL_FOLDER}/assets/pdf.css`,
                    'papersize': { format: 'Tabloid', orientation: 'portrait', border: '0cm', delay: 3000 }
                };

                pdf.convert(options, (err, result) => {
                    if (err) reject('pdf.convert error: ', err)

                    result.toFile(`${config.URL_FOLDER}/files/Pdf-${resv_name_id}.pdf`, () => {
                        console.log("toFile:", 'success')

                        module.exports.sendEmailFinal('Pdf-' + resv_name_id + '.pdf', hotel, email, guestName)
                            .then(response => {
                                resolve({ email: response.status, pdf: resv_name_id })
                            })
                            .catch((err) => reject('sendEmailFinal error: ', err));

                    });
                });

                if (err) return err
                return 'success'
            });
        })
    })


}
exports.sendEmailFinal = async (pdfName, resort, email, name) => {
    return new Promise(function (resolve, reject) {

        if (resort == "HTSCR") {
            hotel = "HOTEL SANTA CRUZ";
        }
        var pathPdf = `${config.URL_FOLDER}/files/${pdfName}`;
        var messageHtml = "<!doctype html><html lang=\"es\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width, initial-scale=1, shrink-to-fit=no\"><title></title></head><body><table style=\"width: 750px; font-family: 'HelveticaNeue-Light', 'Helvetica Neue Light', 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif; font-size: 20px;border-spacing: inherit;\"><tbody><tr><td style=\"height: 160px; background-color: #231c1d;text-align: center\"> <img src=\"https://checkin.hscp.cl/api/logosanta.png\" class=\"mx-auto d-block\"></td></tr><tr style=\"color:#fff;text-align:center;width: 100%;height: 500px; background-image: url('https://checkin.hscp.cl/api/hotel_fondo_final.jpg');padding-left: 20px; padding-right: 20px;background-size: contain;\"><td style=\"background-color: rgba(0,0,0,0.5);\"><h2>Estimado " + name + "</h2><p>Gracias por su preferencia adjunto encontrará su comprobante de pago.</p> <img src=\"https://checkin.hscp.cl/api/line_santa.png\"></td></tr><tr><td style=\"background-color: #fff;height: 400px\"><table style=\"width:100%\" ><tbody><tr><td style=\"text-align: center; width: 50%\"> <img src=\"https://checkin.hscp.cl/api/grupoimagensanta.png\"></td><td style=\"text-align: left; width: 50%\"> <img src=\"https://checkin.hscp.cl/api/line_santa.png\"><h2>HOTEL<br>SANTA CRUZ</h2><p>Contacto: <span style=\"color:#cf7c23\">+56 72 220 9600</span><br>Ubicaci\u00F3n: <span style=\"color:#cf7c23\">Plaza de Armas 286, Santa Cruz. Chile.</span><br>Correo: <span style=\"color:#cf7c23\">reservas@hscp.cl</span></p><p>\u2192 VISITA NUESTRO <span style=\"color:#cf7c23\"><a href=\"https://www.hotelsantacruzplaza.cl\">SITIO WEB</a></span></p></td></tr></tbody></table></td></tr><tr><td style=\"font-size:12px;background-color: #000000;color:#fff;height: 250px;text-align: center;\"> <img src=\"https://checkin.hscp.cl/api/fb.png\" style=\"width: 45px;\"><img src=\"https://checkin.hscp.cl/api/in.png\" style=\"width: 45px;\"><img src=\"https://checkin.hscp.cl/api/hoo.png\" style=\"width: 45px;\"><img src=\"https://checkin.hscp.cl/api/pin.png\" style=\"width: 45px;\"><p>2020 \u00A9 Hotel Santa Cruz, Hotel y Centro de Convenciones.</p></td></tr></tbody></table></body></html> ";
        var mailOptions = {
            from: 'checkin@hscp.cl',
            to: email,
            subject: "Comprobante de Pago",
            bcc: 'reservas@hscp.cl',
            html: messageHtml,
            attachments: [{
                filename: 'resumen.pdf',
                path: pathLb.join(pathPdf),
                contentType: 'application/pdf'
            }],
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                console.log('mailOptions' + mailOptions);
                reject({ status: error, mailOptions: mailOptions });
            }
            else {
                resolve({ status: info.response });
            }
        });
    });
}
