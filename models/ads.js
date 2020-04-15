var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var AdsSchema = Schema({
    location: String,
    profession: String,
    age: Number,
    isgreater: Boolean,
    image: String,
    body: String
});

module.exports = mongoose.model('ads', AdsSchema);
