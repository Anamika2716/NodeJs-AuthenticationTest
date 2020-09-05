var generator = require('generate-password');
 
var User=require('../models/user');
module.exports=function(app, passport, forgot)
{
     
    // HOME PAGE (with login links) 
    app.get('/', function(req, res) {
        
        // load the index.ejs file
        res.render('index.ejs');
    });

    //LOGIN
    //show login form
    app.get('/login', function(req, res){
        res.render('login.ejs',{message:req.flash('loginMessage')});
    });

    //SIGNUP
    //show singUp form
    app.get('/signup', function(req, res){
        res.render('signup.ejs', { message: req.flash('signupMessage') });
    });

    //Profile Page , protected , should be loggedIn

    app.get('/profile', isLoggedIn, function(req, res){

        res.render('profile.ejs', {
            user:req.user
        });
    });
    app.get('/forgot',function(req, res){
        console.log("forgot", req);
        res.render('forgot.ejs',{password:req.password});
    });


    //LOG OUT 
    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');   
    });

    //process the signUp
    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/signup', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));
     // process the login form
     app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/profile', // redirect to the secure profile section
        failureRedirect : '/login', // redirect back to the signup page if there is an error
        failureFlash : true // allow flash messages
    }));


    //forgot password
    app.post('/forgotPassword', async function(req, res){
        var email=req.body.email;

        var password = generator.generate({
            length: 10,
            numbers: true
        });
      //  console.log("email", req, "password", password);
        let user=new User();
        let hashPassword=user.generateHash(password);
 User.findOneAndUpdate({email:email},{email:email, password:hashPassword}, {
            new:true
        }, function(err, res1){
            if(err)
            {
                console.log("err", err);
                return done(null, req.flash('forgotMessage', 'Invalid User Email '));
            }else{
                console.log("password", password);

                return res.render('forgot.ejs',{password:password});
                // res.render()
            }
            console.log(res1);
           
          //   res.redirect('/forgot');
           // return done(null, req.flash('forgotMessage', `New Password ${password}`)); // create the loginMessage and save it to session as flashdata

       
        });
       
       
        
       
    });
        // let newUser=new User();
             
        //          newUser.email=email;
        //         newUser.password=newUser.generateHash(password);

        //         newUser.save(function(err){
        //             if(err){
        //                 console.log("err", err);
        //             res.render('login.ejs',{message:req.flash('loginMessage','Error sendig message')});
        //             }
        //             else
        //             res.render('login.ejs',{message:req.flash('loginMessage','Use this password to login ${password}')});
        //         });
        //     });   

                
        // var reset=await forgot(email, function(err){
        //          if(err)
        //          {
        //              console.log("err", err);
        //          res.render('login.ejs',{message:req.flash('Error sendig message')});
        //          }
        //          else
        //          res.render('login.ejs',{message:req.flash('Check your inbox for a password reset message.')});
        // });
        // console.log("reset", reset);
        
        // // reset.on('request', function(req, res){
        // //     req.session.reset={email:email, id:reset.id};
        // //     res.redirect('back');

        // // })

                
};



function isLoggedIn(req, res, next)
{
      // if user is authenticated in the session, carry on 
    if(req.isAuthenticated())
    return next();
// return to Home page
    res.redirect('/');
}
