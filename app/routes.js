module.exports = function (app, passport) {
    var user       = require('../app/models/user');

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
        // app.post('/api/signup', passport.authenticate('local-signup'), function(req,res){
        //     res.json(req.user); 
        // });
    app.post('/api/signup', function handleLocalAuthentication(req, res, next) { //Utilizing custom callback to send json objects
        passport.authenticate('local-signup', function(err, user, message) {
            if (err){ 
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
                if (err){
                    return next(error);
                }
                response.status= 'OK';
                response.user = user;
                return res.json(200,response);
            });
        })(req, res, next);
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
            asfskdjfkj
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