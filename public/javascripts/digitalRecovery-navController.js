/**
 * Created by Raydius on 1/23/16.
 */


angular.module('digitalRecovery').controller('navController', function($scope, $controller, $timeout, infoFactory, snapRemote) {

  // todo: define service to handle alert messages
  $scope.consoleMsg = '';



  // info window data
  $scope.mtgTitle = infoFactory.getTitle;
  $scope.mtgTime = infoFactory.getWhen;
  $scope.mtgAddress = infoFactory.getAddress;

  // default day filter to current day
  $scope.selectedDay = moment().format('E');
  $scope.days = [
    { id:"7", name: "Sunday" },
    { id:"1", name: "Monday" },
    { id:"2", name: "Tuesday" },
    { id:"3", name: "Wednesday" },
    { id:"4", name: "Thursday" },
    { id:"5", name: "Friday" },
    { id:"6", name: "Saturday" },
    { id:"0", name: "Show ALL" }
  ];


  $scope.selectedEarliestTime = 1830;
  $scope.selectedLatestTime = 1900;

  // used to control rate of refresh broadcasts
  $scope.okToRefresh = true;

  // broadcast for getMeetings in map scope
  $scope.refreshMeetings = function() {

    if($scope.okToRefresh == true) {

      $scope.$broadcast('refreshMeetings');
      $scope.okToRefresh = false;

      $timeout(function() {
        $scope.okToRefresh = true;
      }, 500);
    }
    else {
      console.log('refreshMeetings() has been ignored due to rate limiting')
    }

  };

  // close meeting detail rollup
  $scope.hideMeetingDetail = function() {
    var el = angular.element(document.querySelector('.meeting-detail-box'));
    el.removeClass('showMtgSummary');
  };


  // get hour of current time -- minimum 1 to prevent confusion at 'midnight'
  var defaultEarliest = Math.max(Math.floor(moment().format('HHmm')/100), 1);

  // configuration related to the time range slider
  $scope.timeSliderOptions = {
    start: [defaultEarliest, 24],
    connect: true,
    step: 1,
    range: {
      'min': 1,
      'max': 24
    }
  };
  $scope.timeSliderEventHandlers = {
    update: function(values, handle, unencoded) {
      $scope.earliestTime = $scope.hrToTime($scope.timeSliderOptions.start[0]);
      $scope.latestTime = $scope.hrToTime($scope.timeSliderOptions.start[1]);
    },
    slide: function(values, handle, unencoded) {},
    set: function(values, handle, unencoded) {},
    change: function(values, handle, unencoded) {
      $scope.earliestTime = $scope.hrToTime($scope.timeSliderOptions.start[0]);
      $scope.latestTime = $scope.hrToTime($scope.timeSliderOptions.start[1]);

      // update the map
      $scope.refreshMeetings();
    }
  };

  $scope.hrToTime = function(num) {

    // convert hour number to 4-digit 24hr time, adding leading zeroes if necessary
    var HHmmTime = ('0000' + (num*100)).substr(-4);

    // return readable 12hr format
    return moment(HHmmTime, 'HHmm').format('h:mm a');
  };

});