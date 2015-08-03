module.exports = function (app, passport) {
    var user   = require('../app/models/user'),
        qanda  = require('../app/models/qanda'),
        uuid   = require('node-uuid');  
        emailService = require('../app/email.js');

// LOGOUT ==============================
    app.get('/api/logout', function (req, res) {
        req.logout();
        res.json(200, {
            status: 'OK',
            message: 'Logged Out'
        });
    });

// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // process the login form
    app.post('/api/login', function handleLocalAuthentication(req, res, next) {//Utilizing custom callback to send json objects
        passport.authenticate('local-login', function (err, user, message) {
            if (err) {
                return next(err);   
            } 
            var response = {};
            if (!user) {
                response.status = 'ERROR';
                response.message = message;
                return res.json(200, response);
            }

            // Manually establish the session...
            req.login(user, function(err) {
                if (err) {
                    return next(err);  
                } 
                response.status= 'OK';
                response.user = user;
                return res.json(200,response);
            });

        })(req, res, next);
    });

        // SIGNUP =================================
        // process the signup form
    app.post('/api/signup', function handleLocalAuthentication(req, res, next) { //Utilizing custom callback to send json objects
        var email = req.body.email;
        var password = req.body.password;

        if(email)
             email = email.toLowerCase();

        if (!req.user) {
            user.findOne({ 'local.email' :  email }, function(err, returnedUser) {
                // if there are any errors, return the error
                if (err)
                    sendToClient(err,null,res);

                // check to see if theres already a returnedUser with that email
                if (returnedUser) {
                    sendToClient(null, false,  'That email is already taken.');
                } else {
                    // create the user
                    var newUser            = new user();
                    newUser.local.email    = email;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.firstName = req.body.firstName;
                    newUser.lastName = req.body.lastName;
                    newUser.university = req.body.university;
                    newUser.department = req.body.department;
                    newUser.confirmationCode = uuid.v4();
                    newUser.save(function(err) {
                        if (err){
                            sendToClient(err,false, 'Something Went Wrong');
                        } 
                        emailService.sendEmail(newUser.local.email,newUser.confirmationCode);
                        sendToClient(null, newUser,res);
                    });
                }

            });
        } else {
            // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
            sendToClient('You are arleady loggedin',null,res)
        }
    });
    
    app.post('/api/confirmemail', function (req,res) {
        var confirmationCode = req.body.confirmationCode;
        if (confirmationCode) {
            user.findOne({confirmationCode: confirmationCode}, function (error, returnedUser) {
                if (!error) {
                    if (returnedUser) {
                         user.update({_id: returnedUser._id}, {isConfirmed: true}, function (error, updatedUser) {
                            sendToClient(error, updatedUser,res);
                        });
                    } else {
                        sendToClient('Invalid confirmationCode',null,res);
                    }
                } else {
                    sendToClient('Error in finding user',null,res);
                }
            });
        } else {
            sendToClient('Missing param confirmationCode',null,res);
        }
    });

    app.get('/api/loggedin', function (req,res) {
        res.send(req.isAuthenticated() ? req.user : '0');
    });

// =============================================================================
// NORMAL ROUTES ===============================================================  
// =============================================================================
    app.get('/api/getuserinfo', isLoggedIn, function (req,res) {
        var user_id = req.user._id; 
        user.findOne({_id: user_id}, function (error,user) {
            if (!error) {
                sendToClient(null,user,res);
            } else {
                sendToClient('Something Went Wrong',null,res);
            }
        });
    });

    app.get('/api/getansweredquestions', function (req,res) {
        var user_id = req.user._id; 
        email.sendEmail();
        qanda.find({_id: user_id, answer:{ $exists: true}}, function (error,qandas) {
            if (!error) {
                sendToClient(null,qandas,res);
            } else {
                sendToClient('Something Went Wrong',null,res);
            }
        });
    });

    app.get('/api/getunansweredquestions', function (req,res) {
        var user_id = req.user._id; 

        qanda.find({_id: user_id, answer: { $exists: false}}, function (error,qandas) {
            if (!error) {
                sendToClient(null,qandas,res);
            } else {
                sendToClient('Something Went Wrong',null,res);
            }
        });
    });

    app.post('/api/updatestory', isLoggedIn, function (req,res) {
        var story = req.body.story;
        if (story) {
            user.update({_id: req.user._id}, {story: story}, function (error, updatedUser) {
                sendToClient(error, updatedUser,res);
            });
        } else {
            sendToClient('Missing param story',null,res);
        }
    });

    app.post('/api/getsafeuserinfo', function (req,res) {
        var userid = req.body.userid;

        if (userid) {
            user.findOne({_id:userid}, {_id:1, firstName:1, lastName:1,story:1}, function(error,user){
                sendToClient(error,user,res);
            });
        } else {
            sendToClient('Missing param userid',null,res);
            
        }
    });

    
};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.send('you are not logged in');
}

function sendToClient (error,data,res) {
    var response = {};
    if (error) {
        response.status = 'ERROR';
        response.message = error; 
    } else {
        response.status = 'OK';
        response.data = data;
    };
    res.json(200,response);
}