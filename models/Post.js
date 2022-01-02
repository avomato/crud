var mongoose = require('mongoose');

// schema
var postSchema = mongoose.Schema({
  title:{type:String, required:[true,'제목을 입력하세요.']},
  body:{type:String, required:[true,'내용을 입력하세요.']},
  author:{type:mongoose.Schema.Types.ObjectId, ref:'user', required:true},
  //post schema에 author를 추가. 또한 ref:'user'를 통해 이 항목의 데이터가 user collection의 id와 연결됨을 mongoose에 알림. 이렇게 하여 user의 user.id와 post의 post.author가 연결되어 user와 post의 relationship이 형성된다.
  createdAt:{type:Date, default:Date.now},
  updatedAt:{type:Date},
});

// model & export
var Post = mongoose.model('post', postSchema);
module.exports = Post;
