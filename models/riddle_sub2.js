var mongoose = require('mongoose');

var riddleSub2Schema = mongoose.Schema({
	id:String,
	category:String,
	sub1:String,
	title:String,
	value:String,
	description:{type:String,default:''}
});

var RiddleSub2 = mongoose.model('RiddleSub2', riddleSub2Schema);
module.exports = RiddleSub2;