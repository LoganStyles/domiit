var mongoose = require('mongoose');

var pabSchema = mongoose.Schema({
	id:String,
	body:String,
	category:{type:String,default:''},
	author:{type:String,default:''},
	amount:{type:Number,default:0},
	isbn:{type:String,default:0},
	pages:{type:Number,default:0},
	publishers:{type:String,default:''},
	bookshop:{type:String,default:''},
	url:{type:String,default:''},
	synopsis:{type:String,default:''},
	about_author:{type:String,default:''},
	description:{type:String,default:''},
	pics:[String],
	date_created: { type: Date, default: Date.now },
	date_modified: { type: Date, default: Date.now },
	post_date: { type: Date, default: Date.now },
	owner:{id:String,displayName:String,displayPic:String,status:String},
	views:{type:Number,default:0},
	shares:{type:Number,default:0},
	likes:{type:Number,default:0},
	comments_len:{type:Number,default:0},
	comments:[{
		body:String,
		responderDisplayName:String,
		responder_id:String,
		responderDisplayPic:String,
		date_created:{type:Date,default:Date.now}
	}]
});

var Pab = mongoose.model('Pab', pabSchema);
module.exports = Pab;