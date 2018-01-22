var mongoose = require('mongoose');
var user = require('../models/user');
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
//find pending notifications length
var notif_len=user.notifications.length;
var pending_friend_notifs=0;
    // var pending_notifs=0;
    for(var i=0;i<notif_len;i++){
        if((user.notifications[i].notif_type =="friends") &&(user.notifications[i].status =="pending"))
            pending_friend_notifs++;
    }
    return pending_friend_notifs;
};

/*
perform some operations on the posts such as updating display pics etc
.::chk type of post since some operations defer based on this
.
*/

methods.processPagePosts=function (items,user,callback){
    var promise,trend_followed=false,
    displayPic="",
    status="",
    display_name="",
    res_id="",
    processed_items=0;

    items.forEach((cur_item,index,array)=>{
        var updated_obj={};
        if(cur_item.post_type=="trending"){
            promise = this.getStoryDetails(cur_item);//fetch data for this story
        }else{
            promise = this.getLatestOwnerDetails(cur_item.owner);//fetch data for this person
        }

        promise.then(function(response){
            console.log(response);
            if(response && (cur_item.post_type=="trending")){
                displayPic=(response.pics[0])?('/uploads/'+response.pics[response.pics.length -1]):('/images/trending.png');
                display_name=(response.category)?(response.category):('');
                res_id=(response._id)?((response._id).toString()):('');
                //check if the current user is following this trend
                //cur_item._id=trend id
                var user_trend_follows=user.trend_follows //is array of followed trend ids by user
                for(var it=0,len=user_trend_follows.length;it <len;it++){
                    if(cur_item._id.indexOf(user_trend_follows[it]) !==-1){
                        trend_followed=true;
                        break;
                    }
                }
                cur_item.trend_followed=trend_followed;

            }else if(response){
                displayPic=(response.displayPic[0])?('/uploads/'+response.displayPic[response.displayPic.length -1]):('/uploads/avatar.png');
                status=(response.designation[0])?((response.designation[response.designation.length -1]).title):('');
                display_name=(response.displayName)?(response.displayName):('');
                res_id=(response._id)?((response._id).toString()):('');
            }

            updated_obj={
                id:res_id,
                displayName:display_name,
                displayPic:displayPic,
                status:status
            };

            /* update owner info*/
            cur_item.owner=updated_obj;
                // chk if current viewer is the owner
                var req_user_id=(user._id).toString();
                if(req_user_id ===res_id){
                    console.log('user is the owner of the post')
                    cur_item.post_owner=true;
                    cur_item.friend_exists=true;
                }else{
                    console.log('user is NOT the owner of the post')
                    /*Perform other checks*/
                    //check if there's pending friend request with owner*/


                    //chk if owner is a friend
                    /*get list of friends of current user,
                    chk if owner id is in the list:true:set friend_exists=true*/              
                    user.getFriends(function(err,friends){
                        if (err) throw err;
                        console.log('friends ',friends);
                        var f_len=friends.length;

                        if( f_len > 0){
                            //chk if post owner id is in the list
                            for(var i=0;i<f_len;i++){
                                if(res_id ==(friends._id).toString){
                                    cur_item.friend_exists=true;
                                }
                            }
                        }

                    });
            }  
            


            processed_items++;
                // console.log('process inside:'+processed_items);
                if(processed_items==array.length){//iteration has ended
                    // res_items=items;
                    console.log('processing finished')
                    console.log(items);
                    callback(items);
                }

            }).catch(function(err3){
                console.log("Error occured while fetching owner/story data");
                console.log(err3)
            });

        });
};

module.exports=methods;