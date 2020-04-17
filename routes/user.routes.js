const { authJwt } = require("../middlewares");
const controller = require("../controllers/user.controller");

module.exports = function (app) {
  const router = require("express").Router();

  // Retrieve all users
  router.get("/", [authJwt.verifyToken, authJwt.isAdmin], controller.findAll);

  // Retrieve a single user with id
  router.get("/:id", [authJwt.verifyToken], controller.findOne);

  // Update a user with id
  router.put("/:id", [authJwt.verifyToken, authJwt.isAdminOrSelf], controller.update);

  // delete an account with id
  router.delete("/:id", [authJwt.verifyToken, authJwt.isAdminOrSelf], controller.delete);

  //add a word to bad words list
  router.post("/bad", [authJwt.verifyToken, authJwt.isAdmin], controller.addBad);

  //delete a word from bad words list
  router.delete("/bad/:word", [authJwt.verifyToken, authJwt.isAdmin], controller.delBad);

  router.post("/add_post", [authJwt.verifyToken], controller.addPost);

  app.use("/api/users", router);
};
