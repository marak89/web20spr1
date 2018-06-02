const nodemailer = require('nodemailer');
// tworzy obiekt warstwy transportowej, domyślnie używa protokołu SMTP
let gmailTransporter = nodemailer.createTransport({
    host: 't.pl',
    port: 465,
    secure: true, // użwa TLS
    auth: {
    user: 'web20@t.pl', pass: 'stud234'
    },
    tls: {
    // nie przerywa przy błędnym certyfikacie
    rejectUnauthorized: false
    }    
});
module.exports = { gmailTransporter: gmailTransporter }