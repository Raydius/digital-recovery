/**
 * Created by raydollete on 12/15/15.
 */

angular.module('digitalRecovery',['uiGmapgoogle-maps','snap','angularMoment','ya.nouislider','ngAnimate']);

// app config
angular.module('digitalRecovery').config(function(uiGmapGoogleMapApiProvider, snapRemoteProvider) {

	// initialize google maps API
	uiGmapGoogleMapApiProvider.configure({
		key: 'AIzaSyCZNWrEMagiRmT10taDru4p0ZMfWq8qVEs',
		v: '3', //defaults to latest 3.X
		libraries: '	weather,geometry,visualization'
	});

	// setup Snap options
	snapRemoteProvider.globalOptions = {
		hyperextensible: false
	};

});

// service to handle data sent to the pop-up info window
angular.module('digitalRecovery').factory('infoFactory', function() {

	var infoDetails = {
		title:'Test Meeting',
		address:'123 Fake St',
		day_of_week:'Tuesday',
		start_time:'7:00 PM'
	};
	var title = 'referred factory title';

	return {
		setInfo: function(title, address, day_of_week, start_time) {
			infoDetails = {
				title:title,
				address:address,
				day_of_week:day_of_week,
				start_time:start_time
			};
			return infoDetails;
		},
		getWhen: function() {
			return infoDetails.day_of_week + ' ' + infoDetails.start_time;
		},
		getTitle: function() {
			return infoDetails.title;
		},
		getAddress: function() {
			return infoDetails.address;
		}
	};
});

