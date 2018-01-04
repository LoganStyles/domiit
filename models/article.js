var mongoose = require('mongoose');

var articleSchema = mongoose.Schema({
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

	question_status:{type:Boolean,default:false},
	art_status:{type:Boolean,default:true},
	riddle_status:{type:Boolean,default:false},
	pab_status:{type:Boolean,default:false},
	notice_status:{type:Boolean,default:false},
	trend_status:{type:Boolean,default:false},
	
	page_response:{type:String,default:'review'},
	views:{type:Number,default:0},
	shares:{type:Number,default:0},
	likes:{type:Number,default:0},
	answers_len:{type:Number,default:0},
	comments_len:{type:Number,default:0},
	comments:[{
		body:String,
		responderDisplayName:String,
		responder_id:String,
		responderDisplayPic:String,
		date_created:{type:Date,default:Date.now}
	}],
	answers:[{
		body:String,
		responderDisplayName:String,
		responder_id:String,
		responderDisplayPic:String,
		responderStatus:String,
		pics:[String],
		date_created:{type:Date,default:Date.now},
		date_modified:{type:Date,default:Date.now},
		post_date: { type: Date, default: Date.now },
		views:{type:Number,default:0},
		upvotes:{type:Number,default:0},
		downvotes:{type:Number,default:0},
		comments:[{
			body:String,
			responderDisplayName:String,
			responder_id:String,
			responderDisplayPic:String,
			date_created:{type:Date,default:Date.now},
			likes:{type:Number,default:0},
			reply:[{
				body:String,
				responderDisplayName:String,
				responder_id:String,
				responderDisplayPic:String,
				responderStatus:String,
				date_created:{type:Date,default:Date.now}
			}]
		}]

	}]

});

var Art = mongoose.model('Art', articleSchema);
module.exports = Art;

/*
access types:
public:1
friends of friends:2
friends:3
only me:4
*/