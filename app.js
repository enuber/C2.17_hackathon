
/*****
 *  Global Variables
 ****/
/**
 * locationObj - Global Object to hold user's location
 * @type {object}
 *
 * yelp - Global Object that holds the response returned by a successful AJAX call to Yelp API
 * @type {object}
 */
var foodPairings;
var yelp = { coords: [] };
var locationObj = {
    lat : null,
    lng : null
};
var contactInfo = [];
/**
 * Global Google Entities
 */
var map;
var geocoder;
var infoWindow;
var markers = [];
var origin = null;
var destination = {};
var directionsDisplay = new google.maps.DirectionsRenderer();

/*****
 * Functions
 ****/
$(document).ready(function(){
    startUp();
});

/**
 * Creates the google map and geocoder, applies all click handlers, displays the modal
 */
function startUp () {
    initialize();
    applyClickHandlers();
    modalDisplay();
}

/**
 *  Creates Google Map object and Google Geocoder object
 */
function initialize() {
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
    infoWindow = new google.maps.InfoWindow();
}

/**
 * Applies all click handlers
 */
function applyClickHandlers(){
    $('#submitBeerButton').click(submitBeerSelection);
    $(".currentLoc").click(getLocation);
    $(".submit").click(codeAddress);
    $('#tapButton').click(modalDisplay);
    $('#beerModal').modal({
        backdrop: 'static',
        keyboard: false
    });
    $('#locationInput').keypress(submitWithEnterKey);
}

/**
 * Displays the modal
 */
function modalDisplay() {
    directionsDisplay.setMap(null);
    $('.alert-success').css('display','none');
    $("#beerModal").modal();
}

/**
 * Displays the alert inside the modal
 */
function modalAlert(){
    if (locationObj.lng === null){
        $('.alert-danger').css('display', 'block');
    } else{
        $('.alert-danger').css('display','none');
        $('.alert-success').css('display','block');
    }
}

/**
 *  Creates Contact Info object from the yelp AJAX call.
 *  @param      response:    {object} Is the response from the ajax call to yelp
 */
function createContactInfo(response) {
    for (var i=0; i<response.businesses.length; i++) {
        var addressInfo = {};
        addressInfo.name = response.businesses[i].name;
        addressInfo.address = response.businesses[i].location.address[0];
        addressInfo.city = response.businesses[i].location.city;
        addressInfo.state = response.businesses[i].location.state_code;
        addressInfo.zip = response.businesses[i].location.postal_code;
        addressInfo.phone = response.businesses[i].display_phone;
        if (addressInfo.phone != undefined) {
            addressInfo.phone = addressInfo.phone.substring(1);
        }
        addressInfo.url = response.businesses[i].url;
        contactInfo.push(addressInfo);
    }
}

/**
 * Creates markers on the map, stores into global markers, and handles click event for the markers and map
 *  @param      response:    {object} Is the response from the ajax call to yelp
 */
function createMarker(response) {
    createContactInfo(response);
    // var image="http://emojipedia-us.s3.amazonaws.com/cache/bb/cc/bbcc10a5639af93ab107cc2349700533.png"
    var image="images/beer.png";
    for (var i = 0; i < yelp.coords.length; i++) {
        var coordinates = yelp.coords[i];
        var marker = new google.maps.Marker({
            map: map,
            icon: image,
            position: coordinates,
            animation: google.maps.Animation.DROP,
            html:  '<div class="markerWindow">' +
            '<h1>' + contactInfo[i].name + '</h1>' +
            '<p>' + contactInfo[i].address + '</p>' +
            '<p>' + contactInfo[i].city + ', ' + contactInfo[i].state + ' ' + contactInfo[i].zip +'</p>' +
            '<p>' + contactInfo[i].phone + '</p>' +
            '<a target="_blank" href=' + contactInfo[i].url + '> reviews </a>' +
            '<a class="directions">get directions</a>' +
            '</div>'
        });
        markers.push(marker);
        google.maps.event.addListener(marker, 'click', function() {
            infoWindow.setContent(this.html);
            infoWindow.open(map, this);
            map.setCenter(this.getPosition());
            (function(self) {
                destination = self.position;
            })(this);
        });
        google.maps.event.addListener(map, 'click', function(){
            infoWindow.close();
        });
    }
}

/**
 * Removes all markers from the map, empties global markers
 */
function clearMarkers() {
    for (var m in markers) {
        markers[m].setMap(null)
    }
    markers = [];
}

/**
 * Gets the location the user specifies and centers map on that location.  Stores user location to a global
 */
function codeAddress() {
    var address = $(".address").val();
    origin = address;
    geocoder.geocode({'address': address}, function(results, status){
        if (status == 'OK'){
            map.setCenter(results[0].geometry.location);
            locationObj = address;
            modalAlert();
        } else {
            modalAlert();
        }
    })
}

/**
 * Allows user to press Enter key on Keyboard to submit their location
 * @fires codeAddress()
 */
function submitWithEnterKey() {
    if (event.keyCode === 13)
        $('#findLocationButton').click();
}

/**
 *  Get the current location of the user and center map on that location (if the user allows).  Stores user location to a global
 */
function getLocation() {
    if (navigator.geolocation) {
        $('#submitBeerButton').addClass('disabled').off('click',submitBeerSelection);
        var geoSuccess = function (position) {
            var pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(new google.maps.LatLng(pos.lat, pos.lng));
            locationObj = {};
            locationObj.lat = pos.lat;
            locationObj.lng = pos.lng;
            $('#submitBeerButton').removeClass('disabled').on('click',submitBeerSelection);
            modalAlert();
        };
        navigator.geolocation.getCurrentPosition(geoSuccess);
    } else {
        modalAlert();
    }
}

/**
 *  Get directions from users current location to their destination marker on the map.
 */
function getDirections(origin, destination) {
    var directionsService = new google.maps.DirectionsService();
    var request = { origin: origin,
        destination: destination,
        travelMode: 'DRIVING'
    };
    directionsDisplay.setMap(null);
    directionsDisplay.setMap(map);
    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            directionsDisplay.setDirections(result);
        }
    });
}

/**
 *  calls Yelp API and BreweryDB API with user's selected data
 *  @fires      callFoodPairings()      AJAX request to BreweryDB API
 *  @fires      callYelp()              AJAX request to Yelp API
 */
function submitBeerSelection(){
    if (locationObj.lat === null){
        $('.alert-danger').css('display','block');
    } else{
        $('#submitBeerButton').attr('data-dismiss', 'modal');
    }
    $('#domContainer').html('');
    $('#beginSearch').css('display','initial');
    callFoodPairings();
    callYelp(getYelpKeyword(),locationObj);
}

/**
 * Calls BreweryDB API to get the Food Pairings
 */
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
        error: function (error) {
            console.error('error', error);
        }
    });
}

/**
 * Appends the data from the BreweryDB AJAX call to the DOM
 */
function foodPairingDomCreation(){
    var $div = $('<div>',{
        text: foodPairings,
        class: "domFoodPair col-xs-6 col-sm-6 pull-right"
    });
    $('#domContainer').append($div);
}

/**
 *  @returns {string} User's selected option of the radio inputs, to use for callYelp function
 */
function getYelpKeyword(){
    return $('input:checked').attr('yelpKeyWord');
}

/** @summary Does an AJAX call on the Yelp API and assigns the response to the global var 'yelp'
 *
 * Yelp searches require only a location, either as a string, or latitude and longitude.
 * The location parameter passed in will be either a string or an object; whichever the user inputted last.
 * All other parameters and properties are optional. Currently, no other parameters are passed in, but the functionality works
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
        term: keywords
    };
    if (typeof location === "object" && location.lat != null && location.lng != null){
        searchQuery.latitude = location.lat;
        searchQuery.longitude = location.lng;
    } else {
        searchQuery.location = location;
    }
    $.ajax({
        data: searchQuery,
        url: "serverProxy/yelp/access.php",
        method: "GET",
        dataType: 'json',
        success: function (response) {
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
            $('#map').on("click", ".directions", function() {
                if (origin === null) {
                    origin = locationObj;
                }
                getDirections(origin, destination);
            });
        },
        error: function (error) {
            console.error("error: ", error);
        }
    });
}



