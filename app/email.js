 var email = function () {

	var nodemailer = require('nodemailer');

	// create reusable transporter object using SMTP transport
	var transporter = nodemailer.createTransport({
	    service: 'Gmail',
	    auth: {
	        user: 'mystorydev21@gmail.com',
	        pass: 'qazwsxedc21'
	    }
	});

	// NB! No need to recreate the transporter object. You can use
	// the same transporter object for all e-mails

	// setup e-mail data with unicode symbols
	var mailOptions = {
	    from: 'My Story  <mystorydev21@gmail.com>', // sender address
	    to: 'dnoora2@illinois.edu', // list of receivers
	    subject: 'Confirm Your Email', // Subject line
	    text: '', // plaintext body
	    html: '<b>Thank you for signing up with myStory</b>' // html body
	};



	// send mail with defined transport object
	this.sendEmail = function (reciepientEmail, confirmationCode) {
		console.log(reciepientEmail);
		mailOptions.to = reciepientEmail;
		mailOptions.html = '<b>Thank you for signing up with myStory <br> Please Confirm your email by clicking this <a href="http://localhost:3000/#/confirm/?c=' + confirmationCode + '">link</a> <br><br> Thanks Again!</b>'
		transporter.sendMail(mailOptions, function(error, info){
		    if(error){
		        return console.log(error);
		    }
		    console.log('Message sent: ' + info.response);
		});
	};
	
};

module.exports = new email();