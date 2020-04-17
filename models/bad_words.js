var mongoose = require('mongoose');
const Bad_words = mongoose.model(
    "Bad_words",
    mogoose.Schema({
        word: {
            type: String,
            required: true,
            trim: true,
            unique: true
        }
    })
);

module.exports = Ad;
