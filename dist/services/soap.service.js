const soapRequest = require('easy-soap-request');
const fs = require('fs');
const config = require('../config');
const axiosCall = require('axios')
const xml2js = require('xml2js')

exports.soap = async data => {

    return new Promise((resolve, reject) => {
        let session_id = data.session_id.split('-');
        let RESV_NAME_ID = parseInt(session_id[1])
        const url = 'http://181.212.30.94/ows_ws_51/ResvAdvanced.asmx';

        const xml = `<?xml version="1.0" encoding="utf-8"?>
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:c="http://webservices.micros.com/og/4.3/Common/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:r="http://webservices.micros.com/og/4.3/Reservation/" xmlns:hc="http://webservices.micros.com/og/4.3/HotelCommon/" xmlns:n="http://webservices.micros.com/og/4.3/Name/">
            <soap:Header>
                <OGHeader transactionID="" primaryLangID="" timeStamp="2021-11-18-01:30" channelValidation="false" terminalID="OWSSERVER1" xmlns="http://webservices.micros.com/og/4.3/Core/">
                    <Origin entityID="OWS" systemType="WEB"/>
                    <Destination entityID="CHA" systemType="PMS"/>
                    <Authentication>
                        <UserCredentials>
                            <UserName>IFC</UserName>
                            <UserPassword>HOTEL1234</UserPassword>
                            <Domain>HTSCR</Domain>
                        </UserCredentials>
                    </Authentication>
                </OGHeader>
            </soap:Header>
            <soap:Body>
                <MakePaymentRequest xmlns="http://webservices.micros.com/og/4.3/ResvAdvanced/" xmlns:com="http://webservices.micros.com/og/4.3/Common/">
                    <Posting PostDate="2021-11-18-01:30" ShortInfo="${data.buy_order}" LongInfo="${data.authorization_code}" Charge="${data.amount}" StationID="USERW764Dxyz.FT.MICROS.COM.37" UserID="IFCHSCR" FolioViewNo="2">
                        <ReservationRequestBase>
                            <HotelReference chainCode="CHA" hotelCode="HTSCR"/>
                            <ReservationID>
                                <com:UniqueID type="INTERNAL" source="RESV_NAME_ID">${RESV_NAME_ID}</com:UniqueID>
                            </ReservationID>
                        </ReservationRequestBase>
                    </Posting>
                    <CreditCardInfo>
                        <CreditCard cardType="VI">
                            <com:cardHolderName>Jane Smith OWS</com:cardHolderName>
                            <com:cardNumber>4147202301961890</com:cardNumber>
                            <com:expirationDate>2024-06-30</com:expirationDate>
                        </CreditCard>
                    </CreditCardInfo>
                </MakePaymentRequest>
            </soap:Body>
        </soap:Envelope>`

        axiosCall.post(url,
            xml,
            {
                headers: {
                    'Content-Type': 'text/xml',
                    SOAPAction: 'http://webservices.micros.com/ows/5.1/ResvAdvanced.wsdl#MakePayment'
                }
            })
            .then((response) => {
                // xml2js to parse the xml response from the server 
                // to a json object and then be able to iterate over it.
                xml2js.parseString(response.data, (err, result) => {
                    if (err) {
                        reject(err)
                    }
                    resolve(result)
                })

            }).catch((error) => reject(error))
    })


}