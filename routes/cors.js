const express = require ('express');
const cors = require ('cors');

const whitelits = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;

    if (whitelits.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
}

exports.cors = cors(); // for anyone to access
exports.corsWithOptions = cors(corsOptionsDelegate); // Allowing specific domains only