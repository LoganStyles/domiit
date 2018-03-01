var mongoose = require('mongoose');
var user = require('../models/user');
// var user = require('../models/user');
var trend = require('../models/trend');

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
methods.getNotifications=function(user){

//get pending friends
var len=0;
user.getPendingFriends(user._id,function(err,pending){
    if(err)
        //console.log(err)

    if(pending){
        len=pending.length;
    }
    return len;

});
return len;
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

/*
perform some operations on the posts such as updating display pics,
checking if the post owner is a friend etc
.::chk type of post since some operations defer based on this
.
*/

methods.processPagePosts=function (items,ref_user,callback){
    console.log('processPagePosts')
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
            //check if already bookmarkd
            cur_item.bookmarked_post=this.checkBookmarks(ref_user,cur_item._id);
            promise = this.getLatestOwnerDetails(cur_item.owner);//fetch data for this person
        }

        //console.log(index)

        promise.then(function(response){
            //console.log(response);
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

                

                //check relationship
                cur_item.friend_status='not_friend';
                var req_user_id=(ref_user._id).toString();
                if(req_user_id ===res_id){
                    console.log('user is the owner of the post')
                    cur_item.post_owner=true;
                    cur_item.friend_status='friend';

                }else{
                    /*Perform other checks:
                    //check if there's pending friend request with owner
                    or if owner is already a friend*/

                    user.getFriendship(ref_user._id,response._id,function(err_res,rel_res){
                        if(err_res){
                            //console.log('err occured in chking relationship');
                            console.log(err_res);
                        }

                        if(rel_res){
                            console.log('results for relationship found');
                            // console.log(rel_res._id);
                            // console.log(rel_res.status);

                            if(rel_res.status=='Accepted'){
                                cur_item.friend_status='friend';
                            }else if(rel_res.status=='Pending'){
                                cur_item.friend_status='Pending';
                            }
                        }

                    });
                }
                

                // chk if current viewer is the owner
                // cur_item.friend_status='not_friend';
                // var req_user_id=(ref_user._id).toString();
                // //console.log('req_user_id '+req_user_id);
                // //console.log('res_id '+res_id);
                // if(req_user_id ===res_id){
                //     console.log('user is the owner of the post')
                //     cur_item.post_owner=true;
                //     cur_item.friend_status='friend';
                // }else{
                //     console.log('user is NOT the owner of the post')
                //     /*Perform other checks:
                //     //check if there's pending friend request with owner
                //     or if owner is already a friend*/
                //     user.find({$or:[{requester:ref_user._id,requested:response._id},
                //                         {requester:response._id,requested:ref_user._id}
                //                         ]},function(errChk,req_info){
                //                             if(errChk)console.log(errChk);

                //                             if(req_info){//data was found
                //                                 console.log(req_info);
                //                                 if(req_info.status=='Accepted'){
                //                                     cur_item.friend_status='friend';
                //                                 }else if(req_info.status=='Pending'){
                //                                     cur_item.friend_status='Pending';
                //                                 }
                //                             }

                //                         });
                    
                // } 
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
                // console.log('process inside:'+processed_items);
                if(processed_items==array.length){//iteration has ended
                    // res_items=items;
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