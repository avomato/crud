var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('../models/User');



// serialize & deserialize User
//passport.serializeUser함수는 login시에 DB에서 발견한 user를 어떻게 session에 저장할지를 정하는 부분.
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(function(id, done) {
  User.findOne({_id:id}, function(err, user) {
    //findOne  DB에서 해당 model의 document를 하나 찾는 함수
    done(err, user);
  });
});




// local strategy
passport.use('local-login',
  new LocalStrategy({
      usernameField : 'username',
      passwordField : 'password',
      passReqToCallback : true
    },
    function(req, username, password, done) {
      User.findOne({username:username})
        .select({password:1})
        .exec(function(err, user) {
          if (err) return done(err);

          if (user && user.authenticate(password)){
            return done(null, user);
          }
          else {
            req.flash('username', username);
            req.flash('errors', {login:'The username or password is incorrect.'});
            return done(null, false);
          }
        });
    }
  )
);

module.exports = passport;
