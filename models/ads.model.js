var mongoose = require('mongoose');
const Ad = mongoose.model(
    "Ad",
    mongoose.Schema({
        location: String,
        age: Number,
        isGreater: Boolean,
        image: [String],
        body: String
    })
);

module.exports = Ad;
