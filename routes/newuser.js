var express = require('express');
var router = express.Router();
var passport = require('passport');
var User = require('../utils/db.js')
var gmailTransporter = require('../utils/mailerTransporter.js');
var sha1 = require('sha1');

// strona główna z odnośnikami
router.get('/', function (req, res, next) {
    res.render('newuser');
});

router.post('/', function (req, res, next) {

    if (req.body.password === req.body.password2) {
        var newusr = new User({
            "username": req.body.username,
            "password": sha1(req.body.password),
            "email": req.body.email
        });
        newusr.save(function (err, data) {
            if (err) return console.error(err);


            let userToUpdate = data._id;
            console.log('wysyłam maila do usera: ', userToUpdate);
            User.find({
                _id: userToUpdate
            }, function (err, dane) {
                console.log('znalazlem: ', dane);
                if (err) {
                    res.json(err);
                    return console.error(err);
                }
                console.log('chce wyslac na email: ', dane[0].email);
                let mailOptions = {
                    // adres nadawcy
                    from: '"Marcin Rał" <marak89@marak89.com>',
                    // lista odbiorców
                    to: dane[0].email,
                    // temat wiadomości
                    subject: 'Aktywacja konta',
                    // treść wiadomości tekstowej
                    text: 'aktywuj: https://web20spr1.m89.eu/users/activate/' + dane[0]._id,
                    // treść wiadomości w html
                    html: `<b>aktywuj: <a href="https://web20spr1.m89.eu/users/activate/` + dane[0]._id + `"> https://web20spr1.m89.eu/users/activate/` + dane[0]._id + `</a></b>
                <p>Klikając w link akceptujesz politykę prywatności, regulami przetwarzania ciasteczek, politykę profilowania oraz inne polityki które zostaną wdrożone podczas kolejnej zmiany prawa.</p>`
                };
                // wysyła maila dla ustawionej warstwy transportowej dla danych opcji
                gmailTransporter.gmailTransporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        return console.log(error);
                    }
                    console.log('Wiadomość %s wysłana: %s',
                        info.messageId, info.response);
                    res.render('index', {
                        title: "Dodano użytkownika",
                        body: 'Sprawdź swoją skrzynkę pocztową i kliknij w link aktywacyjny!'
                    });
                });
            })


        });
    } else {
        res.render('index', {
            title: "BŁĄD",
            body: 'Podane hasła nie są identyczne!'
        });
    }


});

module.exports = router;