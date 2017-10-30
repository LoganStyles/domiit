var mongoose = require('mongoose');

var questionSub1Schema = mongoose.Schema({
	id:String,
	category:String,
	title:String,
	value:String,
	description:{type:String,default:''}
});

var QuestSub1 = mongoose.model('QuestSub1', questionSub1Schema);
module.exports = QuestSub1;