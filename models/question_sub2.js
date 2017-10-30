var mongoose = require('mongoose');

var questionSub2Schema = mongoose.Schema({
	id:String,
	category:String,
	sub1:String,
	title:String,
	value:String,
	description:{type:String,default:''}
});

var QuestSub2 = mongoose.model('QuestSub2', questionSub2Schema);
module.exports = QuestSub2;