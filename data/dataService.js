var mongoose = require('mongoose');
var User = require('./models/User.js');
if(process.env.NODE_ENV === 'dev ') {
    mongoose.connect('mongodb://localhost/test');
} else {
    mongoose.connect('mongodb://dbuser:heroku@ds119049.mlab.com:19049/trivia');
}

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('connected to database');
});


exports.login = function(req, res, memberService) {
    var result = null;
    console.log('inside login...', req.body.name, req.body.password);
    User.findOne({ 'name': req.body.name }, function (err, outerUser) {
        if (err) {
            // dont know what that would be
            return;
        }
        if(!outerUser) {
            User.create({'name': req.body.name, 'password': req.body.password}, function(err, _user) {
                memberService.addMember(_user);
                res.status(200).send(_user);
            });
        } else {
            if(req.body.password !== outerUser.password) {
                res.status(400).send("Wrong password for the username " + outerUser.name);
            } else {
                memberService.addMember(outerUser);
                res.status(200).send(outerUser);
            }
        }
    });
}

exports.saveUser = function(updateUser) {
    var result = null;
    console.log('inside usersave...', updateUser);
    User.findOne({ 'name': updateUser.name }, function (err, foundUser) {
        if (err) {
            // dont know what that would be
            return;
        }
        if(!foundUser) {
            return 'user not found'
        } else {
            foundUser.save(function(err, updateUser) {
                if(err) {
                    console.log('error saving user', err);
                } else {
                    return 'successfully saved user';
                }
            })
        }
    });
}
