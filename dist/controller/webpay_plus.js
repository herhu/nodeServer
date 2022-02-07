const WebpayPlus = require("transbank-sdk").WebpayPlus;
const asyncHandler = require("../utils/async_handler");
const soapService = require("../services/soap.service")
const pdfService = require("../services/pdf.services")
const config = require('../config');

const calculateTotal = async data => {

  let sum = []
  let products = []
  let dataPayment = []

  data.forEach(element => {
    if (element.PRODUCT) {
      sum.push(element.PRICE * element.QUANTITY)
      products.push(element)
    }
  });

  let totalProduct = sum.reduce((a, b) => a + b, 0);
  let min = totalProduct === 0 || sum.length <= 1 ? 0 : Math.min(...sum)

  data.forEach(element => {
    if (!element.PRODUCT) {
      element.TOTAL_AMOUNT = element.DEPOSIT_AMOUNT + totalProduct - min
      element.PRODUCTS = products
      dataPayment.push(element)
    }
  });

  return dataPayment[0]
}

exports.create = asyncHandler(async (request, response, next) => {

  let guestData = await calculateTotal(request.data)
  console.log('FINAL PAYMENT: ', guestData)

  let sessionId = `S-${guestData.RESV_NAME_ID}-${Math.floor(Math.random() * 10000) + 1}`
  let buyOrder = request.session.bred
  let amount = guestData.TOTAL_AMOUNT
  let returnUrl = ''

  if (config.NODE_ENV === 'production') {
    returnUrl = `https://${config.HOST}/webpay_plus/commit`
  } else {
    returnUrl = `http://${config.HOST}:${config.PORT}/webpay_plus/commit`
  }

  const createResponse = await WebpayPlus.Transaction.create(
    buyOrder,
    sessionId,
    amount,
    returnUrl
  );

  let token = createResponse.token;
  let url = createResponse.url;

  let commerceData = {
    buyOrder,
    sessionId,
    amount,
    returnUrl,
    token,
    url,
  };


  response.contentType('application/json').status(200);
  response.json({ data: { guestData, commerceData }, status: 200, error: null });

});

exports.commit = asyncHandler(async (request, response, next) => {

  //Flujos:
  //1. Flujo normal (OK): solo llega token_ws
  //2. Timeout (más de 10 minutos en el formulario de Transbank): llegan TBK_ID_SESION y TBK_ORDEN_COMPRA
  //3. Pago abortado (con botón anular compra en el formulario de Webpay): llegan TBK_TOKEN, TBK_ID_SESION, TBK_ORDEN_COMPRA
  //4. Caso atipico: llega todos token_ws, TBK_TOKEN, TBK_ID_SESION, TBK_ORDEN_COMPRA

  let token = request.body.token_ws;
  let tbkToken = request.body.TBK_TOKEN;
  let tbkOrdenCompra = request.body.TBK_ORDEN_COMPRA;
  let tbkIdSesion = request.body.TBK_ID_SESION;

  let viewData = {
    token,
    tbkToken,
    tbkOrdenCompra,
    tbkIdSesion
  };

  if (token && !tbkToken) {//Flujo 1

    const commitResponse = await WebpayPlus.Transaction.commit(token);

    viewData = {
      token,
      commitResponse,
    };

    if (commitResponse.status === 'AUTHORIZED' && commitResponse.response_code === 0) {

      //CONNECTING WITH OWS
      const handle = soapService.soap(commitResponse)
        .then(data => ([data, null]))
        .catch(error => Promise.resolve([null, error]));

      const [soapResponse, soapErr] = await handle
      if (soapErr) console.log('Error 505 SOAP SERVICES => ', soapErr);
      console.log('soapResponse', soapResponse)

      //BUILDING PDF

      const handle2 = pdfService.constructPdf(commitResponse)
        .then(data => ([data, null]))
        .catch(error => Promise.resolve([null, error]));

      const [pdfResponse, pdfErr] = await handle2
      if (pdfErr) console.log('Error 505 PDF SERVICES => ', pdfErr);
      console.log('pdfResponse', pdfResponse)

      //REDIRECTING TO FRONT

      response.redirect(`${config.FRONT_URL}/order/check?id=${pdfResponse.pdf}`);

    } else {
      response.redirect(`${config.FRONT_URL}/order/reject`);
    }

  }
  else if (!token && !tbkToken) {//Flujo 2
    step = "Timeout => El pago fue anulado por tiempo de espera.";
    stepDescription = "En este paso luego de anulación por tiempo de espera (+10 minutos) no es necesario realizar la confirmación ";
    response.redirect(`${config.FRONT_URL}/order/reject`);
  }
  else if (!token && tbkToken) {//Flujo 3
    step = "Abortar pago => El pago fue anulado por el usuario.";
    stepDescription = "En este paso luego de abandonar el formulario no es necesario realizar la confirmación ";
    response.redirect(`${config.FRONT_URL}/order/reject`);
  }
  else if (token && tbkToken) {//Flujo 4
    step = "Pago inválido => El pago es inválido.";
    stepDescription = "En este paso luego de abandonar el formulario no es necesario realizar la confirmación ";
    response.redirect(`${config.FRONT_URL}/order/reject`);
  }
});

exports.status = asyncHandler(async (request, response, next) => {
  let token = request.body.token;

  const statusResponse = await WebpayPlus.Transaction.status(token);

  let viewData = {
    token,
    statusResponse,
  };

  response.render("webpay_plus/status", {
    step: "Estado de Transacción",
    stepDescription:
      "Puedes solicitar el estado de una transacción hasta 7 días despues de que haya sido" +
      " realizada. No hay limite de solicitudes de este tipo, sin embargo, una vez pasados los " +
      "7 días ya no podrás revisar su estado.",
    viewData,
  });
});

exports.refund = asyncHandler(async (request, response, next) => {
  let { token, amount } = request.body;

  const refundResponse = await WebpayPlus.Transaction.refund(token, amount);

  let viewData = {
    token,
    amount,
    refundResponse,
  };

  response.render("webpay_plus/refund", {
    step: "Reembolso de Transacción",
    stepDescription:
      "Podrás pedir el reembolso del dinero al tarjeta habiente, dependiendo del monto " +
      "y el tiempo transacurrido será una Reversa, Anulación o Anulación parcial.",
    viewData,
  });
});
