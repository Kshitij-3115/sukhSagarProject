const mongoose = require('mongoose');
const { Schema } = mongoose;

const mongoURI = 'mongodb+srv://Kd-test:kshitij-1@cluster0.lhual.mongodb.net/demoDB?retryWrites=true&w=majority';
 

const openConnection = (cb) => {
    let msg; 
    mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true }, (err) => {
        if (err) {
            console.log(err);
            msg = 'a error occured while establishing connection with database!'; 
            cb(err,msg); 
        } else {
            console.log("connection done!"); 
            msg = 'conecction stablished with database!'; 
            cb(err,msg);   
        }
    });
}
//defining our schema 
const userSchema = new Schema({
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
})

const UserModel = new mongoose.model('UserModel', userSchema); //model

const addToDb = (obj, cb) => {
    console.log('reached on 45');
    openConnection((err,msg) => {
        console.log('reached on 47');
        if(err) {
            console.log('reached on 49');
            console.log(err + " " + msg); 
            return cb(err,[]); //an error and an empty result array!
        } else {
            console.log('reached in 53');
            let user = new UserModel(obj);
            user.save((err, result) => {
                console.log('from dbUtils : ' + err);
                console.log('from dbUtils : ' + result);
                if (err) {
                    cb(err, result);  //result as empty
                    
                } else {
                    cb(err, result); //err as null
                    mongoose.connection.close(); 
                }
            })
           
        }
        
    })
    
}

const findInDb = (queryObj, cb) => {
    openConnection((err,msg) => {
        if(err) {
            console.log(err + " " + msg); 
            return cb(err,[]); //an error and empty data array  
        } else {
            UserModel.find(queryObj, (err, data) => {
                if (err) {
                    cb(err, data); //data as null
                    
                } else {
                    cb(err, data); //err as null
                    mongoose.connection.close(); 
                }
            })
          
        }
        
    })
   
}

module.exports = {
    addToDb : addToDb, 
    findInDb : findInDb
}