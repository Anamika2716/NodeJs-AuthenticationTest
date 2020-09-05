// load all the things we need
var LocalStrategy   = require('passport-local').Strategy;

// load up the user model
var User            = require('../models/user');

// expose this function to our app using module.exports
module.exports = function(passport) {

   
    // passport session setup
    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user);
        });
 
    });


    //Local SignUp
    passport.use('local-signup', new LocalStrategy({
        usernameField:'email',
        passwordField:'password',
        passReqToCallback:true
    }, async function(req, email, password, done)
    {
     
        await User.findOne({
            'email':email
        }, function(err, res)
        {
            if(err)
            return done(err);
            if(res)
            {
                return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
            }
            else
            {
                if(req.body.confirmPassword!==password)
                {
                    return done(null, false, req.flash('signupMessage', 'Password Mismatch'));   
                }
                let newUser=new User();
             
                
                newUser.email=email;
                newUser.password=newUser.generateHash(password)

                newUser.save(function(err){
                    if(err)
                    throw err;

                    return done(null,newUser);
                });

            }
        });
    }));
    

    //passport login
    
    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        User.findOne({ 'email' :  email }, function(err, user) {
            // if there are any errors, return the error before anything else
            if (err)
                return done(err);

            // if no user is found, return the message
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash

            // if the user is found but the password is wrong
            if (!user.validPassword(password))
                return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata

            // all is well, return successful user
            return done(null, user);
        });

    }));

};
