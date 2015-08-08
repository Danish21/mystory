module.exports = function (app, passport) {
    var user   = require('../app/models/user'),
        question  = require('../app/models/question'),
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
                    sendToClient(err, null, res);

                // check to see if theres already a returnedUser with that email
                if (returnedUser) {
                    sendToClient('That email is already taken.', null, res);
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
                            sendToClient(err, false, 'Something Went Wrong');
                        } 
                        emailService.sendEmail(newUser.local.email, newUser.confirmationCode);
                        sendToClient(null, newUser, res);
                    });
                }

            });
        } else {
            // user is logged in and already has a local account. Ignore signup. (You should log out before trying to create a new account, user!)
            sendToClient('You are arleady loggedin', null, res)
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
        question.find({author: user_id, answer:{ $exists: true}}).populate('questioner','firstName lastName').exec(function (error,questions) {
            if (!error) {
                sendToClient(null,questions,res);
            } else {
                sendToClient('Something Went Wrong',null,res);
            }
        });
    });

    app.get('/api/getunansweredquestions', function (req,res) {
        var user_id = req.user._id; 
        question.find({author: user_id, answer: { $exists: false}}).populate('questioner','firstName lastName').exec(function (error,questions) {
            if (!error) {
                sendToClient(null,questions,res);
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

    app.post('/api/submitquestion', isLoggedIn, function (req,res) { //isLoggin only lets logged in user use this route/ if not loggedin not of this code will run
        var submittedQuestion = req.body.question; //story the question field from the req.body object.....If field is not set then will be undefined

        if (submittedQuestion) { //checking if it is undefined if it is we send an error message
            var newQuestion  = new question(); //question is defined at the top of the page. Mongoose gives a constructor for the question schema shich we call here
            //the reason we do this is that new Question has method called save which we will call to add the question to the database.
            newQuestion.text = submittedQuestion.text; //story the question fields
            newQuestion.author = submittedQuestion.author;
            newQuestion.questioner = req.user._id; //we know the questioner is the person who is loggedin.
            newQuestion.save( function (error,savedQuestion) { //save the question
                sendToClient(error,savedQuestion,res); //pass it to our send to client function
            })
        } else {
            sendToClient('Missing param question',null,res);
            
        }
    });
    
    app.post('/api/updateAnwser', isLoggedIn, function (req, res){
        var givenQuestion = req.body.question;
        if (givenQuestion && givenQuestion._id) {
            question.findOne({_id: givenQuestion._id}, function (error, existingQuestion) {
                if (existingQuestion) {
                    if (existingQuestion.author.equals(req.user._id)) {
                        question.update({_id: givenQuestion._id}, {$set: {answer:givenQuestion.answer}}, function (error,updatedQuestion) {
                            sendToClient(error,updatedQuestion,res);
                        });
                    } else {
                        
                    }
                } else {
                    sendToClient('This question does not exist',null,res);
                }
            });
        } else {
            sendToClient('Required Params question, question._id',null,res);
        }
    });
    app.post('/api/updatequestionpublicity', isLoggedIn, function (req, res) {
        var givenQuestion = req.body.question;
        if (givenQuestion && givenQuestion._id) {
            question.findOne({_id: givenQuestion._id}, function (error, existingQuestion) {
                if (existingQuestion) {
                    if (existingQuestion.author.equals(req.user._id)) {
                        question.update({_id: givenQuestion._id}, {$set: {public: givenQuestion.public}}, function (error,updatedQuestion) {
                            sendToClient(error,updatedQuestion,res);
                        });
                    } else {
                        sendToClient('You are not authorize to answer this question',null,res);
                    }
                } else {
                    sendToClient('This question does not exist',null,res);
                }
            });
        } else {
             sendToClient('Required Params question, and question._id',null,res);
        }
    });
    
    app.post('/api/updatestorypublicity', isLoggedIn, function (req, res) {
        user.update({_id: req.user._id}, {$set: {public: req.body.public}}, function (error,updatedUser) {
            sendToClient(error,updatedUser,res);
        });
    });


    app.post('/api/getsafeuserinfo', function (req,res) {
        var userid = req.body.userid;
        if (userid) {
            user.findOne({_id:userid}, {_id:1, firstName:1, lastName:1,story:1, public: 1}, function(error,returnedUser){
                if (!error) {
                    if (returnedUser.public) {
                        sendToClient(error,returnedUser,res);
                    } else {
                        sendToClient('This story is not public',null, res);
                    }
                } else {
                    sendToClient('Something went wrong', null, res);
                }
            });
        } else {
            sendToClient('Missing param userid',null,res);
            
        }
    });
    app.post('/api/getpublicquestions', function (req, res) {
        var userid = req.body.userid;
        if (userid) {
            question.find({author: userid, public: true}, function (error, questions) {
                sendToClient(error,questions,res);
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

    res.send(200,
    {
        status: 'ERROR',
        message: 'Please login to perform this action'
        
    });
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