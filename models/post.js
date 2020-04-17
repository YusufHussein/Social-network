const mongoose = require('mongoose');
const User = require('./users');

const Post = mongoose.model(
    "Post",
    mongoose.Schema({
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
        default: Date.now,
        required: true
    },
    hidden: {
        type: Boolean,
        default: false
    },
    notify: Boolean
    })
);
module.exports = Post;
