var map;
var infowindow;
var request;                                                    //[4] now global
var service;                                                     //[4]now global
var markers=[];                                                  //[4]now global n accessible thru whole program
function initialize(){
    var center = new google.maps.LatLng(33.6362183, -117.7394721); //we pick the coordinates, this centers the map to a location we want
    map = new google.maps.Map(document.getElementById('map'),{
        center: center,                                          //centers it for us
        zoom: 13                                                //how much we want to be zoomed in
    });
    request ={                                      //google needs a spec. formatted request to find what we're looking for
        location: center,                             //centered on our map
        radius: 8047,                                  //radius in meters, aka 5mi radius around center of map
        types: ['bar']                                 //looking for coffee
    };
    infowindow = new google.maps.InfoWindow(); //where info pops up for each cofffee shop, it opens info window on map
    service = new google.maps.places.PlacesService(map); //this creates a search for whatever we are looking for
    service.nearbySearch(request,callback);
    google.maps.event.addListener(map,'rightclick',function(event){  //wait and listen for right clicks, and when it does it sets them as location
        map.setCenter(event.latLng)
        clearResults(markers)
        var request = {                                              //mew request to search for request at that location where we right clicked
            location: event.latLng,
            radius: 8047,
            types:['bar']
        };
        service.nearbySearch(request,callback);                    //calls our search
    })
}
function callback (results,status){   //called from service object, makes sure we get back googd results and not an error from server
    if (status == google.maps.places.PlacesServiceStatus.OK){
        for (var i=0;i<results.length;i++){          //gets back all locations of coffee shop and adds them to a results array
            markers.push(createMarker(results[i])); //[4]
//                    createMarker(results[i]);
        }
    }
}
function createMarker(place){                        //creates and places the markers from above and plaves it on our map
    var placeLoc = place.geometry.location;
    marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location
    });
    google.maps.event.addListener(marker,'click',function(){   //add new event listener, when you click on amrkers, so they dont all pop up and cover the screen
        infowindow.setContent(place.name);
        infowindow.open(map,this);
    });
    return marker;
}
function clearResults(markers){                     //[4] clear markers off map every time we right click
    for (var m in markers){
        markers[m].setMap(null)
    }
    markers=[];                                      //clears out markers array so new right clicks are fresh
}

google.maps.event.addDomListener(window,'load',initialize); //add event listener load onto the window and call our initialize function

$(document).ready(function() {
    $("#beer_search").click(function(){
        $.post("http://www.thebeerspot.com/api/search",
            { "function" : "beer" ,
                "dev_key" : "0fe4833f7e7a2161304fc6f84b1b3320" ,
                "search_term" : "darkness",
                "limit" : "5" },
            function(response) {
                console.log(response);
                $.each(response, function() {
                    $.each(this, function(name, value) {
                        // add each item to a div on the page
                        $("#display").append(name + " : " + value + "<br />");
                    });
                    // throw a line break at the end of each item
                    $("#display").append("<br />");
                });

            });
    })
});
