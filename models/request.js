var mongoose = require('mongoose');

var requestSchema = mongoose.Schema({
	// id:String,
	post_type:String,//request
	access:Number,
	topic:String,
	body:String,
	destination_id:String,
	destination_type:String,
	// message:String,//display message prompt
	category:String,
	sub_cat1:{type:String,default:''},
	sub_cat2:{type:String,default:''},
	description:{type:String,default:''},//optional description
	pics:[String],//featured images
	attachment:[String],
	date_created: { type: Date, default: Date.now },
	date_modified: { type: Date, default: Date.now },
	post_date: { type: Date, default: Date.now },
	owner:{id:String,displayName:String,displayPic:String,status:String},
	post_owner:{type:Boolean,default:false},
	bookmarked_post:{type:Boolean,default:false},
	followed_post:{type:Boolean,default:false},
	liked_post:{type:Boolean,default:false},
	friend_status:String,//friend,not_friend,Pending

	question_status:{type:Boolean,default:false},
	art_status:{type:Boolean,default:false},
	riddle_status:{type:Boolean,default:false},
	pab_status:{type:Boolean,default:false},
	notice_status:{type:Boolean,default:false},
	trend_status:{type:Boolean,default:false},
	
	page_response:{type:String,default:''},
	views:{type:Number,default:0},
	shares:{type:Number,default:0},
	likes:[String],
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
		friend_status:String,//friend,not_friend,Pending
		pics:[String],
		date_created:{type:Date,default:Date.now},
		date_modified:{type:Date,default:Date.now},
		post_date: { type: Date, default: Date.now },
		views:{type:Number,default:0},
		upvotes:[String],
		downvotes:[String],
		comments:[{
			body:String,
			responderDisplayName:String,
			responder_id:String,
			responderDisplayPic:String,
			date_created:{type:Date,default:Date.now},
			likes:[String],
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

var Request = mongoose.model('Request', requestSchema);
module.exports = Request;

/*
access types:
public:1
friends of friends:2
friends:3
only me:4
*/