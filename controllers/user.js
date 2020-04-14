const User = require('../models/user');

function saveUser(req, res) {
    var user = new User();
    user.name = req.body.name;
    user.email = req.body.email.toLowerCase();
    user.password = req.body.password;
    user.image = req.body.image;
    user.profession = req.body.profession.toLowerCase();
    user.location = req.body.location;
    user.dob = req.body.dob;

    user.save((err, userStored) => {
        if (err)
            return res.status(500).send({message: "Error adding user to db."});
        else if (userStored)
            return res.status(200).send({user: userStored});
    });
    
}