$.ajax({
    data: {
        url: 'http://api.brewerydb.com/v2/styles?key=075d4da050ae5fd39db3ded4fd982c92'
    },
    url: "serverProxy/proxy.php",
    method: "POST",
    dataType: 'json',
    success: function(result){
        for (var i=0; i<result.data.length; i++) {
            console.log(result.data[i].shortName);
        }
    },
    error: function(){
        console.log('error');
    }
});
//http://api.brewerydb.com/v2/styles