const User = require('../models/user');
const bcrypt = require('bcryptjs');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');

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
            return res.status(500).send({message: "Error adding user to db!"});
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
            return res.status(500).send({message: "Error logging in!"});
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
                    return res.status(500).send({message: "Wrong email or password!"});
            });
        }
        else
            return res.status(500).send({message: "Email not registered!"});
    });
}

function updateUser(req, res)
{
    delete req.body.password;
    if (req.params.id !== req.user.sub)
        return res.status(403).send({message: "You do not have permissions to modify this account!"});

    User.find({email: req.body.email.toLowerCase()}).exec((err, users) => {
        var user_isset = false;
        users.forEach((users) => {
            if (users._id != req.params.id)
                user_isset = true;
        });
        if (user_isset)
            return res.status(403).send({message: "This email already exists!"});

        User.findByIdAndUpdate(req.params.id, req.body, {new : true}, (err, userUpdated) => {
            if (!userUpdated)
                return res.status(404).send({message: "User Not Found!"});
            if (err)
                return res.status(500).send({message: "Error processing request!"});
            return res.status(200).send({user: userUpdated});
        });
    });
}

function getUsers(req, res) {
    var identity_user_id = req.user.sub;
    var itemsPerPage = 10;
    var page = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    User.find().sort('_id').paginate(page, itemsPerPage, (err, users, total) => {
        if (!users)
            return res.status(404).send({message: "Users Not Found."});
        if (err)
            return res.status(500).send({message: "Request Error."});

        followUserIds(identity_user_id).then((value) => {
            return res.status(200).send({
                users,
                user_following: value.following,
                user_follow_me: value.followed,
                total,
                pages: Math.ceil(total / itemsPerPage)
            });
        });
    });
}
