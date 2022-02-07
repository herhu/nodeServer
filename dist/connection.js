"use strict";
var objoracle = require("oracledb");
var config = require('./config');

var cns = {
    user: config.USER_BD,
    password: config.PASS_BD,
    connectString: config.CONNECT_STRING
};

function error(err, cn) {
    if (err) {
        console.log(err.message);
        if (cn != null)
            close(cn);
        return -1;
    }
    else {
        return 0;
    }
}
const open = async (sql, binds, dml) => {

    let connection;
    try {

        connection = await objoracle.getConnection(cns);

        const result = await connection.execute(sql, binds, { autoCommit: dml, outFormat: objoracle.OUT_FORMAT_OBJECT });
        if (dml) {
            return JSON.stringify(result.rowsAffected);
        }
        else {
            return result.rows;
        }

    } catch (err) {
        console.error(err);
        return err
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
                return err
            }
        }
    }
}
function openProcedure(sql, binds, dml) {
    return new Promise(function (resolve, reject) {
        objoracle.getConnection(cns, function (err, cn) {
            if (error(err, null) == -1)
                reject();
            var result = cn.execute(sql, binds);
            resolve(result);
        });
    });
}
function openProcedureMany(sql, binds, options) {
    return new Promise(function (resolve, reject) {
        objoracle.getConnection(cns, function (err, cn) {
            if (error(err, null) == -1)
                reject();
            var result = cn.executeMany(sql, binds, options);
            resolve(result);
        });
    });
}
function close(cn) {
    cn.release(function (err) {
        if (err) {
            console.error(err.message);
        }
    });
}
exports.openProcedureMany = openProcedureMany;
exports.openProcedure = openProcedure;
exports.open = open;
exports.close = close;
