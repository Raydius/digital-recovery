var geocoder;
var map;
function initMap() {
	geocoder = new google.maps.Geocoder();
	var latlng = new google.maps.LatLng(34.05, -118.24);
	var mapOptions = {
		zoom: 12,
		center: latlng
	}
	map = new google.maps.Map(document.getElementById("map"), mapOptions);
}

function codeAddress() {
	var address = document.getElementById("address").value;
	geocoder.geocode( { 'address': address}, function(results, status) {
		if (status == google.maps.GeocoderStatus.OK) {
			map.setCenter(results[0].geometry.location);
			var marker = new google.maps.Marker({
				map: map,
				position: results[0].geometry.location
			});
			var lat = results[0].geometry.location;
			var lng = '';
			//var lng = results[0].geometry.location[1];

			alert('Lat: '+lat+', Lng: '+lng);
		}
		else {
			alert("Geocode was not successful for the following reason: " + status);
		}
	});
}