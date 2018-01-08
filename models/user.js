var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    id:String,
    email:String,
    dob: { type: Date, default: '' },
    type:{type:String,default:'User'},
    password:String,
    firstname:{type:String,default:''},
    lastname:{type:String,default:''},
    country:{type:String,default:''},
    displayName:{type:String,default:'User'},
    displayPic:[{type:String,default:''}],
    backgroundPic:[{type:String,default:''}],
    phone:{type:String,default:''},
    date_created: { type: Date, default: Date.now },
    date_modified: { type: Date, default: Date.now },
    education:[{ title: String,body: String,from_year:String,to_year:String, date: { type: Date, default: Date.now } }],
    schools:[{ title: String,body: {type:String,default:''}, date: { type: Date, default: Date.now } }],
    designation:[{ title: String,body: String, date: Date }],
    qualification:[{ title: String,body: {type:String,default:''}, year:String,date: { type: Date, default: Date.now } }],
    description:{type:String,default:''},
    area_of_speciality:[String],
    group_ids:[String],
    gender:{type:String,default:'male'},
    location:{type:String,default:''},
    friend_ids:[String],
    followers:[String],
    followed:[String],
    trend_follows:[String],
    bookmarks:[{item_id:String,body:String,date:{type:Date,default:Date.now}}],
    upvotes:{type:Number,default:0},
    downvotes:{type:Number,default:0},
    request_ids:[String],
    question_ids:[String],
    answer_ids:[String],
    article_ids:[String],
    review_ids:[String],
    riddle_ids:[String],
    solution_ids:[String],
    postedbook_ids:[String],
    request_ids:[String]

});

var User = mongoose.model('User', userSchema);
module.exports = User;