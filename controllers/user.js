const User = require('../models/user');

function saveUser(req, res) {
    var user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.password = req.body.password;
    user.image = req.body.image;
    user.profession = req.body.profession;
    user.location = req.body.location;
    user.date = req.body.date;
    user.blocked = req.body.blocked;
    user.badpost = req.body.badpost;
    user.following = req.body.following;
    user.notifications = req.body.notifications;

}