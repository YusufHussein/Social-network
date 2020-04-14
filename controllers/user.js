const User = require('../models/user');
const bcrypt = require('bcryptjs');
var jwt = require('../services/jwt');

function saveUser(req, res)
{
    var user = new User();
    user.name = req.body.name;
    user.email = req.body.email.toLowerCase();
    user.password = bcrypt.hashSync(req.body.password, 8);
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

function loginUser(req, res)
{
    var email = req.body.email;
    var password = req.body.password;
    User.findOne({email: email}, (err, user) => {
        if (err)
            return res.status(500).send({message: "Error logging in"});
        if (user) 
        {
            bcrypt.compare(password, user.password, (err, check) => {
                if (check) 
                {
                    if (req.body.gettoken)
                    {
                        return res.status(200).send({ token: jwt.createtoken(user)});
                    }
                    else
                    {
                        user.password = undefined; //hide password/ re-login
                        return res.status(200).send({user});
                    }
                } 
                else
                    return res.status(500).send({message: "Wrong email or password."});
            });
        } else
            return res.status(500).send({message: "Wrong email or password."});
    });
}
   