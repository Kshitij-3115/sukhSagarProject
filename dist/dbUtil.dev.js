"use strict";

var mongoose = require('mongoose');

var Schema = mongoose.Schema;
var mongoURI = 'mongodb+srv://Kd-test:kshitij-1@cluster0.lhual.mongodb.net/demoDB?retryWrites=true&w=majority';

var openConnection = function openConnection(cb) {
  var msg;
  mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }, function (err) {
    if (err) {
      console.log(err);
      msg = 'a error occured while establishing connection with database!';
      cb(err, msg);
    } else {
      console.log("connection done!");
      msg = 'conecction stablished with database!';
      cb(err, msg);
    }
  });
}; //defining our schema 


var userSchema = new Schema({
  fname: String,
  mname: String,
  lname: String,
  email: String,
  passwd: String,
  mobile: String,
  address: String,
  education: String,
  dob: Date,
  pin: Number,
  place: String,
  state: String,
  country: String,
  resume: {
    data: Buffer,
    contentType: String
  }
});
var UserModel = new mongoose.model('UserModel', userSchema); //model

var addToDb = function addToDb(obj, cb) {
  console.log('reached on 45');
  openConnection(function (err, msg) {
    console.log('reached on 47');

    if (err) {
      console.log('reached on 49');
      console.log(err + " " + msg);
      return cb(err, []); //an error and an empty result array!
    } else {
      console.log('reached in 53');
      var user = new UserModel(obj);
      user.save(function (err, result) {
        console.log('from dbUtils : ' + err);
        console.log('from dbUtils : ' + result);

        if (err) {
          cb(err, result); //result as empty
        } else {
          cb(err, result); //err as null

          mongoose.connection.close();
        }
      });
    }
  });
};

var findInDb = function findInDb(queryObj, cb) {
  openConnection(function (err, msg) {
    if (err) {
      console.log(err + " " + msg);
      return cb(err, []); //an error and empty data array  
    } else {
      UserModel.find(queryObj, function (err, data) {
        if (err) {
          cb(err, data); //data as null
        } else {
          cb(err, data); //err as null

          mongoose.connection.close();
        }
      });
    }
  });
};

module.exports = {
  addToDb: addToDb,
  findInDb: findInDb
};