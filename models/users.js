var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: String,
    image: String, 
    profession: String,
    location: String,
    date: Date,
    notifications: [{
        type: String
    }],
    blocked: Boolean,
    badpost: Number,
    following:[{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }]
});

module.exports = mongoose.model('User', UserSchema);
