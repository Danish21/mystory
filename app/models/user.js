// load the things we need
var mongoose = require('mongoose');
	bcrypt   = require('bcrypt-nodejs'),
	BaseSchema = require('./base.js');

// define the schema for our user model
var userSchema = new BaseSchema({
	firstName : {type: String, default: 'firstname'},
	lastName: {type: String, default: 'lastname'},
	university: {type: String, default: ''},
	department: {type: String, default: ''},
	confirmationCode: {type: String},
	isConfirmed: {type: Boolean, default: false},
	isVerified: {type: Boolean, default: false},
	public: {type: Boolean, default: false},
    local            : {
        email        : String,
        password     : String
    },
    story: String
});

// generating a hash
userSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
userSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.local.password);
};

// create the model for users and expose it to our app
module.exports = mongoose.model('user', userSchema);
