// var URL_ROOT="https://ancient-falls-19080.herokuapp.com";
var URL_ROOT="http://localhost:8000";

function newData(){
    $('#item_about_form').trigger('reset');
    $('#item_about_title').focus();
}


function stripUnderscore(itm) {
    var item_index = itm.indexOf("_");
    if (item_index > 0) {
        var stripped_item = itm.slice(0, item_index);
    }
    return stripped_item;
}

function resetFields(formid){    
    var success_field=formid+' .form_submission_success';
    var error_field=formid+' .form_submission_error';
    $(success_field).text("");
    $(error_field).text("");
}

function typeModalLoader(mode,type){
    /*mode:new,edit
    type:cat,story
    */
    switch (mode) {
        case 'new':
        console.log('inside mode new for '+type);
        $("#page_modal #page_form").trigger('reset');
        $("#page_modal #page_id").val(0);
        $("#page_modal #page_type").val(type);
        $("#page_modal #page_mode").val("insert");
        $("#page_modal #page_title").val("").attr('readonly',false);
        $("#page_modal #page_description").text("").attr('readonly',false);
        $("#page_modal #page_header").text('Add');
        $("#page_modal").modal({backdrop: false, keyboard: false});
        break;

        default:
        break;
    }
}

function modalLoader(type, mode,cat_type) {

    console.log('type: ' + type);
    console.log('mode: ' + mode);
    // console.log('cat_type: ' + cat_type);

    var form_action = "#" + type + "_action";
    var formid = "#" + type + "_form";
    var header = "#" + type + "_header";
    var submit_but = formid + " input[type='submit']";
    if(cat_type){
        var modal ="#"+type+"_"+cat_type+"_modal";
    }else{
        var modal ="#"+type+"_modal";
    }

    resetFields(formid);

    var itemid = "#" + type + "_id";
    console.log('form_action: ' + form_action);
    console.log('formid: ' + formid);
    console.log('submit_but: ' + submit_but);
    console.log('modal: ' + modal);

    switch (mode) {
        case 'new':
        console.log('inside mode new: ');
        $(itemid).val(0);
        $(formid).trigger('reset');
        $(form_action).val("insert");
        $(modal).modal({backdrop: false, keyboard: false});
        $(header).text('Add');

        if(type != 'notice'){
            var category_id="#"+type+"_modal "+"#"+type+"_category";
            console.log(category_id)
        //determine type & make ajax call
        //fetch categories
        var url=URL_ROOT+'/fetchCats';
        console.log(url);

        $.ajax({
            url:url,
            type:'GET',
            data:{'section':type},
            headers: {'X-My-App-Token': 'loganstyles'},
            success:function(response){
                console.log(response);
                if(response.success==true){
                    var res_cats=(response.cats);
                    var options="";
                    res_cats.forEach((curr_item,index,array)=>{
                        options+='<option value="'+curr_item.title+'">'+curr_item.title+'</option>';
                    });

                    $(category_id).html(options);

                }else{
                    console.log('response is false');                            
                }                        

            },
            error:function(xhr, status, err){
                console.log('error');
                console.log(xhr);
                console.log(status);
                console.log(err);
            }
        });
    }
    
    break;

    case 'edit':
    console.log('inside mode edit: ');                
    $(modal).modal({backdrop: false, keyboard: false});
    $(header).text('Edit');
    break;

    default:
    break;
}
}


function answerModalLoader(type, mode,cat_type) {

    console.log('type: ' + type);
    console.log('mode: ' + mode);
    var formid = "#" + type + "_form";
    var submit_but = formid + " input[type='submit']";
    if(cat_type){
        var modal ="#"+type+"_"+cat_type+"_modal";
    }else{
        var modal ="#"+type+"_modal";
    }


    var itemid = "#" + type + "_id";
    console.log('formid: ' + formid);
    console.log('submit_but: ' + submit_but);
    console.log('modal: ' + modal);

    switch (mode) {
        case 'new':
        console.log('inside mode new: ');
        $(itemid).val(0);
        $(formid).trigger('reset');
        $(modal).modal({backdrop: false, keyboard: false});
        break;

        default:
        break;
    }
}

function convertToSentencCase(text_data){
    var n = text_data.split(".");
    var vfinal="";

    for(i=0;i<n.length;i++){
        var spaceput="";
        var space_count=n[i].replace(/^(\s*).*$/,"$1").length;
        n[i]=n[i].replace(/^\s+/,"");
        var newstring =n[i].charAt(n[i]).toUpperCase()+n[i].slice(1);

        for(j=0;j<space_count;j++)
            spaceput=spaceput+" ";
        vfinal=vfinal+spaceput+newstring+".";
    }
    vfinal=vfinal.substring(0,vfinal.length - 1);
    return vfinal;
}