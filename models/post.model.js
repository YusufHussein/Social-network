const mongoose = require('mongoose');
const User = require('./user.model');

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
                user: {
                    type: mongoose.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                text: {
                    type: String,
                    required: true
                },
                date: {
                    type: Date,
                    default: Date.now,
                    required: true
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
        notify: 
        {
            type: Boolean,
            default: false,
            required: true
        }
    })
);
module.exports = Post;
