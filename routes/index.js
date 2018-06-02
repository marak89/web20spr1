var express = require('express');
var router = express.Router();

var passport = require('passport');

var User = require('../utils/db.js')
var gmailTransporter = require('../utils/mailerTransporter.js');



// strona główna z odnośnikami
router.get('/', function (req, res, next) {
  res.render('index', {
    title: "Aplikacja tajnej korporacji",
    body: "Aplikacjia tajnej organizacji organizującej supertajne operacje na całym świecie. Tajności sekretów korporacji pilnuje nechanizm logowania!"
  });
});

router.get('/zalogowany', function (req, res, next) {
  var dane = {
    user: req.user,
    passport: req.session.passport,
    log_info: res.locals.logInfo
  };
  res.render('zalogowany', dane);
});

router.get('/niezalogowany', function (req, res, next) {
  var mess = `
    <h3>NIE jesteś zalogowany!</h3>
  `;
  res.send(mess);
});

// wyświetlanie formularza do logowania
router.get('/login', function (req, res) {
  res.render('login');
});

// wylogowanie i przekierowanie na stronę główną
router.get('/logout', function (req, res) {
  req.logout();
  res.redirect('/');
});

// logowanie użytkownika
// poprawne logowanie - przekierowanie na stronę główną
// brak uwierzytelnienia - przekierowanie na strone logowania
router.post('/login',
  passport.authenticate('local', {
    session: true,
    successRedirect: '/',
    failureRedirect: '/login'
  })
);

router.get('/wazne-dane', checkAuthentication, function (req, res) {
  data = {
    title: 'Przepis na ciasto Babci Krysi',
    body: 'Ziemniaki przepuścić przez maszynkę.Jaja wbić,utrzeć z cukrem i miękkim masłem na puch.Masę jajeczno -maślaną połączyć z ziemniakami,serem, wsypać proszek do pieczenia,dokładnie zmiksować  Formę posmarować tłuszczem, wyłożyć herbatnikami ,posypać 2 łyżkami czekolady,rozsmarować masę serową,wygładzić,pozostałą łyżką czekolady za pomocą siteczka, posypać sernik.Wstawić do nagrzanego piekarnika i piec ok.1 godz. w piekarniku nagrzanym do 180 stopni Celsjusza.'
  }
  res.render('index', data);
});



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

// informacje o sesji użytkownika
router.get('/sesja',checkAuthentication, function (req, res, next) {
  if (req.session.odwiedziny) {
    req.session.odwiedziny++;
  } else {
    req.session.odwiedziny = 1;
  }
  var dane = {
    idSesji: req.session.id,
    odwiedziny: req.session.odwiedziny,
    ciasteczko: req.session.cookie,
    data: req.session.cookie.data,
    passport: req.session.passport
  };
  res.render('sesja', dane);
});

router.get('/send-email', function (req, res, next) {
  // wysyła wiadomości, dane mogą byc w unicode
  let mailOptions = {
    // adres nadawcy
    from: '"Marcin Rał" <web20@t.pl>',
    // lista odbiorców
    to: 'web20@t.pl',
    // temat wiadomości
    subject: 'Testowa wiadomość wysłana z aplikacji Marcin Rał',
    // treść wiadomości tekstowej
    text: 'Treść wiadomości jako czysty tekst',
    // treść wiadomości w html
    html: `<b>Treść wiadomości w HTML</b>
  <p>Jakieś znaki w unicode, grecki alfabet: α, β, γ, ...</p>`
  };
  // wysyła maila dla ustawionej warstwy transportowej dla danych opcji
  gmailTransporter.gmailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Wiadomość %s wysłana: %s',
      info.messageId, info.response);
    
    res.render('index',{title:"Status testowej wiadomości:", body:'Wiadomość ' + info.messageId +
    ' wysłana: ' + info.response});
  });

});


module.exports = router;