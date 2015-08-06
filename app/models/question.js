var mongoose = require('mongoose');

var questionSchema = mongoose.Schema({
	author: {type:  mongoose.Schema.ObjectId, ref: 'user'},
	questioner: {type:  mongoose.Schema.ObjectId, ref: 'user'},
	text: String,
	answer: String,
	public: Boolean
});

module.exports = mongoose.model('question', questionSchema);