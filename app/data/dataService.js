var mongoose = require('mongoose');
var User = require('./models/User.js');
if(process.env.NODE_ENV === 'dev ') {
    mongoose.connect('mongodb://localhost/test');
} else if(process.env.NODE_ENV === 'test'){
    mongoose.connect('mongodb://localhost/test-dev');
} else {
    mongoose.connect('mongodb://dbuser:heroku@ds119049.mlab.com:19049/trivia');
}

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('connected to database');
});


exports.login = function(msg, id, memberService, callback) {
    var result = null;
    User.findOne({ 'name': msg.name }, function (err, outerUser) {
        if (err) {
            return;
        }
        if(!outerUser) {
            User.create({'name': msg.name, 'password': msg.password}, function(err, _user) {
                memberService.addMember(_user, id);
                callback(null, _user);
            });
        } else {
            if(msg.password !== outerUser.password) {
                callback('Wrong password for the username ' + outerUser.name, null);
            } else {
                memberService.addMember(outerUser, id);
                callback(null, outerUser);
            }
        }
    });
}

exports.saveUser = function(updateUser) {
    var result = null;
    User.findOne({ 'name': updateUser.name }, function (err, foundUser) {
        if (err) {
            return;
        }
        if(!foundUser) {
            return 'user not found'
        } else {
            foundUser.save(function(err) {
                if(err) {
                    console.log('error saving user', err);
                } else {
                    return 'successfully saved user';
                }
            })
        }
    });
}
