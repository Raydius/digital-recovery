// initialize MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://digitalrecovery_mongo_1:27017/digitalRecovery');
var Meeting = require('../models/meeting.js');

var moment = require('moment');

Meeting.find({_id:{$gt:0}}).exec(function(err, meetings) {


  meetings.forEach(function(mtg) {

    // data cleansing

    // create calctime
    if(mtg.time != null) {
      mtg.calctime = moment(mtg.time, "hh:mm a").format("HHmm");
      console.log('Converting time from "' + mtg.time + '" to "' + mtg.calctime + '"');
    }

    // create geoJSON
    mtg.loc = {
      type:'Point',
      coordinates: [ mtg.location.longitude, mtg.location.latitude ]
    };
    //console.log(mtg.title);
    //console.log(JSON.stringify(mtg.loc));
    mtg.save(function(err, m) {
      if(err) {
        console.log(JSON.stringify(mtg));
        console.log(err);
      }
    });

  });


});

