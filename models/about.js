var mongoose = require('mongoose');

var aboutSchema = mongoose.Schema({
    id:String,
    type:{type:String,default:'About'},
    overview:{ title: String,body: String},
    who_we_are:{type:String,default:''},
    how:[{ title: String,body: String}],
    additional:[{ title: String,body: String}],
    date_created: { type: Date, default: Date.now },
    date_modified: { type: Date, default: Date.now }   
});

var About = mongoose.model('About', aboutSchema);
module.exports = About;