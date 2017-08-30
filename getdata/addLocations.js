var https = require('https');
var geocode = require('google-geocode');
var Q = require('q');

// initialize MongoDB
var mongoose = require('mongoose');
mongoose.connect('mongodb://digitalrecovery_mongo_1:27017/digitalRecovery');
var Meeting = require('../models/meeting.js');
var Venue = require('../models/venue.js');


// set google api key
var googleApiKey = 'AIzaSyCZNWrEMagiRmT10taDru4p0ZMfWq8qVEs';
var geocodeUrl = 'https://maps.googleapis.com/maps/api/geocode/json?key='+googleApiKey+'&address=';

// use Q to define a Promise compliant version of https.get
var httpsGet = function (opts) {
  var deferred = Q.defer();
  https.get(opts, deferred.resolve);
  return deferred.promise;
};
var loadBody = function (res) {
  var deferred = Q.defer();
  var body = "";
  res.on("data", function (chunk) {
    body += chunk;
  });
  res.on("end", function () {
    deferred.resolve(body);
  });
  return deferred.promise;
};

//{location: {longitude:null, latitude:null}}
//{location:null}

// add limit here to throttle the API
Meeting.find({location:null}).limit(500).exec(function(err, meetings) {

  var geocount = 0;

  var getLatLng = function (i) {

    var deferred = Q.defer();

    // check to see if we already have the LatLng for this address in the venue collection
    // findone address in venue

    var updateLatLng = function (i, lat, lng) {

      // update in local meetings array
      meetings[i].location = { latitude:lat, longitude:lng };
      console.log('Updating local meetings array');

      // update in meetings collection in mongo
      Meeting.findByIdAndUpdate(meetings[i]._id, {
        $set: { location: {latitude: lat, longitude: lng} }
      }, function(err, meeting) {

        if(err) res.send(err);
        console.log('updated meeting collection, _id: '+meetings[i]._id+', location: '+meetings[i].location);

      });

    }; // end updateLatLng


    Venue.findOrCreate({address:meetings[i].address}, function(err,venue,created) {

      if(err) res.send(err);

      // if we had to create a new document, get the LatLng from Google
      if(created || venue.latitude == null || venue.latitude == '') {


        return httpsGet(geocodeUrl+meetings[i].address).then(loadBody).then(function (coords) {
          var resObject = JSON.parse(coords);
          var geocode = resObject.results[0].geometry.location;

          console.log('ran geocode');
          geocount++;

          updateLatLng(i, geocode.lat, geocode.lng);

          // update in venue collection
          Venue.update({ address: meetings[i].address }, {
            $set: { location: {latitude: geocode.lat, longitude: geocode.lng }}
          }, function(err, ven) {
            if(err) res.send(err);
            console.log('updated venue collection');

            return deferred.resolve;
          });


        });

      }

      // otherwise, grab it from the existing document and resolve the promise
      else {
        console.log(JSON.stringify(venue));
        updateLatLng(i, venue.latitude, venue.longitude);
        return Q.defer().resolve;
      }

    }); // end Venue.findOrCreate


  }; // end getLatLng


  var coord_array = [];

  for(var i=0,max=meetings.length; i < max; i++) {

    // if this meeting already has its coordinates embedded...
    if (meetings[i].location.latitude != null) {

      console.log(i+': Address ['+meetings[i].address+'] already has Lat: '+meetings[i].location.latitude+', Lng: '+meetings[i].location.longitude);
    }

    // this meeting hasn't had its coordinates looked up before, queue it for geocoding
    else {
      coord_array.push(getLatLng(i));
      console.log('Queue: '+meetings[i].address);
    }

    // temporary: add the custom marker while we're stepping through
    // todo: switch markers depending on which program affiliation
    meetings[i].icon = "/images/aa_marker.png";
  }

  Q.all(coord_array).then(function (r) {
    //res.json(meetings);
    console.log(geocount);
  });

});