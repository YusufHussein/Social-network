const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  const router = require("express").Router({strict: true});

  // Retrieve all users
  router.get("/", [authJwt.verifyToken, authJwt.isAdmin], controller.findAll);
  
  //Retrieve all posts
  router.get("/post", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllPosts);
  
  //get all bad words
  router.get("/bad", [authJwt.verifyToken, authJwt.isAdmin], controller.getAllBad);

  // Retrieve a single user with id
  router.get("/:id", [authJwt.verifyToken], controller.findOne);

  // Update a user with id
  router.put("/:id", [authJwt.verifyToken, authJwt.isAdminOrSelf], controller.update);

  // delete an account with id //Future release
  //router.delete("/:id", [authJwt.verifyToken, authJwt.isAdminOrSelf], controller.delete);

  //add a word to bad words list
  router.post("/bad", [authJwt.verifyToken, authJwt.isAdmin], controller.addBad);

  //delete a word from bad words list
  router.delete("/bad/:word", [authJwt.verifyToken, authJwt.isAdmin], controller.delBad);

  //follow/unfollow a user as self
  router.post("/follow", [authJwt.verifyToken], controller.toggleFollow);

  //Add new post
  router.post("/post", [authJwt.verifyToken], controller.addPost);

  //Comment on a post
  router.post("/comment", [authJwt.verifyToken], controller.comment);

  //Uncomment
  router.delete("/comment/:pid/:id", [authJwt.verifyToken], controller.unComment);
  
  //like/unlike a post
  router.post("/like", [authJwt.verifyToken], controller.toggleLike);

  //add adv
  router.post("/adv", [authJwt.verifyToken, authJwt.isAdmin], controller.addAdv);

  app.use("/api/users", router);
};
