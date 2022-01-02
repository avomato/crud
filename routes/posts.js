var express  = require('express');
var router = express.Router();
var Post = require('../models/Post');
var util = require('../util');
//require() = 다른 위치 에서 모델 불러오기

// Index
router.get('/', function(req, res){
  Post.find({})
    .populate('author') //Model.populate()함수는 relationship이 형성되어 있는 항목의 값을 생성해 준다다. 현재 post의 author에는 user의 id가 기록되어 있는데, 이 값을 바탕으로 실제 user의 값을 author에 생성하게 된다.
    .sort('-createdAt') //.sort()함수는 string이나 object를 받아서 데이터 정렬방법이다, 문자열로 표현하는 경우 정렬할 항목명을 문자열로 넣으면 오름차순으로 정렬하고, 내림차순인 경우 -를 앞에 붙여줍니다. 두가지 이상으로 정렬하는 경우 빈칸을 넣고 각각의 항목을 적어주면 됩니다. object를 넣는 경우 {createdAt:1}(오름차순), {createdAt:-1}(내림차순) 이런식으로 넣어주면 됩니다.
    .exec(function(err, posts){
      if(err) return res.json(err);
      res.render('posts/index', {posts:posts});
    });
});





// New
//util.isLoggedin를 사용해서 로그인이 된 경우에만 해당 route을 사용 가능
router.get('/new', util.isLoggedin, function(req, res){
  var post = req.flash('post')[0] || {};
  var errors = req.flash('errors')[0] || {};
  res.render('posts/new', { post:post, errors:errors });
});




// create
router.post('/', util.isLoggedin, function(req, res){
  req.body.author = req.user._id; //글을 작성할때는 req.user._id를 가져와서 post의 author에 기록.
  Post.create(req.body, function(err, post){
    if(err){
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/new');
    }
    res.redirect('/posts');
  });
});




// show
router.get('/:id', function(req, res){
  Post.findOne({_id:req.params.id})
    .populate('author')
    .exec(function(err, post){
      if(err) return res.json(err);
      res.render('posts/show', {post:post});
    });
});




// edit
router.get('/:id/edit', util.isLoggedin, checkPermission, function(req, res){
  var post = req.flash('post')[0];
  var errors = req.flash('errors')[0] || {};
  if(!post){
    Post.findOne({_id:req.params.id}, function(err, post){
        if(err) return res.json(err);
        res.render('posts/edit', { post:post, errors:errors });
      });
  }
  else {
    post._id = req.params.id;
    res.render('posts/edit', { post:post, errors:errors });
  }
});




// update
router.put('/:id', util.isLoggedin, checkPermission, function(req, res){
  req.body.updatedAt = Date.now();
  Post.findOneAndUpdate({_id:req.params.id}, req.body, {runValidators:true}, function(err, post){
    if(err){
      req.flash('post', req.body);
      req.flash('errors', util.parseError(err));
      return res.redirect('/posts/'+req.params.id+'/edit');
    }
    res.redirect('/posts/'+req.params.id);
  });
});




// destroy
router.delete('/:id', util.isLoggedin, checkPermission, function(req, res){
  Post.deleteOne({_id:req.params.id}, function(err){
    if(err) return res.json(err);
    res.redirect('/posts');
    //Model.deleteOne은 DB에서 해당 model의 document를 하나 찾아 삭제하는 함수입니다. 첫번째 parameter로 찾을 조건을 object로 입력하고 data를 찾은 후 callback함수를 호출한다. Data 삭제후 "/posts"로 redirect합니다.
  });
});

module.exports = router;




// private functions
//Post에서checkPermission함수는 해당 게시물에 기록된 author와 로그인된 user.id를 비교해서 같은 경우에만 계속 진행(next())하고, 만약 다르다면 util.noPermission함수를 호출하여 login 화면으로 돌려보낸다.
function checkPermission(req, res, next){
  Post.findOne({_id:req.params.id}, function(err, post){
    if(err) return res.json(err);
    if(post.author != req.user.id) return util.noPermission(req, res);

    next();
  });
}
