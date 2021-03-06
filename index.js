///NO ERRORS, but doesnt get text. Need to debug in the url passed to vision API is right


var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var inMessage = require('./node_modules/custom/inMsg.js');
var creds = require('./creds.js');
//REQUIRED CONFIGURATIONS//
//Create a creds.js file and add the following lines (remember to remove comments -//- and fill in the bot token and Google key):
//var googleTranslateAuth = '';
//var slack_bot_token = '';
//exports.googleTranslateAuth = googleTranslateAuth;
//exports.slack_bot_token = slack_bot_token;

var googleTranslate = require('google-translate')(creds.googleTranslateAuth);
var slack_bot_token = creds.slack_bot_token;
var slack_token = creds.slack_token;
var vision = require('@google-cloud/vision')({
  projectId: 'marco-translate-bot',
  keyFilename: './keyfile.json'
});
//END REQUIRED CONFIGURATIONS//

var rtm = new RtmClient(slack_bot_token);

let channel;

// The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (rtmStartData) => {
  for (const c of rtmStartData.channels) {
	  if (c.is_member && c.name ==='general') { channel = c.id }
  }
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

// you need to wait for the client to fully connect before you can send messages
//rtm.on(CLIENT_EVENTS.RTM.RTM_CONNECTION_OPENED, function () {
//  rtm.sendMessage("Hello!", channel);
//});

rtm.start();
rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  //console.log(message);
  var msg = new inMessage (message);
  if (msg.getMsgType() == "file_share") {
	  if (msg.getSize() < 4194304) {

		var WebClient = require('@slack/client').WebClient;

       		var web = new WebClient(slack_token);

        	web.files.sharedPublicURL(msg.getID(), function shareCb(err, info) {
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
			                vision.detectText(imgURL, function(err, text) {
					 if (text.length > 0) {
       				         	//for (var i=0; i < text.length; i++) {
    				                  //console.log(text[i]);
       				               //}
						googleTranslate.detectLanguage(text[0], function(err, detection) {
      						sl = detection.language;
      						  if (sl == 'en') {
						    //rtm.sendMessage("The message is already in English!", msg.getChannel());
        					    //console.log('Main Process: ' + detection.language);
      						  } else { 
						    googleTranslate.translate(text[0], sl, 'en', function(err, translation) {
	  					    rtm.sendMessage("It means: " + translation.translatedText, msg.getChannel());
          					    //console.log(translation.translatedText);
        					    });
      						  }
    						});

					 } else {
						rtm.sendMessage("No text in the image", msg.getChannel());
					 }
       				        });

                		});
          		}
        	});
          } else {
            rtm.sendMessage("Maximum image size is 4MB", msg.getChannel());
	  }
    //console.log(msg.getMsgType());
  } else if (msg.getMsgType() == "noSubtype") {
    //console.log(msg.getMsgType());
    googleTranslate.detectLanguage(msg.getText(), function(err, detection) {
      sl = detection.language;
      if (sl == 'en') {
	//rtm.sendMessage("The message is already in English!", msg.getChannel());
        //console.log('Main Process: ' + detection.language);
      } else { 
	googleTranslate.translate(msg.getText(), sl, 'en', function(err, translation) {
	  rtm.sendMessage("It means: " + translation.translatedText, msg.getChannel());
          //console.log(translation.translatedText);
        });
      }
    });
  } else {
	console.log("Nothing to do");
  }
});
