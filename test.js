
var creds = require('./creds.js');
var vision = require('@google-cloud/vision')({
  projectId: 'marco-translate-bot',
  keyFilename: './keyfile.json'
});

var WebClient = require('@slack/client').WebClient;
var q = require ('q');
var slack_token = creds.slack_token;
var web = new WebClient(slack_token);

function getWebData(url) {
    var def=q.defer();
    request.get(url, function(err, response, body) {
        def.resolve(response.Name1.prop);
    })
    return def.promise();
}


web.files.sharedPublicURL("F5PN34Z1V", function shareCb(err, info) {
  if (err) {
    console.log('Error:', err);
  } else {
	  var webData = getWebData(info.file.permalink_public);
	  var re=new RegExp("<img src=\"https://files.slack.com/files-pri/.*\">");
	  var result=re.exec(webData.body);
	  imgURL=result[0].substr(result[0].indexOf("\"") + 1);
	  imgURL=imgURL.substr(0, imgURL.lastIndexOf("\""));
	}

	    vision.detectText(imgURL, function(err, text) {
		//console.log(err);
		console.log(text);
		//for (var i=0; i < text.length; i++) {
		//	console.log(text[i]);
		//}
	    });


  });



