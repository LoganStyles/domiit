var mongoose = require('mongoose');

var trendCatsSchema = mongoose.Schema({
	id:String,
	title:String,
	value:String,
	icon:{type:String,default:''},
	description:{type:String,default:''}
});

var TrendCat = mongoose.model('TrendCat', trendCatsSchema);
module.exports = TrendCat;