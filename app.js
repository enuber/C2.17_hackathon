
var map;
var infoWindow;
var locationObj = {
    lat : null,
    long : null
};
var markers = [];
var geocoder;
var tempCoors = [{lat: 33.636193,lng: -117.739393},{lat: 33.643590, lng:-117.743731},{lat: 33.646095,lng:-117.744373}];

function initialize() {
    geocoder = new google.maps.Geocoder();
    var center = new google.maps.LatLng(37.09024, -100.712891);
    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 13,
        panControl: false,
        mapTypeControl: false,
        zoomControl: true,
        streetViewControl: false,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.LARGE,
            position: google.maps.ControlPosition.TOP_RIGHT
        },
        scaleControl: true
    });

    infoWindow = new google.maps.InfoWindow();  // can add content here
}
function createMarker() {
    for (var i = 0; i < tempCoors.length; i++) {
        var coordinates = tempCoors[i];
        var marker = new google.maps.Marker({
            map: map,
            position: coordinates
        });
        markers.push(marker);
    }
    google.maps.event.addListener(marker, 'click', function() {
        infoWindow.setContent(place.name);
        infoWindow.open(map, this);
    });
}

function clearResults(markers) {
    for (var m in markers) {
        markers[m].setMap(null)
    }
    markers = [];
}

function codeAddress() {
    var address = $(".address").val();
    geocoder.geocode({'address': address}, function(results, status){
        if (status == 'OK'){
            map.setCenter(results[0].geometry.location);
            var marker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location
            });
        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    })
}

function getLocation() {
    var coordinates = {};
    if (navigator.geolocation) {
        var geoSuccess = function (position) {
            var pos = {
                lat : position.coords.latitude,
                lng : position.coords.longitude
            };
            coordinates.lat = pos.lat;
            coordinates.long = pos.lng;
            map.setCenter(new google.maps.LatLng(pos.lat, pos.lng));
            locationObj.lat = pos.lat;
            locationObj.long = pos.lng;
        };

        navigator.geolocation.getCurrentPosition(geoSuccess);
    } else {
        console.log("Geolocation is not supported for this Browser/OS");
    }
}

//Donald's Yelp Code
/** @summary Does an AJAX call on the Yelp API and assigns the response to the global var 'yelp'
 *
 * Yelp searches require only a location, either as a string, or latitude and longitude.
 * All other parameters and properties are optional.
 *
 * The global var 'yelp' is a copy of the response object. "yelp['coords']" contains an array of
 * all the latitudes and longitudes of all the businesses in the response.
 *
 * @param       keywords:   {string} Search Terms
 * @param       location:   {string} address, neighborhood, city, state or zip, optional country
 *                          {object} Latitude, Longitude
 *
 * @example     location:   "Irvine, CA"
 *              keywords:   "Stout Beer"
 *
 **/
function callYelp(keywords, location){
    // if (typeof location === "object" && !isNaN(location.lat) && !isNaN(location.long)){
    //     long;
    // }
    $.ajax({
        data: {
            "term": keywords,
            "location": location,
            "limit": 11,
            "latitude": -25.363,
            "longitude": 131.044
        },
        url: "serverProxy/yelp/access.php",
        method: "GET",
        dataType: 'json',
        success: function (response) {
            console.log("success: ", response);
            console.log(response.businesses.length);
            console.log(response.businesses[0].name);
            yelp = response;
            yelp.coords = [];
            for (var i = 0;i < response.businesses.length; i++){
                yelp.coords[i] = response.businesses[i].location.coordinate;
                console.log(response.businesses[i].location.coordinate);
            }
        },
        error: function (error) {
            console.log("error: ", error);
        }
    });
}
var yelp = { coords: [] };
callYelp("tonkotsu ramen", "Torrance, CA");

function startUp () {
    initialize();
    applyClickHandlers();
}
$(document).ready(function(){
    startUp();
});
var foodPairings;
function callFoodPairings() {
    var beerSelected = $('input:checked').val();
    $.ajax({
        data: {
            url: 'http://api.brewerydb.com/v2/beers?key=075d4da050ae5fd39db3ded4fd982c92&name=' + beerSelected
        },
        url: 'serverProxy/proxy.php',
        method: 'GET',
        dataType: 'json',
        success: function (result) {
            for (var i = 0; i < result.data.length; i++) {
                if (result.data[i].foodPairings !== undefined) {
                    foodPairings = result.data[i].foodPairings;
                }
            }
        },
        error: function () {
            console.log('error')
        }
    });
}
function submitBeerSelection(){
    // $('#modalContainer').css('display','none');
    $('#domContainer').html('');
    $('#beginSearch').css('display','initial');
    callFoodPairings();
    setTimeout(foodPairingDomCreation,1400);

}
function findYourBeerInit(){
    $('#modalContainer').css('display','initial');
    $('#beginSearch').css('display','none');
    $('#domContainer').html('');
}
function applyClickHandlers(){
    $('#submitBeerButton').click(submitBeerSelection);
    $('#beginSearch').click(findYourBeerInit);
    $(".currentLoc").click(getLocation);
    $(".submit").click(codeAddress);
}
function foodPairingDomCreation(){
    var $div = $('<div>',{
       text: foodPairings,
       class: "domFoodPair"
    });
    $('#domContainer').append($div);
}

var imageContainer = {

}
