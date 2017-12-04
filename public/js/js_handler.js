
function modalLoader(type, mode,cat_type) {

    console.log('type: ' + type);
    console.log('mode: ' + mode);
    // console.log('cat_type: ' + cat_type);
        
        // var form_action = "#" + type + "_action";
        var formid = "#" + type + "_form";
        var header = "#" + type + "_header";
        var submit_but = formid + " input[type='submit']";
        if(cat_type){
            var modal ="#"+type+"_"+cat_type+"_modal";
        }else{
            var modal ="#"+type+"_modal";
        }
        

        var itemid = "#" + type + "_id";
        // console.log('form_action: ' + form_action);
        console.log('formid: ' + formid);
        console.log('submit_but: ' + submit_but);
        console.log('modal: ' + modal);

        switch (mode) {
            case 'new':
            console.log('inside mode new: ');
                $(itemid).val(0);
                $(formid).trigger('reset');
                // $(form_action).val("insert");
                $(modal).modal({backdrop: false, keyboard: false});
                $(header).text('Add');
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
    // console.log('cat_type: ' + cat_type);
        
        // var form_action = "#" + type + "_action";
        var formid = "#" + type + "_form";
        var submit_but = formid + " input[type='submit']";
        if(cat_type){
            var modal ="#"+type+"_"+cat_type+"_modal";
        }else{
            var modal ="#"+type+"_modal";
        }
        

        var itemid = "#" + type + "_id";
        // console.log('form_action: ' + form_action);
        console.log('formid: ' + formid);
        console.log('submit_but: ' + submit_but);
        console.log('modal: ' + modal);

        switch (mode) {
            case 'new':
            console.log('inside mode new: ');
                $(itemid).val(0);
                $(formid).trigger('reset');
                // $(form_action).val("insert");
                $(modal).modal({backdrop: false, keyboard: false});
                break;
            
            default:
                break;
        }
    }