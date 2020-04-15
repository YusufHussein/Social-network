var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var UserSchema = Schema({
    name: {
        type: String,
        requierd: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    image: String, 
    profession: String,
    location: String,
    dob: {
        type: Date,
        required: true
    },
    notifications: [{
        type: String
    }],
    blocked: { 
        type: Boolean,
        default: false
    },
    badpost: {
        type: Number,
        default: 0
    },
    following:[{
        type: mongoose.Types.ObjectId,
        ref: 'User',
    }]
});

module.exports = mongoose.model('User', UserSchema);
