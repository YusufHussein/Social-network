var mongoose = require('mongoose');
const Ad = mongoose.model(
    "Ad",
    mongoose.Schema({
        location: String,
        profession: String,
        age: Number,
        isgreater: Boolean,
        image: String,
        body: String
    })
);

module.exports = Ad;
