const mongoose = require('mongoose');
const User = require('./users');
var Schema = mongoose.Schema;
var PostSchema = Schema({
    user: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    likes: [{
        type: mongoose.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        comment: {
            user: {
                type: mongoose.Types.ObjectId,
                ref: 'User',
                required: true
            },
            text: {
                type: String,
                required: true
            }
        }

    }],
    text: String,
    image: String,
    date: {
        type: Date,
        default: Date.now
    },
    hidden: Boolean,
    notify: Boolean
});

module.exports = mongoose.model('Post', PostSchema);
