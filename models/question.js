var mongoose = require('mongoose');

var questionSchema = mongoose.Schema({
	id:String,
	body:String,
	category_id:String,
	sub_cat1:{type:String,default:''},
	sub_cat2:{type:String,default:''},
	description:{type:String,default:''},
	displayPic:{type:String,default:''},
	date_created: { type: Date, default: Date.now },
    date_modified: { type: Date, default: Date.now },
    post_date: { type: Date, default: Date.now },
	owner:{id:String,displayName:String,displayPic:String},
	answers:[{
		body:String,
		responderDisplayName:String,
		responder_id:String,
		responderDisplayPic:String,
		pics:[String],
		date_created:{type:Date,default:Date.now},
		date_modified:{type:Date,default:Date.now},
			}]

});

var Quest = mongoose.model('Quest', questionSchema);
module.exports = Quest;