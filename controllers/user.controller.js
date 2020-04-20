const db = require("../models");
const User = db.user;
const BadWord = db.bad_word;
const Post = db.post;
const Adv = db.ad;
const ActiveRequest = db.active_request;
const bcrypt = require('bcryptjs');
var jwt = require('../services/jwt');
var mongoosePaginate = require('mongoose-pagination');
const OneSignal = require("onesignal-node");
const { appId, apiKey } = require("../config/onesignal.conig");
const client = new OneSignal.Client(appId, apiKey);

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

exports.search = (req, res) => 
{
    User.find({username: {$regex:`.*${req.params.term}.*`}})
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({message: err.errmsg, error:err});
      });
};

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
            post.save((err, doc) =>
            {
                if(err)
                {
                    res.status(500).send({ message: err });
                    return;
                }
                if(req.body.notify)
                {
                    User.find({ following: { $in: [req.userId] } })
                    .then(async (followers) => {
                      const username = await User.findOne({ _id: req.userId }).then(
                        (user) => user.username
                      );
                      console.log(username);
        
                      console.log(followers.map((user) => user._id));
                      const notification = {
                        contents: {
                          en: username + " added a new post",
                        },
                        include_external_user_ids: followers.map((user) => user._id),
                        data: post,
                      };
                      client
                        .createNotification(notification)
                        .then((response) => {
                          console.log(response.body);
                        })
                        .catch((e) => {
                          console.log(e.statusCode);
                          console.log(e.body);
                        });
                    })
                    .catch((err) => {
                      res.status(500).send({ message: err.errmsg, error: err });
                    });
                }
                res.status(200).send({message: doc});
            })
        })
    });
}

exports.getAllPosts = (req, res) =>
{
    Post.find()
    .sort({date: -1})
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
    Post.findOneAndUpdate({_id: req.body.pId},
        {$push: {comments: {user: req.userId, text: req.body.text}}},
        { new: true },
            (err, result)=> {
                res.send({ result });
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

exports.postOk = (req, res) =>
{
    Post.findOneAndUpdate({_id: req.body.pid},
        {$set: {hidden: false} }).then(()=>
        {
            User.findOneAndUpdate({_id: req.userId},
            {$inc: {bad_post_count: -1} }).then(()=>
            {
                res.status(200).send({message: "Post is set to okay"});
            });
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

exports.searchFeed = (req, res) =>
{
    User.findOne({_id: req.userId}, {following: true, location: true, dateOfBirth: true}, (err, result) =>
    {
        let feed = [];
        let userAge = new Date().getFullYear() - result.dateOfBirth.getFullYear();
        Post.find({$and: [{$or: [{user:{$in : result.following}}, {user:req.userId}]}, {text: {$regex : `.*${req.params.term}.*`}}]})
        .sort({date: -1})
        .then(posts =>
        {
            feed = posts.concat(feed);
            Adv.find({$or :
                [
                    {$and: [{location : result.location}, {age: null}]},
                    {$and: [{location: null, age: null}]},
                    {$and: 
                    [
                        {location: result.location},
                        {$or: [
                            {$and: [{isGreater: true}, {age: {$lte: userAge}}]},
                            {$and: [{isGreater: false}, {age: {$gte: userAge}}]}
                        ]}
                    ]}
                ]
            }, {body: 1, image: 1})
            .then(ads =>
            {
                res.send(ads.concat(feed));
            });
        });
    });
}

exports.getFeed = (req, res) => {
  let numPerPage = 20;
  let toSkip = (req.query.page - 1) * numPerPage;
  User.findOne(
    { _id: req.userId },
    { following: true, location: true, dateOfBirth: true },
    (err, result) => {
      let feed = [];
      let userAge = new Date().getFullYear() - result.dateOfBirth.getFullYear();
      Post.find({
        $or: [{ user: { $in: result.following } }, { user: req.userId }],
      })
        .sort({ date: -1 })
        .skip(toSkip)
        .limit(numPerPage)
        .then((posts) => {
          const ownersIds = posts.map((post) => post.user);
          User.find({ _id: { $in: ownersIds } }).then((owners) => {
            if (err) {
              res.status(500).send({ message: err });
              return;
            }
            const commentsOwnersIds = posts
              .flatMap((post) => post.comments)
              .map((comment) => comment.user);
            User.find({ _id: { $in: commentsOwnersIds } }).then(
              (commentsOwners) => {
                posts = posts.map((post) => {
                  post = post.toObject();
                  post.owner = owners.find(
                    (user) => user._id.toString() == post.user.toString()
                  );
                  post.comments = post.comments.map((comment) => {
                    comment.owner = commentsOwners.find(
                      (user) => user._id.toString() == post.user.toString()
                    );
                    return comment;
                  });
                  return post;
                });

                feed = posts.concat(feed);
                Adv.find(
                  {
                    $or: [
                      {
                        $and: [{ location: result.location }, { age: null }],
                      },
                      { $and: [{ location: null, age: null }] },
                      {
                        $and: [
                          { location: result.location },
                          {
                            $or: [
                              {
                                $and: [
                                  { isGreater: true },
                                  { age: { $lte: userAge } },
                                ],
                              },
                              {
                                $and: [
                                  { isGreater: false },
                                  { age: { $gte: userAge } },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                      {
                        $and: [
                          { location: null },
                          {
                            $or: [
                              {
                                $and: [
                                  { isGreater: true },
                                  { age: { $lte: userAge } },
                                ],
                              },
                              {
                                $and: [
                                  { isGreater: false },
                                  { age: { $gte: userAge } },
                                ],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                  { body: 1, image: 1 }
                )
                  .skip(toSkip)
                  .then((ads) => {
                    res.send(ads.concat(feed));
                  });
              }
            );
          });
        });
    }
  );
};
