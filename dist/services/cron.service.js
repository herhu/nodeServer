"use strict";
var oracleCn = require("../connection");
module.exports = {
    getUserReminder: function () {
        return new Promise(function (resolve, reject) {
            var toDay = new Date();
            var pin_resort = "HTSCR";
            console.log("toDay CheckInAM:", toDay.toString());
            var hotel = "";
            var sql = "SELECT\n\t\t\tinsert_date,\n\t\t\tresv_status,\n\t\t\tarrival,\n\t\t\tCONFIRMATION_NO confirmation_no,\n\t\t\tRESV_NAME_ID resv_name_id ,\n\t\t\tNAME_ID name_id,\n\t\t\tEMAIL email ,\n\t\t\tGUEST_FIRST_NAME nameTitular ,\n\t\t\tGUEST_NAME lastNameTitular\n\t\t\tFROM name_reservation\n\t\t\tWHERE arrival IN TRUNC(SYSDATE + 2)\n\t\t\tAND email IS NOT NULL\n\t\t\tAND resort = :pin_resort\n\t\t\tAND resv_status NOT IN ('CANCELLED')\n\t\t\tAND resv_status IN ('RESERVED')";
            oracleCn.open(sql, [pin_resort], false)
                .then(function (data) {
                console.log("getUserReminder:", data);
                var arrayConstruct = [];
                var array = [];
                for (var i = 0; i < data.length; ++i) {
                    var personalData = { "NAME_ID": data[i].NAME_ID,
                        "NAMETITULAR": data[i].NAMETITULAR,
                        LASTNAMETITULAR: data[i].LASTNAMETITULAR,
                        EMAIL: data[i].EMAIL,
                        RESV_NAME_ID: data[i].RESV_NAME_ID, pin_resort: pin_resort };
                    module.exports.sendEmailReminder(data[i].NAME_ID, data[i].NAMETITULAR, data[i].LASTNAMETITULAR, data[i].EMAIL, data[i].RESV_NAME_ID, pin_resort)
                        .then(function (resp) {
                        console.log("resp:", i, (data.length - 1));
                        array = { "resultEmail": resp, personalData: personalData };
                        arrayConstruct.push(array);
                        if (i >= (data.length - 1)) {
                            resolve(arrayConstruct);
                        }
                    })
                        .catch(function (error) {
                        array = { "resultEmail": error, personalData: personalData };
                        arrayConstruct.push(array);
                        console.log("catch:", i, (data.length - 1));
                        if (i >= (data.length - 1)) {
                            reject(arrayConstruct);
                        }
                    });
                }
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    getUserNormal: function () {
        return new Promise(function (resolve, reject) {
            var toDay = new Date();
            var pin_resort = "HTSCR";
            console.log("toDay CheckInAM:", toDay.toString());
            var hotel = "";
            var sql = "SELECT\n\t\t\tinsert_date,\n\t\t\tresv_status,\n\t\t\tarrival,\n\t\t\tCONFIRMATION_NO confirmation_no,\n\t\t\tRESV_NAME_ID resv_name_id ,\n\t\t\tNAME_ID name_id,\n\t\t\tEMAIL email ,\n\t\t\tGUEST_FIRST_NAME nameTitular ,\n\t\t\tGUEST_NAME lastNameTitular\n\t\t\tFROM name_reservation\n\t\t\tWHERE arrival IN TRUNC(SYSDATE)\n\t\t\tAND email IS NOT NULL\n\t\t\tAND resort = 'HTSCR'\n\t\t\tAND resv_status IN ('RESERVED')";
            oracleCn.open(sql, [pin_resort], false)
                .then(function (data) {
                console.log("getUserReminder:", data);
                var arrayConstruct = [];
                var array = [];
                for (var i = 0; i < data.length; ++i) {
                    var personalData = { "NAME_ID": data[i].NAME_ID,
                        "NAMETITULAR": data[i].NAMETITULAR,
                        LASTNAMETITULAR: data[i].LASTNAMETITULAR,
                        EMAIL: data[i].EMAIL,
                        RESV_NAME_ID: data[i].RESV_NAME_ID, pin_resort: pin_resort };
                    module.exports.sendEmailReminder(data[i].NAME_ID, data[i].NAMETITULAR, data[i].LASTNAMETITULAR, data[i].EMAIL, data[i].RESV_NAME_ID, pin_resort)
                        .then(function (resp) {
                        console.log("resp:", i, (data.length - 1));
                        array = { "resultEmail": resp, personalData: personalData };
                        arrayConstruct.push(array);
                        if (i >= (data.length - 1)) {
                            resolve(arrayConstruct);
                        }
                    })
                        .catch(function (error) {
                        array = { "resultEmail": error, personalData: personalData };
                        arrayConstruct.push(array);
                        console.log("catch:", i, (data.length - 1));
                        if (i >= (data.length - 1)) {
                            reject(arrayConstruct);
                        }
                    });
                }
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
    getUserhourly: function () {
        return new Promise(function (resolve, reject) {
            var toDay = new Date();
            var pin_resort = "HTSCR";
            console.log("toDay CheckInAM:", toDay.toString());
            var hotel = "";
            var sql = "SELECT\n\t\t\tinsert_date,\n\t\t\tresv_status,\n\t\t\tarrival,\n\t\t\tCONFIRMATION_NO confirmation_no,\n\t\t\tRESV_NAME_ID resv_name_id ,\n\t\t\tNAME_ID name_id,\n\t\t\tEMAIL email ,\n\t\t\tGUEST_FIRST_NAME nameTitular ,\n\t\t\tGUEST_NAME lastNameTitular\n\t\t\tFROM name_reservation\n\t\t\tWHERE (insert_date) >= (SYSDATE) -1/24\n\t\t\tAND (insert_date) <= (SYSDATE)\n\t\t\tAND arrival IN TRUNC(SYSDATE)\n\t\t\tAND email IS NOT NULL\n\t\t\tAND resort = 'HTSCR'\n\t\t\tAND resv_status IN ('RESERVED')";
            oracleCn.open(sql, [pin_resort], false)
                .then(function (data) {
                console.log("getUserReminder:", data);
                var arrayConstruct = [];
                var array = [];
                for (var i = 0; i < data.length; ++i) {
                    var personalData = { "NAME_ID": data[i].NAME_ID,
                        "NAMETITULAR": data[i].NAMETITULAR,
                        LASTNAMETITULAR: data[i].LASTNAMETITULAR,
                        EMAIL: data[i].EMAIL,
                        RESV_NAME_ID: data[i].RESV_NAME_ID, pin_resort: pin_resort };
                    module.exports.sendEmailReminder(data[i].NAME_ID, data[i].NAMETITULAR, data[i].LASTNAMETITULAR, data[i].EMAIL, data[i].RESV_NAME_ID, pin_resort)
                        .then(function (resp) {
                        console.log("resp:", i, (data.length - 1));
                        array = { "resultEmail": resp, personalData: personalData };
                        arrayConstruct.push(array);
                        if (i >= (data.length - 1)) {
                            resolve(arrayConstruct);
                        }
                    })
                        .catch(function (error) {
                        array = { "resultEmail": error, personalData: personalData };
                        arrayConstruct.push(array);
                        console.log("catch:", i, (data.length - 1));
                        if (i >= (data.length - 1)) {
                            reject(arrayConstruct);
                        }
                    });
                }
            })
                .catch(function (err) {
                console.log("error:", err);
                reject(err);
            });
        });
    },
};
