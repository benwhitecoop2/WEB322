var exports = module.exports = {};

var mongoose = require('mongoose');
var schema = mongoose.Schema;

var bcrypt = require('bcryptjs');

var userSchema = new schema({
    "userName": {
        type: String,
        unique: true
    },
    "password": String,
    "email": String,
    "loginHistory": [{
        "dateTime": Date,
        "userAgent": String
    }]
});

let User; //to be defined on new connection

var connectionString = 'mongodb://web322a6user:mettatati0n@ds145188.mlab.com:45188/web322_a6';

exports.initialize = function () {
    return new Promise(function (resolve, reject) {
        let db = mongoose.createConnection(connectionString);
        db.on('error', (err) => {
            reject(err); // reject the promise with the provided error
        });
        db.once('open', () => {
            User = db.model("users", userSchema);
            resolve();
        });
    });
};

exports.registerUser = function(userData){
    return new Promise(function(resolve,reject){
        if(userData.password != userData.password2){
            reject("Password Mismatch...");
        }else{
            var newuser = new User(userData);
            bcrypt.genSalt(10,function(err,salt){
                bcrypt.hash(userData.password, salt, function(err,hash){
                    if(err){
                        reject("Error occurred while encrypting user's password...");
                    }else{
                        newuser.password = userData.password;
                        newuser.save().then(function(){
                            resolve();
                        }).catch(function(err){
                            if(err.code==11000){
                                reject("Username already taken");
                            }else{
                                reject("Error creating user: "+err);
                            }
                        });
                    }
                });
            });
        }
    });
};

exports.checkUser = function(userData){
    return new Promise(function(resolve,reject){
        User.find(
            {userName: userData.userName}
            ).exec().then(function(found_user){
                console.log(found_user[0]);
            bcrypt.compare(userData.password, found_user[0].password)
            .then(function(result){
                found_user[0].loginHistory.push(
                    {dateTime:(new Date()).toString(),userAgent: userData.userAgent}
                    );
                User.update(
                    {userName: found_user[0].userName},{$set: {loginHistory: found_user[0].loginHistory}},{multi:false}
                    )
                .exec().then(function(){
                    resolve(found_user[0]);
                }).catch(function(){
                    reject("Error verifying user");
                });
            }).catch(function(){
                reject("Incorrect password for current user");
            });
        }).catch(function(err){
            reject("There was an error finding the user: "+err);
        });
    });
};