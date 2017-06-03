
var creds = require('./creds.js');
var vision = require('@google-cloud/vision')({
  projectId: 'marco-translate-bot',
  keyFilename: './keyfile.json'
});

var WebClient = require('@slack/client').WebClient;

var slack_token = creds.slack_token;
var web = new WebClient(slack_token);

web.files.sharedPublicURL("F5NTRTFBQ", function shareCb(err, info) {
  if (err) {
    console.log('Error:', err);
  } else {
	//console.log(info);
	var request = require('request');

	request(info.file.permalink_public, function (error, response, body) {
	  //console.log('error:', error); // Print the error if one occurred 
	  //console.log('statusCode:', response && response.statusCode); // Print the response status code if a response was received 
	  //console.log('body:', body); // Print the HTML for the Google homepage. 
	  var re=new RegExp("<img src=\"https://files.slack.com/files-pri/.*\">");
	  var result=re.exec(body);
	  imgURL=result[0].substr(result[0].indexOf("\"") + 1);
	  imgURL=imgURL.substr(0, imgURL.lastIndexOf("\""));
	});
  }
});
	    vision.detectText(imgURL, function(err, text) {
		//console.log(err);
		console.log(text);
		//for (var i=0; i < text.length; i++) {
		//	console.log(text[i]);
		//}
	    });



