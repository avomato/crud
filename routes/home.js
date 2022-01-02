var express = require('express'); //express.Router()를 사용해서 router함수를 초기화
var router = express.Router();
var passport = require('../config/passport');

// Home
router.get('/', function(req, res){
  //      "/"에 get 요청이 오는 경우를 router함수에 설정해 준다.
  res.render('home/welcome');
});
router.get('/about', function(req, res){
  res.render('home/about');
  //ejs파일을 사용하기 위해서는 res.render 함수를 사용해야 하며, 첫번째 parameter로 ejs의 이름을, 두번째 parameter로 ejs에서 사용될 object를 전달한다.
});

// Login
router.get('/login', function (req,res) {
  var username = req.flash('username')[0];
  var errors = req.flash('errors')[0] || {};
  res.render('home/login', {
    username:username,
    errors:errors
  });
});

// Post Login
router.post('/login',
  function(req,res,next){
    var errors = {};
    var isValid = true;

    if(!req.body.username){
      isValid = false;
      errors.username = '닉네임을 입력해 주세요.';
    }
    if(!req.body.password){
      isValid = false;
      errors.password = '비밀번호를 입력해 주세요.';
    }

    if(isValid){
      next();
    }
    else {
      req.flash('errors',errors);
      res.redirect('/login');
    }
  },
  passport.authenticate('local-login', {
    successRedirect : '/posts',
    failureRedirect : '/login'
  }
));

// Logout
router.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

module.exports = router;
//module.exports = router를 모듈로 쓰겠다
