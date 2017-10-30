var mongoose = require('mongoose');

var questionCatsSchema = mongoose.Schema({
	id:String,
	title:String,
	value:String,
	description:{type:String,default:''}
});

var QuestCat = mongoose.model('QuestCat', questionCatsSchema);
module.exports = QuestCat;