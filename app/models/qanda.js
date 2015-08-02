var mongoose = require('mongoose');

var qandaSchema = mongoose.Schema({
	author: {type:  mongoose.Schema.ObjectId, ref: 'user'},
	questioner: {type:  mongoose.Schema.ObjectId, ref: 'user'},
	question: String,
	answer: String,
	public: boolean
});

module.exports = mongoose.model('qanda', qandaSchema);