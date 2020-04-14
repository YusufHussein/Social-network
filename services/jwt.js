var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'Secret_Key1-2-3.';

exports.createtoken = function (user) {
    var payload = 
    {
        sub: user._id,
        name: user.name,
        email: user.email,
        iat: moment().unix(),
        expired: moment().add(3, 'days').unix()
    };
    return jwt.encode(payload, secret);
};
