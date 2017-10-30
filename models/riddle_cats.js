var mongoose = require('mongoose');

var riddleCatsSchema = mongoose.Schema({
	id:String,
	title:String,
	value:String,
	description:{type:String,default:''}
});

var RiddleCat = mongoose.model('RiddleCat', riddleCatsSchema);
module.exports = RiddleCat;