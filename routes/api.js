var express = require('express');
var router = express.Router();
var https = require('https');
var geocode = require('google-geocode');

var moment = require('moment');

// initialize MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://digitalrecovery_mongo_1:27017/digitalRecovery');
var Meeting = require('../models/meeting.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.send('api root');
  //res.json(some_data);
});

router.post('/meetings', function(req, res, next) {

  var geoView = req.body.geoView;
  var filters = req.body.filters;

  var query = Meeting.find();

  // add map bounds restriction
  query.where('loc').within().geometry(geoView)

  // parse day filters
  if(filters.day > 0) {
    //conditions.day_of_week = moment(filters.day, 'E').format('dddd');
    query.where('day_of_week').equals(moment(filters.day, 'E').format('dddd'));
  }

  // parse time filters
  var earliestTime = moment(filters.earliestTime, "hh:mm a").format("HHmm");
  var latestTime = moment(filters.latestTime, "hh:mm a").format("HHmm");

  // convert midnight
  if(latestTime == '0000') {
    latestTime = 2400;
  }

  // add time to query
  query.where('calctime').gte(earliestTime).lt(latestTime);


  console.log(JSON.stringify(query.getQuery()));

  query.exec(function(err, meetings) {

    if (err) {
      res.send(err);
    }

    for(var i=0,max=meetings.length; i < max; i++) {

      // temporary: add the custom marker while we're stepping through
      // todo: switch markers depending on which program affiliation
      meetings[i].icon = "/images/aa_marker.png";

      //meetings[i].icon = new google.maps.MarkerImage('/images/aa.svg',null,null,null,new google.maps.Size(64,64));

    }

    res.json(meetings);

  });



});

module.exports = router;
