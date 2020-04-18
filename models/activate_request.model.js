var mongoose = require('mongoose');
const active_request = mongoose.model(
    "active_request",
    mongoose.Schema({
        user: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            required: true
        },
        message: 
        {
            type: String,
            required: true
        }
    })
);

module.exports = active_request;
