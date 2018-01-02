var mongoose = require('mongoose');

var noticeSchema = mongoose.Schema({
	id:String,
	post_type:String,
	access:Number,
	topic:String,
	body:String,
	category:String,
	sub_cat1:{type:String,default:''},
	sub_cat2:{type:String,default:''},
	description:{type:String,default:''},
	pics:[String],
	attachment:[String],
	date_created: { type: Date, default: Date.now },
	date_modified: { type: Date, default: Date.now },
	post_date: { type: Date, default: Date.now },
	owner:{id:String,displayName:String,displayPic:String,status:String},
	post_owner:{type:Boolean,default:false},
	status:[{
		question:{type:Boolean,default:false},
		article:{type:Boolean,default:false},
		riddle:{type:Boolean,default:false},
		pab:{type:Boolean,default:false},
		notice:{type:Boolean,default:true},
		trend:{type:Boolean,default:false},
		home:{type:Boolean,default:false}
	}],
	page_response:{type:String,default:''},
	views:{type:Number,default:0},
	shares:{type:Number,default:0},
	likes:{type:Number,default:0},

});

var Notice = mongoose.model('Notice', noticeSchema);
module.exports = Notice;