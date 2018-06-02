var session = require('express-session');
var User = require('./db');
var passport = require('passport');
LocalStrategy = require('passport-local').Strategy;

module.exports = function(app) {

  app.use(session({
    secret: 'tajny kod',
    resave: false,
    saveUninitialized: false
  }));

  app.use(passport.initialize());
  app.use(passport.session());

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  passport.use(new LocalStrategy(
    function(username, password, done) {
      User.findOne({ username: username }, function (err, user) {
        if (err) { return done(err); }
        console.log(user);
        if (!user) {
          console.log('Incorrect username.');
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validPassword(password)) {
          console.log('Incorrect password.');
          return done(null, false, { message: 'Incorrect password.' });
        }
        if (user.active == false) {
          console.log('user not activated');
          return done(null, false, { message: 'User not activated.' });
        }
        return done(null, user);
      });
    }
  ));

};
