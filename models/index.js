const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

const db = {};

db.mongoose = mongoose;

db.user = require("./user.model");
db.role = require("./role.model");
db.ad = require("./ads.model.js");
db.post = require("./post.model.js");
db.bad_word = require("./bad_words.js");

db.ROLES = ["user", "admin"];

module.exports = db;
