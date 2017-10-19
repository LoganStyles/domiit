var mongoose = require('mongoose');

var userSchema = mongoose.Schema({
    id:String,
    email:String,
    username:String,
    password:String,
    displayName:String,
    displayPic:String,
    phone:String,
    date_created: { type: Date, default: Date.now },
    education:[String],
    current_appointment:[mongoose.Schema.Types.Mixed],
    qualification:[mongoose.Schema.Types.Mixed],
    description:String,
    area_of_speciality:[String],
    groups:[String],
    gender:String

});

var User = mongoose.model('User', userSchema);
module.exports = User;