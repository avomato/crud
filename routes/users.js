var express = require('express');
var router = express.Router();
var User = require('../models/User');
var util = require('../util');



// New
router.get('/new', function(req, res){
  var user = req.flash('user')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('users/new', { user:user, errors:errors });
});



// create
router.post('/', function(req, res){
  User.create(req.body, function(err, user){
    if(err){
      req.flash('user', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/users/new');
    }
    res.redirect('/');
  });
});



// show
//util.isLoggedin과 checkPermission를 사용해서 로그인이 되고 자신의 데이터에 접근하는 경우에만 해당 route을 사용
router.get('/:username', util.isLoggedin, checkPermission, function(req, res){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    res.render('users/show', {user:user});
  });
});



// edit
router.get('/:username/edit', util.isLoggedin, checkPermission, function(req, res){
  var user = req.flash('user')[0];
  var errors = req.flash('errors')[0] || {};
  if(!user){
    User.findOne({username:req.params.username}, function(err, user){
      if(err) return res.json(err);
      res.render('users/edit', { username:req.params.username, user:user, errors:errors });
    });
  }
  else {
    res.render('users/edit', { username:req.params.username, user:user, errors:errors });
  }
});




// update
router.put('/:username', util.isLoggedin, checkPermission, function(req, res, next){
  User.findOne({username:req.params.username}) //findOneAndUpdate함수대신에 findOne함수로 값을 찾은 후에 값을 수정하고 user.save함수로 값을 저장한다. 단순히 값을 바꾸는 것이 아니라 user.password를 조건에 맞게 바꿔주어야 하기 때문.
    .select('password') //select함수를 이용하면 DB에서 어떤 항목을 선택할지, 안할지 정할 수 있다. user schema에서 password의 select을 false로 설정했으니 DB에 password가 있더라도 기본적으로 password를 읽어오지 않게 되는데, select('password')를 통해서 password를 읽어오게 했다. 참고로 select함수로 기본적으로 읽어오게 되어 있는 항목을 안 읽어오게 할 수도 있는데 이때는 항목이름 앞에 -를 붙이면 된다. 또한 하나의 select함수로 여러 항목을 동시에 정할 수도 있는데, 예를 들어 password를 읽어오고, name을 안 읽어오게 하고 싶다면 .select('password -name')를 입력하면 된다.
    .exec(function(err, user){
      if(err) return res.json(err);





      // update user object
      user.originalPassword = user.password;
      user.password = req.body.newPassword? req.body.newPassword : user.password; //user의 update(회원 정보 수정)은 password를 업데이트 하는 경우와, password를 업데이트 하지 않는 경우로 나눌 수 있는데, 이에 따라 user.password의 값이 바뀐다.
      for(var p in req.body){  // user는 DB에서 읽어온 data이고, req.body가 실제 form으로 입력된 값이므로 각 항목을 덮어 쓰는 부분이다.
        user[p] = req.body[p];
      }




      // save updated user
      user.save(function(err, user){
        if(err){
          req.flash('user', req.body);
          req.flash('errors', util.parseError(err));
          return res.redirect('/users/'+req.params.username+'/edit');
        }
        res.redirect('/users/'+user.username);
      });
  });
});

module.exports = router;



// private functions
//User에서checkPermission함수는 해당 user의 id와 로그인된 user.id를 비교해서 같은 경우에만 계속 진행(next())하고, 만약 다르다면 util.noPermission함수를 호출하여 login 화면으로 돌려보냄
function checkPermission(req, res, next){
  User.findOne({username:req.params.username}, function(err, user){
    if(err) return res.json(err);
    if(user.id != req.user.id) return util.noPermission(req, res);

    next();
  });
}
