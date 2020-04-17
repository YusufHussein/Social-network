var mongoose = require('mongoose');
const Ad = mongoose.model(
    "Ad",
    mogoose.Schema({
        location: String,
        profession: String,
        age: Number,
        isgreater: Boolean,
        image: String,
        body: String
    })
);

module.exports = Ad;
