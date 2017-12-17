var mongoose = require('mongoose');

var trendSchema = mongoose.Schema({
	id:String,
	body:String,
	category:String,
	// sub_cat1:{type:String,default:''},
	// sub_cat2:{type:String,default:''},
	description:{type:String,default:''},
	pics:[String],
	date_created: { type: Date, default: Date.now },
	date_modified: { type: Date, default: Date.now },
	post_date: { type: Date, default: Date.now },
	// owner:{id:String,displayName:String,displayPic:String,status:String},
	// post_owner:{type:Boolean,default:false},
	views:{type:Number,default:0},
	shares:{type:Number,default:0},
	likes:{type:Number,default:0},
	// answers_len:{type:Number,default:0},
	comments_len:{type:Number,default:0},
	comments:[{
		body:String,
		responderDisplayName:String,
		responder_id:String,
		responderDisplayPic:String,
		date_created:{type:Date,default:Date.now}
	}]	
});

var Trend = mongoose.model('Trend', trendSchema);
module.exports = Trend;