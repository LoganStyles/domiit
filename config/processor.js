var mongoose = require('mongoose');
var user = require('../models/user');
// var user = require('../models/user');
var trend = require('../models/trend');
var mongoose = require('mongoose');
var MongoClient = require('mongodb').MongoClient;
// var mongo_url = "mongodb://localhost:27017/";
// var mongo_url ="mongodb://domiitu:SocEcorOakEapM5@ds013475.mlab.com:13475/heroku_sdf7bh9m";
var mongo_url = process.env.MONGODB_URI;

var methods={};

/*get owner details*/
methods.getLatestOwnerDetails=function (arr){
    var promise=user.findOne({_id:arr.id},{
        displayName:1,
        displayPic:1,
        designation:1,
        trend_followed:1//string of ids
    }).exec();
    return promise;
};

methods.getStoryDetails=function (arr){
    var promise=trend.findOne({_id:arr._id},{category:1,excerpt:1,pics:1,trend_followed:1}).exec();
    return promise;
};

/*handle notification for the current user*/
methods.getNotifications=function(user,callback){

//get pending friends length
var len=0;
//console.log('getnotifs for '+user._id);


MongoClient.connect(mongo_url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("doomiit");
  dbo.collection("FriendshipCollection").find({requested:user._id}).toArray(function(err, result) {
    if (err) throw err;
    //console.log(result);
    //console.log(result.length);
    len=result.length;
    db.close();
    callback(len);
  });

});

};

/*check if item has been previously bookmarked*/
methods.checkBookmarks=function(user,item_id){
    var saved_bookmarks_len=user.bookmarks.length;
    var saved_bookmarks=user.bookmarks;
    var curr_saved_bookmark;

    for(var i=0;i<saved_bookmarks_len;i++){
        curr_saved_bookmark=saved_bookmarks[i];
        // console.log('curr_saved_bookmark '+curr_saved_bookmark)
        if(curr_saved_bookmark.item_id == (item_id).toString()){
            return true;
        }
    }
    return false;
};

/*check if post owner is been followed by current user*/
methods.checkFollowed=function(user,owner_id){
    var followed_len=user.followed.length;
    var followed=user.followed;
    var curr_followed;

    for(var i=0;i<followed_len;i++){
        curr_followed=followed[i];
        // console.log('curr_followed '+curr_followed)
        if(curr_followed == (owner_id)){
            return true;
        }
    }
    return false;
};

/*check if item has been previously liked*/
methods.checkLikes=function(user_id,item_likes){
    var likes_len=item_likes.length;
    var curr_liked_id;

    for(var i=0;i<likes_len;i++){
        curr_liked_id=item_likes[i];
        if(curr_liked_id == (user_id).toString()){
            return true;
        }
    }
    return false;
};

methods.checkRelationship=function(user_id,post_owner_id,callback){
    /*check if there's pending friend request with post owner
    or if post owner is already a friend*/
    //user_id::current user obj id
    //post_owner_id::post owner string id
    //console.log('inside relationship')
    var friend_status='not_friend';
    var req_user_id=(user_id).toString();
    var post_owner_obj = mongoose.Types.ObjectId(post_owner_id);//convert id string to obj id

    if(req_user_id ===post_owner_id){
        //console.log('USER IS POST OWNER');
        callback('friend');
    }else{
        //console.log('USER IS NOT POST OWNER..CHECKING FRIENDSHIP STATUS');
        user.getFriendship(user_id,post_owner_obj,function(err_res,rel_res){
            if(err_res){
               // console.log(err_res)

            }else if(rel_res){
                //console.log('results for relationship found');
            //console.log(rel_res._id);
            //console.log(rel_res.status);

            if(rel_res.status=='Accepted'){
                callback('friend');
            }else if(rel_res.status=='Pending'){
                callback('Pending');
            }
        }

    });
    }
};

/*
perform some operations on the posts such as updating display pics,
checking if the post owner is a friend etc
.::chk type of post since some operations defer based on this
.
*/

methods.processPagePosts=function (items,ref_user,callback){
    //items::posts that are to be displayed
    //ref_user::current user viewing the posts
    //console.log('processPagePosts')
    //console.log(items);
    var promise,trend_followed=false,
    displayPic="",
    status="",
    display_name="",
    res_id="",
    processed_items=0;
    var row_count=0;

    items.forEach((cur_item,index,array)=>{
        var updated_obj={};
        if(cur_item.post_type=="trending"){
            promise = this.getStoryDetails(cur_item);//fetch data for this story
        }else{
            //check if post is already bookmarkd
            cur_item.bookmarked_post=this.checkBookmarks(ref_user,cur_item._id);
            //check if post is already bookmarkd
            cur_item.followed_post=this.checkFollowed(ref_user,cur_item.owner.id);
            //check if post is already liked
            cur_item.liked_post=this.checkLikes(ref_user._id,cur_item.likes);

            //check relationship of current user with post owner
            this.checkRelationship(ref_user._id,cur_item.owner.id,function(rel_response){
                cur_item.friend_status=rel_response;
                //console.log('finished CHECKING relationship')
               // console.log(items)
            });
            
            //loop thru all existing answers
            if(cur_item.answers && cur_item.answers.length >0){
                cur_item.answers.forEach((cur_answer,index,array)=>{
                    this.checkRelationship(ref_user._id,cur_answer.responder_id,function(rel_response){
                        cur_answer.friend_status=rel_response;
                    });
                });
            }

            //fetch data for this person
            promise = this.getLatestOwnerDetails(cur_item.owner);
        }

        promise.then(function(response){
            //for trends
            if(response && (cur_item.post_type=="trending")){
                displayPic=(response.category_icon)?(response.category_icon):('images/trending.png');
                display_name=(response.category)?(response.category):('');
                res_id=(response._id)?((response._id).toString()):('');
                //check if the current user is following this trend
                //cur_item._id=trend id
                var user_trend_follows=ref_user.trend_follows //is array of followed trend ids by user
                for(var it=0,len=user_trend_follows.length;it <len;it++){
                    if(cur_item._id.indexOf(user_trend_follows[it]) !==-1){
                        trend_followed=true;
                        break;
                    }
                }
                cur_item.trend_followed=trend_followed;

            }else if(response){
                displayPic=(response.displayPic[0])?(response.displayPic[response.displayPic.length -1]):('uploads/avatar.png');
                status=(response.designation[0])?((response.designation[response.designation.length -1]).title):('');
                display_name=(response.displayName)?(response.displayName):('');
                res_id=(response._id)?((response._id).toString()):('');

                //check ownership of the secion post
                var req_user_id=(ref_user._id).toString();
                if(req_user_id ===res_id){
                    console.log('user is the owner of the post')
                    cur_item.post_owner=true;
                }
                
            }

            updated_obj={
                id:res_id,
                displayName:display_name,
                displayPic:displayPic,
                status:status
            };

            /* update owner info*/
            cur_item.owner=updated_obj;           


            processed_items++;
                if(processed_items==array.length){//iteration has ended
                    console.log('processing finished')
                    //console.log(items);
                    callback(items);
                }

            }).catch(function(err3){
                //console.log("Error occured while fetching owner/story data");
                //console.log(err3)
            });

        });
};

module.exports=methods;