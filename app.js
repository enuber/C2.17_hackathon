
/**
 *  Global Variables
 */
/**
 * locationObj - Global Object to hold user's location
 * @type {object}
 *
 * yelp - Global Object that holds the response returned by a successful AJAX call to Yelp API
 *
 * @type {object}
 */

var map;
var infoWindow;
var yelp = { coords: [] };
var locationObj = {
    lat : null,
    long : null
};
var contactInfo = [];
var markers = [];
var geocoder;
// var tempCoors = [{lat: 33.636193,lng: -117.739393},{lat: 33.643590, lng:-117.743731},{lat: 33.646095,lng:-117.744373}];

function initialize() {
    /**
     *
     */
    geocoder = new google.maps.Geocoder();
    var center = new google.maps.LatLng(37.09024, -100.712891);
    map = new google.maps.Map(document.getElementById('map'), {
        center: center,
        zoom: 12,
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
/**
 *
 */
function createContactInfo(response) {
    console.log(response);
    for (var i=0; i<response.businesses.length; i++) {
        var addressInfo = {}
        addressInfo.name = response.businesses[i].name;
        addressInfo.address = response.businesses[i].location.address[0];
        addressInfo.city = response.businesses[i].location.city;
        addressInfo.state = response.businesses[i].location.state_code;
        addressInfo.zip = response.businesses[i].location.postal_code;
        addressInfo.phone = response.businesses[i].display_phone;
        addressInfo.phone = addressInfo.phone.substring(1);
        addressInfo.url = response.businesses[i].url;
        contactInfo.push(addressInfo);
    }
}
/**
 *
 */
function createMarker(response) {
    createContactInfo(response);
    for (var i = 0; i < yelp.coords.length; i++) {
        var coordinates = yelp.coords[i];
        var marker = new google.maps.Marker({
            map: map,
            position: coordinates,
            html:  '<div class="markerWindow">' +
            '<h1>' + contactInfo[i].name + '</h1>' +
            '<p>' + contactInfo[i].address + '</p>' +
            '<p>' + contactInfo[i].city + ', ' + contactInfo[i].state + ' ' + contactInfo[i].zip +'</p>' +
            '<p>' + contactInfo[i].phone + '</p>' +
            '<a target="_blank" href=' + contactInfo[i].url + '> website </a>' +
            '</div>'
        });

        markers.push(marker);
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent(this.html);
            infoWindow.open(map, this);
        });
    }

}
/**
 *
 */
function clearMarkers() {
    for (var m in markers) {
        markers[m].setMap(null)
    }
    markers = [];
}
/**
 *
 */
function codeAddress() {
    var address = $(".address").val();
    geocoder.geocode({'address': address}, function(results, status){
        if (status == 'OK'){
            map.setCenter(results[0].geometry.location);
            locationObj = address;

            // var marker = new google.maps.Marker({
            //     map: map,
            //     position: results[0].geometry.location
            // });

        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    })
}
/**
 *  Get the current location of the user and center map on that location, if the user allows
 */
function getLocation() {
    var coordinates = {};
    if (navigator.geolocation) {
        var geoSuccess = function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            coordinates.lat = pos.lat;
            coordinates.long = pos.lng;
            map.setCenter(new google.maps.LatLng(pos.lat, pos.lng));
            locationObj = {};
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
 * The location parameter passed in will be either a string or an object; whichever the user inputted last
 *
 * This function sets the global var 'yelp' to the response object. "yelp['coords']" contains an array of
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
    var searchQuery = {
        term: keywords,
        limit: 11
    };
    if (typeof location === "object" && location.lat != null && location.long != null){
        searchQuery.latitude = location.lat;
        searchQuery.longitude = location.long;
    } else {
        searchQuery.location = location;
    }
    $.ajax({
        data: searchQuery,
        url: "serverProxy/yelp/access.php",
        method: "GET",
        dataType: 'json',
        success: function (response) {
            console.log(response.businesses.length);
            yelp = response;
            yelp.coords = [];
            for (var i = 0;i < response.businesses.length; i++){
                yelp.coords[i] = {
                    lat: response.businesses[i].location.coordinate.latitude,
                    lng: response.businesses[i].location.coordinate.longitude
                };
            }
            clearMarkers();
            createMarker(response);
        },
        error: function (error) {
            console.log("error: ", error);
        }
    });
}
/**
 *  @returns {string} User's selected option of the radio inputs, to use for callYelp function
 */
function getYelpKeyword(){
    return $('input:checked').attr('yelpKeyWord');
}

function startUp () {
    initialize();
    applyClickHandlers();
    modalDisplay();
}
$(document).ready(function(){
    startUp();
});
var foodPairings; //@todo place global at the top of the page
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
            foodPairingDomCreation();
        },
        error: function () {
            console.log('error')
        }
    });
}
function submitBeerSelection(){
    $('#domContainer').html('');
    $('#beginSearch').css('display','initial');
    yelpKeyWord = $('input:checked').attr('yelpKeyWord');
    callFoodPairings();
    callYelp(getYelpKeyword(),locationObj);

}
// function findYourBeerInit(){
//     $('#modalContainer').css('display','initial');
//     $('#beginSearch').css('display','none');
//     $('#domContainer').html('');
// }
function applyClickHandlers(){
    $('#submitBeerButton').click(submitBeerSelection);

//  $('#beginSearch').click(findYourBeerInit);
//  $('#getLocationButton').click(getLocation);
    $(".currentLoc").click(getLocation);
    $(".submit").click(codeAddress);
    $('#titleContainer').click(modalDisplay);
    // $(".close").on("click", function(){
    //     alert("Please Enter A Location");
    // });
    $('#findLocationButton').click(modalAlert);
    $('#myModal').modal({
        backdrop: 'static',
        keyboard: false
    })


}
function foodPairingDomCreation(){
    var $div = $('<div>',{
       text: foodPairings,
       class: "domFoodPair col-xs-8 col-sm-5 pull-right"
    });
    $('#domContainer').append($div);
}

function modalDisplay() {
    $("#myModal").modal();

}
function modalAlert(){
    $('.alert-success').css('display','block');
}
