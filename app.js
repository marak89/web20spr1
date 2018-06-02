var createError = require('http-errors');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var cookieParser = require('cookie-parser');
var logger = require('morgan');

var bodyParser = require('body-parser');
var session = require('express-session');


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

//var passport = require('passport');
//LocalStrategy = require('passport-local').Strategy;
//var User = require('./utils/db.js')


var app = express();

// app.use(passport.initialize());
// app.use(passport.session());

// passport.serializeUser(function(user, done) {
//  // console.log(JSON.stringify(user));
//  done(null, user._id);
// });

// passport.deserializeUser(function(id, done) {
//  User.findById(id, function(err, user) {
//  done(err, user);
//  });
// });

// passport.use(new LocalStrategy(
//  function(username, password, done) {
//    User.findOne({ username: username }, function (err, user) {
//    if (err) { return done(err); }
//      if (!user) {
//       return done(null, false, { message: 'Incorrect username.' });
//      }
//      if (!user.validPassword(password)) {
//       return done(null, false, { message: 'Incorrect password.' });
//      }
//     return done(null, user);
//    });
//    }
// ));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// cała obsługa logowania za pomocą Passport w osobnym module (utils/passport)
// https://stackoverflow.com/questions/32418963/how-to-use-multiple-router-files
var passport = require('./utils/passport');
passport(app);

// warstwa pośrednia, która sprawdza uwierzytelnienie dla wszystkich adresów URL
// jeśli tak, to req.isAuthenticated() zwraca true - dodajemy info o zalogowaniu do naglówka 
// jeśli nie to sprawdzamy czy strona jest dostępna dla niezalogowanych, jeśli nie
// to przekierowujemy do formularza logowania
app.use(function(req, res, next) {
  if(req.isAuthenticated()){
    //if user is looged in, req.isAuthenticated() will return true
    res.locals.logInfo = `Zalogowany: ${req.user.username}`;
    next();
  } else{
    res.locals.logInfo = `Niezalogowany`;
    if(req.url==='/user/activate/:id' || req.url==='/send-email' || req.url==='/' || req.url==='/sesja' || req.url==='/login' || req.url==='/users/reset' ) {
      next();
    } else {
      res.redirect("/login");
    }
  }
});

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
