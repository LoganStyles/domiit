var toolbarOptions = [
                ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
                ['blockquote', 'code-block'],

                [{ 'header': 1 }, { 'header': 2 }],               // custom button values
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
                [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                [{ 'direction': 'rtl' }],                         // text direction

                [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                [ 'link', 'image', 'video', 'formula' ],          // add's image support
                [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                [{ 'font': [] }],
                [{ 'align': [] }],

                ['clean']                                         // remove formatting button
            ];

             

            var quill = new Quill('#question_title', {
              modules: {
                toolbar: toolbarOptions
            },
              placeholder: 'Compose an epic...',
              theme: 'snow'  // or 'bubble'
            });

            var quill2 = new Quill('#question_info', {
              modules: {
                toolbar: toolbarOptions
              },
              placeholder: 'Compose an epic...',
              theme: 'snow'  // or 'bubble'
            });

            var quill3 = new Quill('#section_response_details', {
              modules: {
                toolbar: toolbarOptions
              },
              placeholder: 'Compose an epic...',
              theme: 'snow'  // or 'bubble'
            });

            var quill4 = new Quill('#notice_title', {
              modules: {
                toolbar: toolbarOptions
              },
              placeholder: 'Compose an epic...',
              theme: 'snow'  // or 'bubble'
            });

            var quill5 = new Quill('#article_title', {
              modules: {
                toolbar: toolbarOptions
              },
              placeholder: 'Compose an epic...',
              theme: 'snow'  // or 'bubble'
            });

            var quill6 = new Quill('#riddle_title', {
              modules: {
                toolbar: toolbarOptions
              },
              placeholder: 'Compose an epic...',
              theme: 'snow'  // or 'bubble'
            });

            var quill7 = new Quill('#pab_synopsis', {
              modules: {
                toolbar: toolbarOptions
              },
              placeholder: 'Compose an epic...',
              theme: 'snow'  // or 'bubble'
            });

            var quill8 = new Quill('#pab_about_author', {
              modules: {
                toolbar: toolbarOptions
              },
              placeholder: 'Compose an epic...',
              theme: 'snow'  // or 'bubble'
            });

            var quill9 = new Quill('#section_pab_synopsis', {
              modules: {
                toolbar: toolbarOptions
              },
              placeholder: 'Compose an epic...',
              theme: 'snow'  // or 'bubble'
            });

             var quill10 = new Quill('#section_pab_about_author', {
              modules: {
                toolbar: toolbarOptions
              },
              placeholder: 'Compose an epic...',
              theme: 'snow'  // or 'bubble'
            });
