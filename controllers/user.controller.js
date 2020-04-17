const db = require("../models");
const User = db.user;
const BadWord = db.bad_word;
const Post = db.post;
const bcrypt = require('bcryptjs');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');

exports.update = (req, res) =>
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
                return res.status(500).send({message: err.errmsg, error:err});
            return res.status(200).send({user: userUpdated});
        });
    });
}


exports.findAll = (req, res) => {
    //console.log("Test Find All")
    User.find()
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({message: err.errmsg, error:err});
      });
};

exports.findOne = (req, res) => {
  
};

exports.delete = (req, res) => {
  
};

exports.addBad = (req, res) =>
{
    const bWord = new BadWord({ word: req.body.word });
    bWord.save((err, bWord) =>
    {
        if (err)
        {
            res.status(500).send({ message: err });
            return;
        }
        bWord.save(err =>
        {
            if (err)
            {
                res.status(500).send({ message: err });
                return;
            }
            res.status(200).send({ message: `'${bWord.word}' was added as a bad word`});
        })
    })
}

exports.delBad = (req, res) =>
{
    BadWord.deleteOne({word: req.params.word},
        err =>
        {
            if (err)
                res.status(500).send({ message: err });
            res.status(200).send({ message: `'${req.params.word}' is no longer marked as bad word`});
        });
}

exports.addPost = (req, res) =>
{
    let bad = false;
    BadWord.find().then(words =>
    {
        const body = req.body.text;
        const badCondition = (word) => body.search(word.word)>=0;
        if(words.some(badCondition)) 
        {
            User.findOneAndUpdate({_id: req.userId},
                    {$inc: {bad_post_count: 1} }).exec();
            bad = true;
        }

        var post = new Post(
        {
            user: req.userId,
            text: req.body.text,
            image: req.body.image,
            notify: req.body.notify,
            hidden: bad
        })
        post.save((err, post) => 
        {
            if(err)
            {
                res.status(500).send({ message: err });
                return;
            }
            post.save(err =>
            {
                if(err)
                {
                    res.status(500).send({ message: err });
                    return;
                }
                res.status(200).send({message: `Post added successfully`});
            })
        })
    });
}

exports.getAllPosts = (req, res) =>
{
    Post.find()
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({message: err.errmsg, error:err});
      });
}