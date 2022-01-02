var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser'); //body-parser 모듈 변수에 담기
var methodOverride = require('method-override');  //method-override 모듈 변수에 담기
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('./config/passport'); //로그인 모듈
var app = express();



// DB setting
mongoose.connect(process.env.MONGO_DB); //환경변수로 연결
var db = mongoose.connection;
db.once('open', function(){
  console.log('DB connected');
});
db.on('error', function(err){
  console.log('DB ERROR : ', err);
});



// Other settings
app.set('view engine', 'ejs');
app.use(express.static(__dirname+'/public'));
app.use(bodyParser.json());  //json형태로 받겠다
app.use(bodyParser.urlencoded({extended:true}));  //웹브라우저의 form에 입력한 데이터가 bodyParser를 통해 req.body으로 생성이 된다
app.use(methodOverride('_method')); //method의 query로 들어오는 값으로 HTTP method를 바꾼다.
app.use(flash()); //flash를 초기화. 이제부터 req.flash라는 함수를 사용 가능.
app.use(session({secret:'MySecret', resave:true, saveUninitialized:true}));
//session은 서버에서 접속자를 구분시키는 역할


// Passport
app.use(passport.initialize()); //passport를 초기화 시켜주는 함수
app.use(passport.session()); //passport를 session과 연결해 주는 함수



// Custom Middlewares
//app.use에 함수를 넣은 것 = middleware.
app.use(function(req,res,next){
  res.locals.isAuthenticated = req.isAuthenticated(); //req.isAuthenticated()는 passport에서 제공하는 함수, 현재 로그인이 되어있는지 아닌지를true,false로 return.
  res.locals.currentUser = req.user; //req.user는 passport에서 추가하는 항목으로 로그인이 되면 session으로 부터 user를 deserialize하여 생성.
  next();
});



// Routes
app.use('/', require('./routes/home'));
app.use('/posts', require('./routes/posts'));
app.use('/users', require('./routes/users'));



// Port setting
var port = 3000;
app.listen(port, function(){
  console.log('server on! http://localhost:'+port);
});
