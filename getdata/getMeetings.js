var $ = require("cheerio");
var request = require("request");

// initialize MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://digitalrecovery_mongo_1:27017/digitalRecovery');
var Meeting = require('../models/meeting.js');
var Venue = require('../models/venue.js');

var options = { method: 'POST',
	url: 'http://lacoaa.org/find-a-meeting/',
	headers:
	{ 'postman-token': 'fabc66fa-e067-b296-fe30-89c13cdc746e',
		'cache-control': 'no-cache',
		'content-type': 'multipart/form-data; boundary=---011000010111000001101001' },
	formData:
	{ sZIP: '90036',
		sDAY: '-any-',
		sRADIUS: '100',
		sLOCATION: '-any-',
		sTIME: '-any-',
		sCLOSED: '-any-',
		'sMEN-WOMEN': '-any-',
		sGAY: '-any-',
		search_meeting: '1',
		Submit: 'Submit' } };

request(options, function (error, response, body) {
	if (error) throw new Error(error);

	var parsedBody = $.load(body);
	var meetings = [];
	parsedBody('.meeting_item').map(function(i, data) {

		/* Expected Block
		 <div class="meeting_item" data-marker="90036">
		 <div class="meeting_desc_wrap">
		 <h2 class="meeting_title">PROMISES</h2>
		 <div class="meeting_time">
		 <span>08:05 AM</span>Friday
		 </div>g
		 <div class="meeting_desc">
		 <p>6720 MELROSE AVE, HOLLYWOOD 90036</p>
		 <p>Open Meeting</p>
		 </div>
		 </div>
		 </div>
		 */

		var meetingdata = $(data);

		var zip = $(data).attr('data-marker');
		var parsedMeeting = $.load($(meetingdata).html());
		var whendesc = parsedMeeting('.meeting_time').html().split("</span>");

		var meeting = {
      _id:i,
      affiliation:'AA',
			title : parsedMeeting('.meeting_title').html(),
			descriptors : parsedMeeting('.meeting_desc p:nth-of-type(2)').html().split(", "),
			address : parsedMeeting('.meeting_desc p:nth-of-type(1)').html(),
			zip : zip,
			day_of_week : whendesc[1],
			time : parsedMeeting('.meeting_time span').html()
		};

		meetings.push(meeting);
		//console.log(JSON.stringify(meeting));

	});

	console.log(JSON.stringify(meetings));
});
