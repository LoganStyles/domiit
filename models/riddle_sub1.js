var mongoose = require('mongoose');

var riddleSub1Schema = mongoose.Schema({
	id:String,
	category:String,
	title:String,
	value:String,
	description:{type:String,default:''}
});

var RiddleSub1 = mongoose.model('RiddleSub1', riddleSub1Schema);
module.exports = RiddleSub1;