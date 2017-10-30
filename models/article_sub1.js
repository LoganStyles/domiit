var mongoose = require('mongoose');

var articleSub1Schema = mongoose.Schema({
	id:String,
	category:String,
	title:String,
	value:String,
	description:{type:String,default:''}
});

var ArticleSub1 = mongoose.model('ArticleSub1', articleSub1Schema);
module.exports = ArticleSub1;