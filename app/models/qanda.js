var mongoose = require('mongoose');

var qandaSchema = mongoose.Schema({
	user: {type: String, ref: 'user'},
	question: String,
	answer: String
});

module.exports = mongoose.model('qanda', qandaSchema);