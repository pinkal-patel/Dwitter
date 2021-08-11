const nodemailer = require("nodemailer");
const smtpTransport = require('nodemailer-smtp-transport');


var transport = nodemailer.createTransport(smtpTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    auth: {
        user: "abc@gmail.co.in",
        pass: "xyswwswsw",
    },
    debug: true
}));

let sendMail = (mailOptions) => {
    return new Promise((resolve, reject) => {
        transport.sendMail(mailOptions).then((resp) => {
            resolve(true);
        }, (error) => {
            reject(error);
        });
    });
}

module.exports = {
    sendMail: sendMail
}