var mongoose = require('mongoose');

var qandaSchema = mongoose.Schema({
	question: String,
	answer: String
});

module.exports = mongoose.model('qanda', qandaSchema);