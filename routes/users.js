var express = require('express');
var router = express.Router();

var sha1 = require('sha1');
var User = require('../utils/db.js')
var gmailTransporter = require('../utils/mailerTransporter.js');


function checkAuthentication(req, res, next) {
  console.log('sprawdzam');
  if (req.isAuthenticated()) {
    console.log('JEST OK');
    // if user is looged in, req.isAuthenticated() will return true
    next();
  } else {
    console.log('nie jest ok');
    res.redirect("/login");
  }
}


// lista wszystkich użytkowników w bazie
router.get('/', function (req, res) {
  User.find(function (err, data) {
    if (err) return console.error(err);
    console.log(data);
    res.json(data);
  })
});


// resetowanie zawartości kolekcji użytkowników
router.get('/reset', function (req, res, next) {
  User.remove({}, function (err) {
    if (err) return handleError(err);
    var admin = new User({
      "username": "admin",
      "password": sha1("stud234"),
      "admin": true,
      "email": "admin@marak89.com",
      "active": true
    });
    var asdf = new User({
      "username": "asdf",
      "password": sha1("asdf"),
      "email": "web20@t.pl"
    });
    var userBezMaila = new User({
      "username": "bezMaila",
      "password": sha1("bezMaila"),
      "email": "brak"
    });

    // create two users: 'admin' and 'asdf'
    admin.save((err, data) => {
      if (err) return console.error(err);
      asdf.save(function (err, data2) {
        if (err) return console.error(err);
        userBezMaila.save(function (err, data3) {
          if (err) return console.error(err);
          res.render('info', {
            title: 'Users created!',
            data: {
              data,
              data2,
              data3
            }
          });
        })
      });
    });
  });
});

router.get('/au',checkAuthentication, function (req, res) {
  User.find(function (err, data) {
    if (err) return console.error(err);
    console.log(data);
    res.render('aktywacja', {
      users: data
    });
  })
});


router.get('/activate/:id', function (req, res) {
  console.log('aktywuje usera: ', req.params.id);
  let userToUpdate = req.params.id;

  User.update({
    _id: userToUpdate
  }, {
    active: true
  }, function (err, result) {
    let ans = (err === null) ?  'Uzytkownik aktywowany poprawnie': err ;
    res.render('index', {title:'Aktywacja uzytkownika', body: ans});
  });
});

router.get('/activation-email/:id', function (req, res) {
  let userToUpdate = req.params.id;
  console.log('wysyłam maila do usera: ', req.params.id);
  User.find({
    _id: userToUpdate
  }, function (err, dane) {
    console.log('znalazlem: ', dane);
    if (err) {
      res.json(err);
      return console.error(err);
    }
    console.log('chce wyslac na email: ',dane[0].email);
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
        res.render('index',{title:"Status wiadomości z linkiem aktywacyjnym:", body:'Wiadomość ' + info.messageId +
        ' wysłana: ' + info.response});
    });
  })
});

module.exports = router;