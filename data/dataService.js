var mongoose = require('mongoose');
var User = require('./models/User.js');
mongoose.connect('mongodb://dbuser:heroku@ds119049.mlab.com:19049/trivia');

var db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  // we're connected!
  console.log('connected to database');
});


exports.login = function(req, memberService) {
    var result = null;
    console.log('inside login...', req.body.name, req.body.password);
    User.findOne({ 'name': req.body.name }, function (err, user) {
        if (err) {
            // dont know what that would be
            return;
        }
        if(!user) {
            User.create({'name': req.body.name, 'password': req.body.password}, function(err, _user) {
                memberService.addMember(_user);
                return _user;
            });
        } else {
            memberService.addMember(user);
            return user;
        }
    });
}

