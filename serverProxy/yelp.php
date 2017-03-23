<?php

$ch = curl_init('https://api.yelp.com/v3/businesses/search?term=delis&latitude=37.786882&longitude=-122.399972"');
//    $headers = $_GET['headers'];
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
// set headers
//$headers = [];
foreach(($_GET['headers']) as $key=>$value){
    $headers[] = "$key: $value";
}
//curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$response['data'] = curl_exec($ch);
curl_close($ch);
print(json_encode($response));


?>