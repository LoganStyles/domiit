var mongoose = require('mongoose');

var articleSub2Schema = mongoose.Schema({
	id:String,
	category:String,
	title:String,
	value:String,
	description:{type:String,default:''}
});

var ArticleSub2 = mongoose.model('ArticleSub2', articleSub2Schema);
module.exports = ArticleSub2;