var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    id:String,
    email:String,
    type:{type:String,default:'User'},
    password:String,
    firstname:{type:String,default:''},
    lastname:{type:String,default:''},
    displayName:{type:String,default:'User'},
    displayPic:{type:String,default:'avatar.png'},
    phone:{type:String,default:''},
    date_created: { type: Date, default: Date.now },
    date_modified: { type: Date, default: Date.now },
    education:[String],
    current_appointment:[mongoose.Schema.Types.Mixed],
    qualification:[mongoose.Schema.Types.Mixed],
    description:{type:String,default:''},
    area_of_speciality:[String],
    group_ids:[String],
    gender:{type:String,default:'male'},
    location:{type:String,default:''},
    designation:{type:String,default:''},
    friend_ids:[String],
    request_ids:[String],
    post_ids:[String],
    article_ids:[String],
    question_ids:[String],
    postedbooks_ids:[String],
    riddle_ids:[String]

});

var User = mongoose.model('User', userSchema);
module.exports = User;