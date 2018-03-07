var total_messages = 5;
var delay_amount = 1000;
var fade_speed = 200;
var socket = io();
var URL_ROOT="https://ancient-falls-19080.herokuapp.com";
// var URL_ROOT="http://localhost:8000";

// Connect to Socket.io
socket.connect(URL_ROOT);

var oldest_post;
console.log('inside sockets');

socket.on('new_questions',function(json){

	//post on dashboard
	oldest_post = $('.dashboard_page .posted').last();
	//get count of dashboard posts before appending another
	var count = $('.dashboard_page .posted').length;
	console.log('total current dashboard posts is '+count);
	
	//if there are more than 'total messages', start removing from the bottom
	if(count >= total_messages){
		//delay for fading elements in and out
		delay_amount = fade_speed +1;
		//remove the post from the DOM
		console.log('removing post');
		removePost(oldest_post);
	}
	displayPost('.dashboard_page',json);

	//post on section
	oldest_post = $('.question .posted').last();
	//get count of dashboard posts before appending another
	var count = $('.question .posted').length;
	console.log('total current question posts is '+count);
	
	//if there are more than 'total messages', start removing from the bottom
	if(count >= total_messages){
		//delay for fading elements in and out
		delay_amount = fade_speed +1;
		//remove the post from the DOM
		console.log('removing post');
		removePost(oldest_post);
	}
	displayPost('.question',json);

});

socket.on('new_articles',function(json){

	//post on dashboard
	oldest_post = $('.dashboard_page .posted').last();
	//get count of dashboard posts before appending another
	var count = $('.dashboard_page .posted').length;
	console.log('total current dashboard posts is '+count);
	
	//if there are more than 'total messages', start removing from the bottom
	if(count >= total_messages){
		//delay for fading elements in and out
		delay_amount = fade_speed +1;
		//remove the post from the DOM
		console.log('removing post');
		removePost(oldest_post);
	}
	displayPost('.dashboard_page',json);

	//post on section
	oldest_post = $('.article .posted').last();
	//get count of dashboard posts before appending another
	var count = $('.article .posted').length;
	console.log('total current article posts is '+count);
	
	//if there are more than 'total messages', start removing from the bottom
	if(count >= total_messages){
		//delay for fading elements in and out
		delay_amount = fade_speed +1;
		//remove the post from the DOM
		console.log('removing post');
		removePost(oldest_post);
	}
	displayPost('.article',json);

});

socket.on('new_notices',function(json){

	//post on dashboard
	oldest_post = $('.dashboard_page .posted').last();
	//get count of dashboard posts before appending another
	var count = $('.dashboard_page .posted').length;
	console.log('total current dashboard posts is '+count);
	
	//if there are more than 'total messages', start removing from the bottom
	if(count >= total_messages){
		//delay for fading elements in and out
		delay_amount = fade_speed +1;
		//remove the post from the DOM
		console.log('removing post');
		removePost(oldest_post);
	}
	displayPost('.dashboard_page',json);

	//post on section
	oldest_post = $('.notice .posted').last();
	//get count of dashboard posts before appending another
	var count = $('.notice .posted').length;
	console.log('total current notice posts is '+count);
	
	//if there are more than 'total messages', start removing from the bottom
	if(count >= total_messages){
		//delay for fading elements in and out
		delay_amount = fade_speed +1;
		//remove the post from the DOM
		console.log('removing post');
		removePost(oldest_post);
	}
	displayPost('.notice',json);

});

socket.on('new_riddles',function(json){

	//post on dashboard
	oldest_post = $('.dashboard_page .posted').last();
	//get count of dashboard posts before appending another
	var count = $('.dashboard_page .posted').length;
	console.log('total current dashboard posts is '+count);
	
	//if there are more than 'total messages', start removing from the bottom
	if(count >= total_messages){
		//delay for fading elements in and out
		delay_amount = fade_speed +1;
		//remove the post from the DOM
		console.log('removing post');
		removePost(oldest_post);
	}
	displayPost('.dashboard_page',json);

	//post on section
	oldest_post = $('.riddle .posted').last();
	//get count of dashboard posts before appending another
	var count = $('.riddle .posted').length;
	console.log('total current riddle posts is '+count);
	
	//if there are more than 'total messages', start removing from the bottom
	if(count >= total_messages){
		//delay for fading elements in and out
		delay_amount = fade_speed +1;
		//remove the post from the DOM
		console.log('removing post');
		removePost(oldest_post);
	}
	displayPost('.riddle',json);

});

socket.on('new_pabs',function(json){

	//post on dashboard
	oldest_post = $('.dashboard_page .posted').last();
	//get count of dashboard posts before appending another
	var count = $('.dashboard_page .posted').length;
	console.log('total current dashboard posts is '+count);
	
	//if there are more than 'total messages', start removing from the bottom
	if(count >= total_messages){
		//delay for fading elements in and out
		delay_amount = fade_speed +1;
		//remove the post from the DOM
		console.log('removing post');
		removePost(oldest_post);
	}
	displayPost('.dashboard_page',json);

	//post on section
	oldest_post = $('.pab .posted').last();
	//get count of dashboard posts before appending another
	var count = $('.pab .posted').length;
	console.log('total current pab posts is '+count);
	
	//if there are more than 'total messages', start removing from the bottom
	if(count >= total_messages){
		//delay for fading elements in and out
		delay_amount = fade_speed +1;
		//remove the post from the DOM
		console.log('removing post');
		removePost(oldest_post);
	}
	displayPost('.pab',json);

});

//remove oldest post from the DOM
function removePost(post){
	//fade post out
	post.animate({opacity:0},fade_speed,function(){
		//remove post from DOM
		post.remove();
	});
}

//add new post to the DOM
function addPost(selected_class,content){
	//constuct HTML to append
	$(selected_class).prepend($(content));//append html
	//fade post in
	// $('.question_all_post_area').prepend($(post_type));//append html
	$('.posted').first().animate({opacity:1},fade_speed,function(){
		//animation is complete
		console.log('animation is complete');
	});
}

function displayPost(selected_class,json){
	var parsed = JSON.parse(json);
	//create content
                       
	var post_content='<div class="portlet light posted">';
		post_content+='<input type="hidden" id="post_id" value="'+parsed._id+'">';
		post_content+='<input type="hidden" id="post_type" value="'+parsed.post_type+'">';
		post_content+='<input type="hidden" id="post_owner_id" value="'+parsed.owner.id+'">';
		post_content+='<div class="portlet-title"';
		if(parsed.notice_status){
			post_content+='style="background-color:#5F84CF;"';
		}
		post_content+= '><div class="caption caption-md">';
		post_content+='<span ';

		if(parsed.notice_status){
			post_content+='style="color:  #fff;"';
		}

		post_content+='class="caption-subject  bold post_box_name">'+parsed.post_type+'&nbsp;</span>';
		if(parsed.category){
			post_content+='<span class="caption-helper post_category grey_cats left_border" ';
			if(parsed.notice_status){
				post_content+='style="color: #fff !important;"';
			}
			post_content+=' >'+parsed.category+'&nbsp;</span>';
		}

		if(!parsed.notice_status){
			if(parsed.sub_cat1){
			post_content+='<span class="caption-helper post_sub_cat1 grey_cats left_border">'+parsed.sub_cat1+'&nbsp;</span>';
			}
			if(parsed.sub_cat2){
				post_content+='<span class="caption-helper post_sub_cat2 grey_cats left_border">'+parsed.sub_cat2+'&nbsp;</span>';
			}
		}	
		
		post_content+='</div></div>';
		post_content+='<div class="portlet-body" style="padding-top: 0px;">';
		post_content+='<div class="" data-always-visible="1" data-rail-visible1="0" data-handle-color="#D7DCE2">';
		post_content+='<div class="general-item-list">';
		post_content+='<div class="item"><div class="item-head">';
		post_content+='<div style="width: 100%;"><!--main block-->';
		post_content+='<div class="posts_partition"><!--1st partition-->';
		post_content+='<div style="width: 100%;">';
		if(!parsed.trend_status){//if not trend post attach profile link
			post_content+='<a href="'+URL_ROOT+'/profile/'+parsed.owner.id+'">';
		}
		post_content+='<div class="section_posts_avatar">';
		post_content+='<img class="icon_size_50 img-circle" src="'+URL_ROOT+'/'+parsed.owner.displayPic+'">';
		post_content+='</div>';
		if(!parsed.trend_status){
			post_content+='</a>';
		}
		post_content+='<div class="section_posts_text">';
		post_content+='<div>';
		if(parsed.trend_status){
			post_content+='<a style="font-weight: 600;" href="javascript:;" class="item-name">'+parsed.owner.displayName+'</a>';
		}else{
			post_content+='<a style="font-weight: 600;" href="'+URL_ROOT+'/profile/'+parsed.owner.id+'" class="item-name">'+parsed.owner.displayName+'</a>';
		}
		post_content+='</div>';
		if(parsed.owner.status){
			if(!parsed.trend_status){//if not trend post atach profile
				post_content+='<a href="'+URL_ROOT+'/profile/'+parsed.owner.id+'">';
			}
			post_content+='<div class="post_item_body_status">'+parsed.owner.status+'</div>';

			if(!parsed.trend_status){
				post_content+='</a>';
			}
		}
				
		post_content+='</div><div class="clearfix"></div></div></div>';
		post_content+='<div class="posts_partition_middle"><!--2nd partition-->';
		post_content+='<span>';
		if(parsed.trend_status){
			if(parsed.trend_followed){
				post_content+='<img class="icon_size_50 " src="'+URL_ROOT+'/images/filler.png">';
			}else{
				post_content+='<a href="javascript:;" class="btn blue" style="padding: 2px;"><i class="fa fa-plus"></i>&nbsp; Follow</a>';
			}

		}else{//other post:questio etc-->
			if(parsed.friend_status=='friend'){
				post_content+='<img class="icon_size_50 " src="'+URL_ROOT+'/images/filler.png">';
			}else{
				if(parsed.friend_status=='Pending'){
					post_content+='<span class="post_box_name">Pending Friend Request</span>';
				}else{
					post_content+='<img class="icon_size_20 send_friend_req " src="'+URL_ROOT+'/images/add_person.png">';
				}
			}
		}
		post_content+='</span></div>';
		post_content+='<div class="posts_partition"><!--3rd partition-->';
		post_content+='<div class="pull-right">';
		var item_date=moment(parsed.post_date).fromNow();
		post_content+='<div class="fromnow">'+item_date+'</div>';
		post_content+='<div class="clearfix"></div>';
		post_content+='<div class="post_actions_button_left">';
		//post_content+='<img class="icon_size_20" src="'+URL_ROOT+'/images/mask.png">';
		post_content+='</div>';
		if(parsed.post_owner){
			post_content+='<div class="actions post_actions_button">';
			post_content+='<div class="btn-group"><span class="item-status cursor_dropper" data-toggle="dropdown">';
			post_content+='<i class="fa fa-ellipsis-v"></i> </span>';
			post_content+='<ul class="dropdown-menu pull-right">';
			post_content+='<li class="edit_section_item">';
			post_content+='<a href="#"><i class="fa fa-pencil"></i> Edit </a></li>';
			post_content+='<li class="delete_section_item"><a href="#">';
			post_content+='<i class="fa fa-trash-o"></i> Delete </a></li>';
			if(parsed.question_status){
				post_content+='<li><a href="javascript:;">';
				post_content+='<i class="fa fa-ban"></i> Request for answer </a>';
				post_content+='</li>';
			}

			if(parsed.art_status){
				post_content+='<li><a href="javascript:;">';
				post_content+='<i class="fa fa-ban"></i> Request for review </a>';
				post_content+='</li>';
			}

			if(parsed.riddle_status){
				post_content+='<li><a href="javascript:;">';
				post_content+='<i class="fa fa-ban"></i> Request for solution </a>';
				post_content+='</li>';
			}

			if(parsed.notice_status){
				post_content+='<li><a href="javascript:;">';
				post_content+='<i class="fa fa-ban"></i> Share </a>';
				post_content+='</li>';
			}
			
			
			post_content+='</ul></div></div>';
                                
            }else{
            post_content+='<div class="actions post_actions_button">';
			post_content+='<div class="btn-group">';
			post_content+='<span class="item-status cursor_dropper" data-toggle="dropdown">';
			post_content+='<i class="fa fa-ellipsis-v"></i></span>';
            post_content+='<ul class="dropdown-menu pull-right">';
            post_content+='<li class="follow_section_item">';
            post_content+='<a href="#">';
            post_content+='<i class="fa fa-plus"></i> Follow </a>';
            post_content+=' </li>';
            if(!parsed.bookmarked_post){

            	post_content+='<li class="bookmark_section_item">';
	            post_content+='<a href="#">';
	            post_content+='<i class="fa fa-bookmark"></i> Bookmark </a>';
	            post_content+='</li>';

            }

            post_content+='<li class="">';
            post_content+='<a href="javascript:;">';
            post_content+='<img class="icon_size_20" src="'+URL_ROOT+'/images/mask.png"></i> Mask </a>';            
            post_content+='</li>';

            post_content+='<li>';
            post_content+='<a href="javascript:;">';
            post_content+='<i class="fa fa-ban"></i> Report Abuse </a>';
            post_content+='</li></ul></div></div>';                                
            post_content+='';
            }
		post_content+='</div><!--end float right--><div class="clearfix"></div></div><div class="clearfix"></div></div>';
		post_content+='</div>';
		if(parsed.pab_status){
			/*chk for books*/
			post_content+='<div class="item-body"><div style="width: 100%; color: #000;">';
			post_content+='<div class="posts_pab_itemimage">';
			if(parsed.pics){
				post_content+='<img class="img-responsive" src="'+URL_ROOT+'/'+parsed.pics[0]+'">';
			}else{
				post_content+='<img class="img-responsive" src="'+URL_ROOT+'/images/default_img.png">';
			}

		post_content+='</div>';
		post_content+='<div class="posts_pab_itemright"><div>';
		if(parsed.body){
			post_content+='<div class="posts_pab_itemright_row">';
			post_content+='<div class="posts_pab_itemtitle">Title:</div>';
			post_content+='<div class="posts_pab_itemdetails pab_ititle">'+parsed.body+'</div></div>';

		}
		if(parsed.author){
			post_content+='<div class="posts_pab_itemright_row">';
			post_content+='<div class="posts_pab_itemtitle">Author:</div>';
			post_content+='<div class="posts_pab_itemdetails pab_iauthor">'+parsed.author+'</div></div>';
		}
		if(parsed.pages){
			post_content+='<div class="posts_pab_itemright_row">';
			post_content+='<div class="posts_pab_itemtitle">Pages:</div>';
			post_content+='<div class="posts_pab_itemdetails pab_ipages">'+parsed.pages+'</div></div>';
		}
		if(parsed.amount){
			post_content+='<div class="posts_pab_itemright_row">';
			post_content+='<div class="posts_pab_itemtitle">Price:</div>';
			post_content+='<div class="posts_pab_itemdetails pab_iamount">N'+parsed.amount+'</div></div>';
		}
		if(parsed.isbn){
			post_content+='<div class="posts_pab_itemright_row">';
			post_content+='<div class="posts_pab_itemtitle">ISBN:</div>';
			post_content+='<div class="posts_pab_itemdetails pab_iISBN">N'+parsed.isbn+'</div></div>';
		}
		if(parsed.publishers){
			post_content+='<div class="posts_pab_itemright_row">';
			post_content+='<div class="posts_pab_itemtitle">Publisher:</div>';
			post_content+='<div class="posts_pab_itemdetails pab_ipublishers">'+parsed.publishers+'</div></div>';
		}
		if(parsed.bookshop){
			post_content+='<div class="posts_pab_itemright_row">';
			post_content+='<div class="posts_pab_itemtitle">Bookshop:</div>';
			post_content+='<div class="posts_pab_itemdetails pab_ibookshop">'+parsed.bookshop+'</div></div>';
		}
		if(parsed.url){
			post_content+='<div class="posts_pab_itemright_row">';
			post_content+='<div class="posts_pab_itemtitle">Url:</div>';
			post_content+='<div class="posts_pab_itemdetails pab_iurl">'+parsed.url+'</div></div>';
		}
		post_content+='</div></div><div class="clearfix"></div></div>';
		post_content+='<div style="width: 100%; color: #000;padding: 2%;">';
		post_content+='<div class=""><ul class="nav nav-tabs navbar-right">';
		var content_id=count++;
		post_content+='<li class="active"><a data-toggle="tab" href="#synopsis'+content_id+'">SYNOPSIS</a></li>';
		post_content+='<li><a data-toggle="tab" href="#about_author'+content_id+'">ABOUT THE AUTHOR</a></li>';
		post_content+='</ul><div class="clearfix"></div><div class="tab-content">';
		post_content+='<div id="synopsis'+content_id+'" class="tab-pane fade in active">';
		post_content+='<p class="pab_isynopsis">'+parsed.synopsis+'</p>';
		post_content+='</div><div id="about_author'+content_id+'" class="tab-pane fade">';
		post_content+='<p class="pab_iabout_author">'+parsed.about_author+'</p></div></div></div></div></div>';
	}else{
		/*else : chk for books*/

		/*start else part of books by chking for notices*/
		 
		if(parsed.notice_status){
			post_content+='<div class="item-body">';
			post_content+='<div class="post_item post_item_topic" style="text-align: center;text-transform: uppercase;">';
			post_content+=parsed.sub_cat1+'</div><hr class="short_length">';
			if(parsed.topic){
				post_content+='<div class="post_item post_item_topic">'+parsed.topic+'</div>';
			}

			if(parsed.pics.length >0){
				post_content+='<div style="margin-bottom: 3%;">';
				post_content+='<img class="img-responsive" src="'+URL_ROOT+'/'+parsed.pics[0]+'"></div>';
			}
			post_content+='<div class="post_item post_item_body">';
			post_content+=parsed.body;
			post_content+='</div></div> <br>';

		}else{/*start other posts:quests,arts,ridds,trends*/

			post_content+='<div class="item-body">';
			
			if(parsed.topic){
				post_content+='<div class="post_item post_item_topic">'+parsed.topic+'</div>';
			}
			if(parsed.pics.length >0){
				post_content+='<div style="margin-bottom: 3%;">';
				post_content+='<img class="img-responsive" src="'+URL_ROOT+'/'+parsed.pics[0]+'"></div>';
			}
			if(parsed.art_status){
				post_content+='<hr class="short_length"><div class="post_item post_item_body">';
			}else{
				post_content+='<div class="post_item post_item_topic">';
			}
			post_content+=parsed.body;
			post_content+='</div>';
			if(parsed.description){
				post_content+='<hr class="short_length"><div class="post_item post_item_more_info">'+parsed.description+'</div>';
			}
			post_content+='</div> <br>';/*end other posts:quests,arts,ridds,trends*/
		}
		
            
	} /*end if :chk for books-*/

	post_content+='<div style="width: 100%;"><!--main block-->';
	post_content+='<hr class="long_length"><div class="pull-left">';
	if(parsed.art_status && parsed.attachemnt){
		//if page is article, chek for attachemnt
		post_content+='<input type="hidden" class="download_input_field" value="'+parsed.attachemnt+'">';
		post_content+='<a type="button" class="btn dark btn-outline sbold uppercase download_button">';
		post_content+='<i class="fa fa-cloud-download"></i>&nbsp;Download</a>';
        }
        post_content+='</div>';

    if(parsed.notice_status){//partition_right : chking for notices
        post_content+='<div class="posts_partition_right"><!--3rd partition-->';
        post_content+='<a class="btn btn-link "><span class="grey_button">';
        post_content+='<span class="social_value">'+parsed.views+'</span>&nbsp;Views';
        post_content+='</span></a></div>';

    }else{//else partition_right : display for other options

    	post_content+='<div class="posts_partition_right"><!--3rd partition-->';
	    post_content+='<a class="btn btn-link post_likes">';
	    post_content+='<span class="grey_button"><span class="social_value ">'+parsed.likes+'&nbsp;</span>';
	    post_content+='<i class="fa fa-heart-o"></i>&nbsp;Likes</span></a>';

	    post_content+='<a class="btn btn-link "><span class="grey_button">';

	    if(parsed.question_status){
	    	post_content+='<span class="social_value">'+parsed.answers_len+'&nbsp;</span>';
	    	post_content+='<img class="icon_size_20" src="'+URL_ROOT+'/images/comments.png">&nbsp;Answers';            
	    }
	    if(parsed.pab_status){
	    	post_content+='<span class="social_value">'+parsed.comments_len+'&nbsp;</span>';
	        post_content+='<img class="icon_size_20" src="'+URL_ROOT+'/images/comments.png">&nbsp;Comments';
	    }
	    if(parsed.trend_status){
	    	post_content+='<span class="social_value">'+parsed.comments_len+'&nbsp;</span>';
	        post_content+='<img class="icon_size_20" src="'+URL_ROOT+'/images/comments.png">&nbsp;Comments';
	    }
		if(parsed.art_status){
			post_content+='<span class="social_value">'+parsed.answers_len+'&nbsp;</span>';
			post_content+='<img alt="" class="icon_size_15" src="'+URL_ROOT+'/images/reviews.png">&nbsp;Reviews';
		}
		if(parsed.riddle_status){
			post_content+='<span class="social_value">'+parsed.answers_len+'&nbsp;</span>';
			post_content+='<img class="icon_size_20" src="'+URL_ROOT+'/images/comments.png">Solution';
		}

		post_content+='</span></a><a class="btn btn-link post_shares">';
		post_content+='<span class="item-label grey_button">';
		post_content+='<span class="social_value">'+parsed.shares+'&nbsp;</span>';
		post_content+='<i class="fa fa-share-alt"></i>&nbsp;Shares</span></a></div>';

    }

    
	
	post_content+='<div class="clearfix"></div></div><hr class="long_length">';
	post_content+='</div></div></div></div>';
	post_content+='<!-- END PORTLET -->';

	if(parsed.notice_status){//partition_right : chking for notices
		post_content+='<div class="task-footer" style="">';
		if(parsed.sub_cat2=='notification'){// chking for notification type
			post_content+='<div class="btn-arrow-link "><a class="btn btn-link post_likes">';
			post_content+='<span class="grey_button">';
			post_content+='<span class="social_value ">'+parsed.likes+'</span>';
			post_content+='<i class="fa fa-heart-o"></i>&nbsp;Likes</span></a>';
			post_content+='<a class="btn btn-link "><span class="grey_button">';
			post_content+='<span class="social_value">'+parsed.comments_len+'</span>';
			post_content+='<img class="icon_size_20" src="'+URL_ROOT+'/images/comments.png">Comments</span></a>';
			post_content+='<a class="btn btn-link post_shares"><span class="item-label grey_button">';
			post_content+='<span class="social_value">'+parsed.shares+'</span>';
			post_content+='<i class="fa fa-share-alt"></i>&nbsp;Shares</span></a></div>';
		}else{
			post_content+='<div class="btn-arrow-link "><a class="btn btn-link post_likes">';
			post_content+='<span class="grey_button"><span class="social_value ">'+parsed.attending+'</span>';
			post_content+='<img class="icon_size_20" src="'+URL_ROOT+'/images/attending.png">&nbsp;Attending</span></a>';
			post_content+='<a class="btn btn-link "><span class="grey_button">';
			post_content+='<span class="social_value">'+parsed.not_attending+'</span>';
			post_content+='<img class="icon_size_20" src="'+URL_ROOT+'/images/not_attending.png">&nbsp;Not Attending</span></a>';
			post_content+='<a class="btn btn-link "><span class="grey_button">';
			post_content+='<span class="social_value">'+parsed.comments_len+'</span>';
			post_content+='<img class="icon_size_20" src="'+URL_ROOT+'/images/comments.png">Comments</span></a></div>';
		}
		post_content+='</div>';                                              
	}else{//else task-footer : chking for pab

		post_content+='<div class="task-footer" style="">';
		post_content+='<div class="btn-arrow-link ">';
		if(!parsed.pab_status){
			post_content+='<a class=" sbold grey_button response_button">';
			post_content+='<i class="fa fa-edit"></i>&nbsp;Write your '+parsed.page_response+'</a> ';
		}
		post_content+='</div></div>';

	}

	

	post_content+='<div class="clearfix"></div></div';
        
    post_content+='</div><!--end post-->';


		//delay adding post to allow fading of deleted array
		setTimeout(function(){
			addPost(selected_class,post_content);},delay_amount);
}




	/*handles responses for questions,articles etc:updates relevant pages in real time*/
	socket.on('responded',function(json){

		console.log('a new response has been posted');
		var parsed = JSON.parse(json);
		var response_content="";
		console.log('item_id '+parsed.item_id);
	//find the right question
	$('.post_responses .posted').each(function(key,value){
		var post_id=$(this).find('#post_id').val();
		console.log('post_id '+post_id);
		if(post_id ===parsed.item_id){
			console.log('found..begining process');
			// response_content+='<div class="portlet-body response_area">';
			response_content+='<div class="" data-always-visible="1" data-rail-visible1="0" data-handle-color="#D7DCE2">';
			response_content+='<div class="general-item-list">';
			response_content+='<div class="item"><div class="item-head"><div style="width: 100%;">';
			response_content+='<div class="posts_partition"><!--1st partition-->';
			response_content+='<span> <img class="item-pic" src="'+URL_ROOT+'/'+parsed.responderDisplayPic+'">';
			response_content+='<a style="color: #000;" href="" class="item-name primary-link">'+parsed.responderDisplayName+'</a>';
			response_content+='<span>'+parsed.responderStatus+'</span> </span></div>';
			response_content+='<div class="posts_partition_middle"><!--2nd partition-->';
			response_content+='<span style=""><img src="'+URL_ROOT+'/uploads/add_person.png"> </span></div>';
			response_content+='<div class="posts_partition"><!--3rd partition-->';
			response_content+='<div style="margin-left: 60%;">';
			response_content+='<div style="color: #ccc;">'+moment(parsed.post_date).fromNow()+'</div>';
			response_content+='<div style="display: inline-block;margin-right: 20%;">';
			response_content+='<img src="'+URL_ROOT+'/uploads/group.png"></div>';
			response_content+='<div class="actions" style="display: inline-block;"><div class="btn-group">';
			response_content+='<span class="item-status" data-toggle="dropdown" style="cursor: pointer;">';
			response_content+='<i class="fa fa-ellipsis-v"></i></span>';
			response_content+='<ul class="dropdown-menu pull-right"><li>';
			response_content+=' <a href="javascript:;"><i class="fa fa-pencil"></i> Edit </a></li>';
			response_content+='<li><a href="javascript:;"><i class="fa fa-trash-o"></i> Delete </a></li>';
			response_content+='<li><a href="javascript:;"><i class="fa fa-ban"></i> Share </a></li>';
			response_content+='<li><a href="javascript:;"> Request Answer </a></li></ul></div></div></div><!--end float right-->';
			response_content+='<div class="clearfix"></div></div><div class="clearfix"></div></div></div>';
			response_content+='<div class="item-body">';
			if(parsed.pics.length >0){
				response_content+='<div style="margin-bottom: 3%;">';
				response_content+='<img class="img-responsive" src="'+URL_ROOT+'/'+parsed.pics[0]+'"></div>';
			}

			response_content+='<div style="color: #000;" class="post_response">'+parsed.body+'</div></div>';
			response_content+='<div style="width: 100%;"><!--main block-->';
			response_content+='<div class="posts_partition_right"><!--3rd partition-->';
			response_content+='<a class="btn btn-link " style="color: #000;font-size: 0.8em;">';
			response_content+='<span>';
			response_content+='<span class="social_value">'+parsed.views+'</span>&nbsp;&nbsp;Views</span></a>&nbsp;|';
			response_content+='<a class="btn btn-link post_shares" style="color: #000;font-size: 0.8em;color: orange">About this post</a></div>';
			response_content+='<div class="clearfix"></div></div><hr></div></div></div>';

			//console.log('ABOUT TO DISPLAY THE RESPONSE');
			var response_area=$(this).find('.response_area');
			//console.log('response_area '+response_area)
			// $(response_area).html("");
			$(response_area).html(response_content);

			//$(".post_responses").prepend("SOMETHING CAME OUT HERE");

			//$(".post_responses").prepend($(this));

			//console.log('THE RESULTANT POST')

			//console.log($(this));

			return false;
		}
	})
});
