var mongoose = require('mongoose'),
	BaseSchema = require('./base.js');

var questionSchema = new BaseSchema({
	author: {type:  mongoose.Schema.ObjectId, ref: 'user'},
	questioner: {type:  mongoose.Schema.ObjectId, ref: 'user'},
	text: String,
	answer: String,
	public: Boolean
});

module.exports = mongoose.model('question', questionSchema);