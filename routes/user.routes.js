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

  app.use("/api/users", router);
};
