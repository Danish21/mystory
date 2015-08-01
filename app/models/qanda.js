var mongoose = require('mongoose');

var qandaSchema = mongoose.Schema({
	question: String,
	anwser: String
});

module.exports = mongoose.model('qanda', qandaSchema);