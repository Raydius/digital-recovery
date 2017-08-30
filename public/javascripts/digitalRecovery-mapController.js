

angular.module('digitalRecovery').controller('mapController', function($scope, $controller, $http, $animate, uiGmapGoogleMapApi, uiGmapIsReady, infoFactory, snapRemote) {

  // listen for broadcasts from other scopes to update meeting markers
  $scope.$on('refreshMeetings', function(e) {
    $scope.$emit('ping', $scope.getMeetings());
  });


  // create promise -- executes after successfully connecting to maps API
  uiGmapGoogleMapApi.then(function(maps) {

    // flag to prevent preloading markers before GPS localization
    $scope.okToGetMeetings = true;
    console.log('okToGetMeetings','true');

    $scope.meetings = [];

    // start with a default Los Angeles center/zoom to launch the map object
    $scope.map = {
      center: { latitude: 34.05, longitude: -118.24 },
      zoom: 12,
      pan: true,
      options: {
        disableDefaultUI:true,
        zoomControl:true
      },
      // map-level event listeners
      events: {

        // whenever the map loads and is idle...
        idle: function(map) {
          if($scope.okToGetMeetings == true) {

            // get new bounds based on current map view
            var bounds = map.getBounds().toJSON();

            //var sw = bounds.getSouthWest();
            //var ne = bounds.getNorthEast();

            // ~34 range is a latitude
            // ~-118 range is a longitude

            // sw, ne: ((34.003216478841935, -118.44515682049553), (34.04689390126006, -118.34155917950432))

            var sw = {
              lat: bounds.south,
              lng: bounds.west
            };

            var ne = {
              lat: bounds.north,
              lng: bounds.east
            };

            var nw = {
                lat: ne.lat,
                lng: sw.lng
            };
            var se = {
                lat: sw.lat,
                lng: ne.lng
            };

            console.log('NE: ',ne);
            console.log('NW: ',nw);
            console.log('SE: ',se);
            console.log('SW: ',sw);




            // create GeoJSON polygon to represent bounds
            /*$scope.geoView = {
              "type": "Polygon",
              "coordinates": [[
                [bounds.Aa.G, bounds.Ga.G],            // NW-LNG, NW-LAT
                [bounds.Aa.G, bounds.Ga.j],            // NE-LNG, NE-LAT
                [bounds.Aa.j, bounds.Ga.j],            // SE-LNG, SE-LAT
                [bounds.Aa.j, bounds.Ga.G],            // SW-LNG, SW-LAT
                [bounds.Aa.G, bounds.Ga.G]             // NW-LNG, NW-LAT
              ]]
            };*/

            /*$scope.geoView = {
                "type": "Polygon",
                "coordinates": [[
                    [nw.lng, nw.lat],
                    [ne.lng, ne.lat],
                    [se.lng, se.lat],
                    [sw.lng, sw.lat],
                    [nw.lng, nw.lat]
                ]]
            };*/

            $scope.geoView = {
              "type": "Polygon",
              "coordinates": [[
                  [nw.lng, nw.lat],
                  [ne.lng, ne.lat],
                  [se.lng, se.lat],
                  [sw.lng, sw.lat],
                  [nw.lng, nw.lat]
              ]]
            };

            console.log('set geoView',$scope.geoView);

            $scope.getMeetings(map);
          }

          // reset binding
          $scope.$apply(function () {
            $scope.mapInstance = map;
          });

        }, // end events:idle

        click: function(map) {
          console.log('map click');
          $scope.hideInfoWindow().then(function () {
            $scope.closeDrawers();
          });

        }, // end events:click

        dragstart: function(map) {
          console.log('map drag');
          $scope.hideInfoWindow().then(function () {
            $scope.closeDrawers();
          });
        } // end events:dragstart

      } // end events

    }; // end $scope.map


  }); // end uiGmapGoogleMapApi


  // function to run only after the first time the map loads
  // this gets all (ready) map instances - defaults to 1 for the first map
  uiGmapIsReady.promise().then(function(instances) {

    // instances is an array object -- if only 1 map it's found at index 0 of array
    var map = instances[0].map;

    // this function will only be applied on initial map load (once ready)
    $scope.centerWithGPS(map);
  });


  // access API to retrieve meetings
  $scope.getMeetings = function() {

    // create filter object
    var filters = {
      "day":$scope.selectedDay,
      "earliestTime":$scope.earliestTime,
      "latestTime":$scope.latestTime
    };

    console.log('geoView',$scope.geoView);
    console.log('filters',filters);

    // query for markers
    $http.post('/api/meetings', {geoView: $scope.geoView, filters: filters})
      .success(function (data) {
        $scope.meetings = data;
        $scope.consoleMsg = '';
      })
      .error(function (data) {
        console.log(data);
        $scope.consoleMsg = 'Error while searching for meetings.';
    });


  };

  // re-center the map with GPS
  $scope.centerWithGPS = function(map) {

    // if this browser supports GPS geolocation...
    if(navigator.geolocation) {

      // get the current position as a basis for search
      navigator.geolocation.getCurrentPosition(function(position) {

        // set the center of the map to the current location
        map.panTo({
          lat:position.coords.latitude,
          lng:position.coords.longitude
        });
        // zoom in closer to current location
        map.setZoom(14);
        $scope.okToGetMeetings = true;
		  console.log('okToGetMeetings','true');

      }, function() {
        //handleNoGeolocation(browserSupportFlag);

      });
    }
    else {
      // if no GPS, zoom in and get meetings anyway
      $scope.okToGetMeetings = true;
		console.log('okToGetMeetings','true');
      map.setZoom(14);
      console.log('browser doesn\'t support geolocation');
    }

  }; // end $scope.centerWithGPS()

  // controller action for when a user clicks on a marker
  $scope.onMarkerClick = function(marker, eventName, model) {

    // center the marker
    $scope.mapInstance.panTo({
      lat:marker.getPosition().lat(),
      lng:marker.getPosition().lng()
    });

    // change marker icon
    // info here: https://developers.google.com/maps/documentation/javascript/reference?csw=1#MarkerImage
    // marker.setIcon

    // update info window details
    infoFactory.setInfo(model.title, model.address, model.day_of_week, model.time);

    // show info window, close any drawers that are open
    var el = angular.element(document.querySelector('.meeting-detail-box'));
    $animate.addClass(el, 'showMtgSummary').then(function() {
      $scope.closeDrawers();
    });


    // disable default marker behavior
    return true;

  }; // end onMarkerClick

  $scope.hideInfoWindow = function() {
    var el = angular.element(document.querySelector('.meeting-detail-box'));
    return $animate.removeClass(el, 'showMtgSummary');
  };

  // promisify the closing of the snapJS drawers
  $scope.closeDrawers = function() {
    snapRemote.close();
  };


});

