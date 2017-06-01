var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var inMessage = require('./node_modules/custom/inMsg.js');
var googleTranslate = require('google-translate')('');
var bot_token = process.env.SLACK_BOT_TOKEN || '';

var rtm = new RtmClient(bot_token);

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
    //console.log(msg.getMsgType());
  } else {
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
  }
});
