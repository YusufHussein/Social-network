const MongoClient = require('mongodb').MongoClient;
let _db; 
const mongoConnect = function(callback) {
    MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true })
        .then(client => {
            _db = client.db('socialnetwork');
            callback();
        })
        .catch(error => {
            console.log(err);
            throw new Error('DB connection failed!!');
        });
}
const getDB = () => {
    if (_db) {
        return _db;
    } else {
        throw new Error('DB connect !!');
    }
}
exports.mongoConnect = mongoConnect;
exports.getDB = getDB;