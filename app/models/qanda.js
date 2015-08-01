var mongoose = require('mongoose');

var qandaSchema = mongoose.Schema({
	user: {type: String, ref: 'user'},
	question: String,
	anwser: String
});

module.exports = mongoose.model('qanda', qandaSchema);