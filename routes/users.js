
module.exports = app => 
{
  const users = require("../controllers/user.js");

  var router = require("express").Router();

  //create new user
  router.post("/", users.create);

  // Retrieve all users
  router.get("/", users.findAll);

  // Retrieve a single user with id
  router.get("/:id", users.findOne);

  // Update a user with id
  router.put("/:id", users.update);

  // delete an account with id
  router.delete("/:id", users.delete);
  
  //app.use("/api/users", router);
};
