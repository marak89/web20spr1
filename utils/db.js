var mongoose = require('mongoose');
var sha1 = require('sha1');

mongoose.connect('mongodb://192.168.162.199/web20spr1', function (err) {
    if (err) {
        console.log('błąd połączenia', err);
    } else {
        console.log('połączenie udane');
    }
});

// schemat dokumentu opisującego użytkowników w kolekcji users
var userSchema = new mongoose.Schema({
	username: { type: String, required: true, unique: true},
    password: { type: String, required: true},
    admin: {type: Boolean, default: false},
    email: { type: String, required: true, unique: true},
    active: { type: Boolean, required: true, default: false}
});

// walidacja poprawności hasła
userSchema.methods.validPassword = function(pass) {
  return sha1(pass)==this.password;
};

module.exports = mongoose.model('user', userSchema);