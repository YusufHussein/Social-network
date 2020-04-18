const db = require("../models");
const User = db.user;
const BadWord = db.bad_word;
const Post = db.post;
const Adv = db.ad;
const ActiveRequest = db.active_request;
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


exports.findAll = (req, res) => 
{
    User.find()
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({message: err.errmsg, error:err});
      });
};

exports.findOne = (req, res) => 
{
  User.findOne({_id: req.params.id})
  .then(data =>
    {
        res.send(data);
    })
    .catch(err => {
        res.status(500).send({message: err.errmsg, error:err});
    });
};

/* exports.delete = (req, res) => {
  
}; */

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
            Post.find({hidden: false}).then(posts =>
            {
                posts.forEach((post) =>
                {
                    post_body = post.text;
                    if(typeof post_body === 'string')
                    {
                        if(post_body.search(req.body.word)>=0)
                        {
                            Post.findOneAndUpdate({_id: post._id}, 
                                {$set: {hidden: true}}).exec(); 
                            
                            User.findOneAndUpdate({_id: post.user},
                                {$inc: {bad_post_count: 1} }).exec();
                            User.findOne({_id: post.user}, {bad_post_count: 1},(err, result)=>
                            {
                                if(result.bad_post_count >= 20)
                                    User.findOneAndUpdate({_id: post.user},
                                        {$set: {blocked: true} }).exec();
                            });
                        }
                    }
                });
                res.status(200).send({ message: `'${bWord.word}' was added as a bad word`});
            });
        });
    });
}

exports.delBad = (req, res) =>
{
    BadWord.deleteOne({word: req.params.word},
        err =>
        {
            if (err)
                res.status(500).send({ message: err });
            res.status(200).send({ message: `'${req.params.word}' is no longer marked as bad word (Future posts only)`});
        });
}

exports.addPost = (req, res) =>
{
    let bad = false;
    BadWord.find().then(words =>
    {
        const body = req.body.text;
        const badCondition = (word) => body.search(word.word) >= 0;
        if(words.some(badCondition)) 
        {
            User.findOneAndUpdate({_id: req.userId},
                    {$inc: {bad_post_count: 1} }).exec();
            User.findOne({_id: req.userId}, {bad_post_count: 1},(err, result)=>
            {
                if(parseInt(result.bad_post_count) >= 20)
                    User.findOneAndUpdate({_id: post.user},
                        {$set: {blocked: true} }).exec();
            }).exec();
            bad = true;
        }

        var post = new Post(
        {
            user: req.userId,
            text: req.body.text,
            image: req.body.image,
            notify: req.body.notify,
            hidden: bad
        });
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
                if(req.body.notify)
                {
                    //User.find({following: {$in: [req.userID]}})
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

exports.toggleFollow = (req, res) =>
{
    User.findOne({_id: req.userId}, {following: 1}, (err, result) =>
    {
        if(result.following.indexOf(req.body.id) < 0)
        {
            User.updateOne({_id: req.userId},
            {$push: {following: req.body.id}})
            .then(()=>
            {
                res.status(200).send({message: "User followed"});
            });
        }
        else
        {
            User.updateOne({_id: req.userId},
            {$pull: {following: req.body.id}})
            .then(()=>
            {
                res.status(200).send({message: "User unfollowed"});
            });
        }
    })
}

exports.comment = (req, res) =>
{
    Post.updateOne({_id: req.body.pId},
        {$push: {comments: {user: req.userId, text: req.body.text}}},
        err=> {
            if(err)
                console.log(err);
            res.status(200).send({message: "commented!"});
        });
}

exports.unComment = (req, res) =>
{
    Post.updateOne({_id: req.params.pid},
        {$pull: {comments: {$and: [{_id: req.params.id}, {user: req.userId}]}}})
        .then(()=>
        {
            res.status(200).send({message: "Deleted"});
        });
}

exports.getAllBad = (req, res) =>
{
    BadWord.find()
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({message: err.errmsg, error:err});
      });
}

exports.toggleLike = (req, res) =>
{
    Post.findOne({_id: req.body.pId}, {likes: 1}, (err, result) =>
    {
        if(result.likes.indexOf(req.userId) < 0)
        {
            Post.updateOne({_id: req.body.pId},
            {$push: {likes: req.userId}},
            err=> {
                if(err)
                    console.log(err);
                res.status(200).send({message: "post liked!"});
            });
        }
        else
        {
            Post.updateOne({_id: req.body.pId},
            {$pull: {likes: req.userId}})
            .then(()=>
            {
                res.status(200).send({message: "post unliked"});
            });
        }
    })
}

exports.addAdv = (req, res) =>
{
    const adv = new Adv(
    {
        location: req.body.location,
        age: req.body.age,
        isGreater: req.body.isgreater,
        image: req.body.image,
        body: req.body.body
    });
    adv.save((err, adv) =>
    {
        if(err)
        {
            res.status(500).send({ message: err });
            return;
        }
        adv.save(err =>
        {
            if(err)
            {
                res.status(500).send({ message: err });
                return;
            }
            res.status(201).send({message: `Adv added successfully`});
        })
    });
}

exports.forgive = (req, res) =>
{
    const forgive = new ActiveRequest({user: req.userId, message: req.body.message});
    forgive.save((err, forgive) =>
    {
        if(err)
        {
            res.status(500).send({ message: err });
            return;
        }
        forgive.save(err =>
        {
            if(err)
            {
                res.status(500).send({ message: err });
                return;
            }
            res.status(200).send({message: `Request recieved`});
        })
    });
}

exports.getAllForgive = (req, res) =>
{
    ActiveRequest.find()
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({message: err.errmsg, error:err});
      });
}
exports.getAllBPost = (req, res) =>
{
    Post.find({hidden: true})
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({message: err.errmsg, error:err});
      });
}

exports.acceptForgive = (req, res) =>
{
    User.findOneAndUpdate({_id: req.body.uid},
        {$set: {blocked: false} }).then(()=>
        {
            res.status(200).send({message: "User Activated"});
        });
}

exports.getFeed = (req, res) =>
{
    User.findOne({_id: req.userId}, {following: true}, (err, result) =>
    {
        const following = result.following;
        feed = ['frs'];
        Post.find({user : {$in : following}}).then(posts =>
        {
            feed = posts.concat(feed);
            console.log(feed);
        });
    })
}