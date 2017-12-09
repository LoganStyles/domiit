var mongoose = require('mongoose');

var pabCatsSchema = mongoose.Schema({
	id:String,
	title:String,
	value:String,
	description:{type:String,default:''}
});

var PabCat = mongoose.model('PabCat', pabCatsSchema);
module.exports = PabCat;