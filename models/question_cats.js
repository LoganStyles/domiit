var mongoose = require('mongoose');

var questionCatsSchema = mongoose.Schema({
	id:String,
	title:String,
	description:{type:String,default:''}
});

var QuestCat = mongoose.model('QuestCat', questionCatsSchema);
module.exports = QuestCat;