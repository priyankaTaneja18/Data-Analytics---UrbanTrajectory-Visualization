//Init Map
//*******************************************************************************************************************************************************
var lat = 41.141376;
var lng = -8.613999;
var zoom = 14;
 var theMarker=[];
 var startpoint=[]
var dropoffpoint=[]
var marker1;
var marker2;
var markerlist=[];
var showPath= true;
var taxi_id_map = new Map();
var distinct_street_names = [];
var streetNames;

console.log("streetnames" + streetNames);

var picon = L.icon({
    iconUrl: '\js\\images\\greenMarker.png',
    iconSize:     [40, 40], // size of the icon

	});

	var dicon = L.icon({
		iconUrl: '\js\\images\\redMarker.png',
		iconSize:     [40, 40], // size of the icon

	});
for(i=0;i<trips.features.length;i++){
 taxi_id_map.set(trips.features[i].properties.taxiid,'#'+Math.floor(Math.random()*16777215).toString(16));
}



// add an OpenStreetMap tile layer
var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery Â© <a href="http://mapbox.com">Mapbox</a>',
    mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoicGxhbmVtYWQiLCJhIjoiemdYSVVLRSJ9.g3lbg_eN0kztmsfIPxa9MQ';


var grayscale = L.tileLayer(mbUrl, {
        id: 'mapbox.light',
        attribution: mbAttr
    }),
    streets = L.tileLayer(mbUrl, {
        id: 'mapbox.streets',
        attribution: mbAttr
    });


var map = L.map('map', {
    center: [lat, lng], // Porto
    zoom: zoom,
    layers: [streets],
    zoomControl: true,
    fullscreenControl: true,
    fullscreenControlOptions: { // optional
        title: "Show me the fullscreen !",
        titleCancel: "Exit fullscreen mode",
        position: 'bottomright'
    }
});




var baseLayers = {
    "Grayscale": grayscale, // Grayscale tile layer
    "Streets": streets, // Streets tile layer
};



layerControl = L.control.layers(baseLayers, null, {
    position: 'bottomleft'
}).addTo(map);

this.layer=L.geoJson(trips,
  {style : tripsStyle,
    onEachFeature: onEachFeature
  }
).addTo(map);


//*********************************************************************************************************
//**************************** onEachFeature function for Defalut layer ***********************************
//*********************************************************************************************************

function onEachFeature(features, layer) {
  //bind click

  layer.on('click', function(e){

    console.log('on eachh'+showPath);
    if(showPath){

	if(theMarker.length>0){
		for(var i=0;i<theMarker.length;i++){
			 map.removeLayer(theMarker[i]);
		}

	}
    for(i=0;i<trips.features.length;i++){
      if(features.properties.taxiid == trips.features[i].properties.taxiid){
        trips.features[i].properties.highlight =true;

        startpoint = trips.features[i].geometry.coordinates[0];
        dropoffpoint = (trips.features[i].geometry.coordinates[trips.features[i].geometry.coordinates.length-1]);

        marker1 =L.marker([startpoint[1], startpoint[0]],{icon: picon}).bindPopup( 'Average Speed: <b>' + trips.features[i].properties.avspeed +'</b><br>Trip Id: <b>' + trips.features[i].properties.tripid +'</b>'
        +'</b><br>Taxi Id: <b>' + trips.features[i].properties.taxiid +'</b><br>Duration: <b>' +'</b>'+ trips.features[i].properties.duration +'</b>').addTo(map);
        marker2 = L.marker([dropoffpoint[1], dropoffpoint[0]],{icon: dicon}).bindPopup( 'Average Speed: <b>' + trips.features[i].properties.avspeed +'</b><br>Trip Id: <b>' + trips.features[i].properties.tripid +'</b>'
        +'</b><br>Taxi Id: <b>' + trips.features[i].properties.taxiid +'</b><br>Duration: <b>' +'</b>'+ trips.features[i].properties.duration +'</b>').addTo(map);
        //markers();
        ////////////////////priyanka//////////////////////
        var coord=[];

        var points=[];
        coord=trips.features[i].geometry.coordinates;
        for(var k=0;k<coord.length;k++){
          points.push( new L.LatLng((coord[k])[1],(coord[k])[0]));
        }
        var line=L.polyline(points,{ opacity:0 });
        map.addLayer(line);
        var animatedMarker = L.animatedMarker(line.getLatLngs());
				map.addLayer(animatedMarker);
        /////////////////////////////////////////////////
        markerlist.push(marker1);
        markerlist.push(marker2);
		theMarker.push(marker1);
		theMarker.push(marker2);
		theMarker.push(animatedMarker);
          markerlist.push(animatedMarker);

      }
    }
    hideLayers();

    }
  });
  map.on('click', function (e) {
    //having trouble with resetStyle, so just change it back
    style : tripsStyle
    showLayers();

  });

  }

//*********************************************************************************************************
// Initialise the FeatureGroup to store editable layers
//*********************************************************************************************************
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

var featureGroup = L.featureGroup();

var drawControl = new L.Control.Draw({
    position: 'bottomright',
	collapsed: false,
    draw: {
        // Available Shapes in Draw box. To disable anyone of them just convert true to false
        polyline: false,
        polygon: false,
        circle: false,
        rectangle: true,
        marker: false,
    }

});

map.addControl(drawControl); // To add anything to map, add it to "drawControl"
//*******************************************************************************************************************************************************
//*****************************************************************************************************************************************
// Index Road Network by Using R-Tree
//*****************************************************************************************************************************************
var rt = cw(function(data,cb){
	var self = this;
	var request,_resp;
	importScripts("js/rtree.js");
	if(!self.rt){
		self.rt=RTree();
		request = new XMLHttpRequest();
		request.open("GET", data);
		request.onreadystatechange = function() {
			if (request.readyState === 4 && request.status === 200) {
				_resp=JSON.parse(request.responseText);
				self.rt.geoJSON(_resp);
				cb(true);
			}
		};
		request.send();
	}else{
		return self.rt.bbox(data);
	}
});

rt.data(cw.makeUrl("js/trips.json"));
//*****************************************************************************************************************************************
//*****************************************************************************************************************************************
// Drawing Shapes (polyline, polygon, circle, rectangle, marker) Event:
// Select from draw box and start drawing on map.
//*****************************************************************************************************************************************

map.on('draw:created', function (e) {

	var type = e.layerType,
		layer = e.layer;

	if (type === 'rectangle') {
		//console.log(layer.getLatLngs()); //Rectangle Corners points
		var bounds=layer.getBounds();
		rt.data([[bounds.getSouthWest().lng,bounds.getSouthWest().lat],[bounds.getNorthEast().lng,bounds.getNorthEast().lat]]).
		then(function(d){var result = d.map(function(a) {return a.properties;});
		//console.log(result);		// Trip Info: avspeed, distance, duration, endtime, maxspeed, minspeed, starttime, streetnames, taxiid, tripid
		map.fitBounds(layer.getBounds());

		DrawRS(result);
		});
	}

	drawnItems.addLayer(layer);			//Add your Selection to Map
});
//*****************************************************************************************************************************************
// DrawRS Function:
// Input is a list of road segments ID and their color. Then the visualization can show the corresponding road segments with the color
// Test:    var input_data = [{road:53, color:"#f00"}, {road:248, color:"#0f0"}, {road:1281, color:"#00f"}]; DrawRS(input_data);
//*****************************************************************************************************************************************
function DrawRS(trips) {
	for (var j=0; j<trips.length; j++) {  // Check Number of Segments and go through all segments
		var TPT = new Array();
		TPT = TArr[trips[j].tripid].split(',');  		 // Find each segment in TArr Dictionary.
		var polyline = new L.Polyline([]).addTo(drawnItems);
        polyline.setStyle({
            color: 'red',                      // polyline color
			weight: 1,                         // polyline weight
			opacity: 0.5,                      // polyline opacity
			smoothFactor: 1.0
        });
		for(var y = 0; y < TPT.length-1; y=y+2){    // Parse latlng for each segment
			polyline.addLatLng([parseFloat(TPT[y+1]), parseFloat(TPT[y])]);
		}
	}
}

//*********************************************************************************************************
//**************************** Show Max Duration Functionality ********************************************
//*********************************************************************************************************

function showMaxDuration(){
	document.getElementById("lowrange").value = 0;
	document.getElementById("highrange").value = 100;
	document.getElementById("highrange").parentNode.dataset.ubound=100;
	document.getElementById("highrange").parentNode.dataset.lbound=0;
  document.getElementById("streets").value = 'Select Street';

  if (streetNames != undefined)
  {
  map.removeLayer(streetNames)
  }

	showPath=false;
	if(theMarker.length>0){
		for(var i=0;i<theMarker.length;i++){
			 map.removeLayer(theMarker[i]);
		}

	}
	showLayers();

	var icon = L.icon({
    iconUrl: '\js\\images\\taxi.gif',
    iconSize:     [20, 20], // size of the icon

	});
	var duration=[];


	var len= trips.features.length;
	for(var i=0;i<len;i++){
		duration[i]= trips.features[i].properties.duration;
	}
	var topDurationValues = duration.sort((a,b) => b-a).slice(0,5);

	var latlongs=[];

	for(var i=0;i<len;i++){
		if(topDurationValues.indexOf(trips.features[i].properties.duration) !=-1){
			var sx= (trips.features[i].geometry.coordinates[0])[1];
			var sy= (trips.features[i].geometry.coordinates[0])[0];

			var l= (trips.features[i].geometry.coordinates).length -1;
			var ex= (trips.features[i].geometry.coordinates[l])[1];
			var ey= (trips.features[i].geometry.coordinates[l])[0];

			trips.features[i].properties.highlight =true;

			 var m=L.marker([sx,sy],{icon: picon}).bindPopup( 'Maximum Duration: <b>' + trips.features[i].properties.duration +'</b><br>Street Name: <b>' + trips.features[i].properties.streetnames[0] +'</b><br>Taxi Id: <b>'+trips.features[i].properties.taxiid+'</b><br>Trip Id: <b>'+trips.features[i].properties.tripid+'</b><br>Start Time: <b>'+
			trips.features[i].properties.starttime+'</b>');
			theMarker.push(m);
			map.addLayer(m);
			latlongs.push(m.getLatLng());

			 var m=L.marker([ex,ey],{icon: dicon}).bindPopup( 'Maximum Duration: <b>' + trips.features[i].properties.duration +'</b><br>Street Name: <b>' + trips.features[i].properties.streetnames[l]+'</b><br>Taxi Id: <b>'+trips.features[i].properties.taxiid +'</b><br>Trip Id: <b>'+  trips.features[i].properties.tripid+'</b><br>End Time: <b>'+
			trips.features[i].properties.endtime+'</b>');
			theMarker.push(m);
			map.addLayer(m);

					var coord=[];
					var points=[];
					coord=trips.features[i].geometry.coordinates;
					for(var k=0;k<coord.length;k++){
					points.push( new L.LatLng((coord[k])[1],(coord[k])[0]));
					}
					var line=L.polyline(points, { opacity:0 });
					map.addLayer(line);
					var animatedMarker = L.animatedMarker(line.getLatLngs(),{icon:icon});
					map.addLayer(animatedMarker);
					theMarker.push(animatedMarker);



			latlongs.push(m.getLatLng());


		}
	}
	hideLayers();
	var markerBounds = L.latLngBounds(latlongs);
	map.fitBounds(markerBounds);
}



function getTripColor(taxiid){

 if(taxi_id_map.has(taxiid)){
   return taxi_id_map.get(taxiid)
 }

}

function tripsStyle(features){
 return {
   weight : 5,
   opacity : 3,
   color : getTripColor(features.properties.taxiid),
   dashArray : 5,
   fillOpacity : 0.7
 }
}


//*********************************************************************************************************
//**************************** Show Average Speed Functionality ******************************************
//*********************************************************************************************************

function showAverageSpeed(){
	document.getElementById("lowrange").value = 0;
	document.getElementById("highrange").value = 100;
	document.getElementById("highrange").parentNode.dataset.ubound=100;
	document.getElementById("highrange").parentNode.dataset.lbound=0;
  document.getElementById("streets").value = 'Select Street';
	showPath=false;
	showLayers();

  if (streetNames != undefined)
  {
    map.removeLayer(streetNames)
  }

	if(theMarker.length>0){
		for(var i=0;i<theMarker.length;i++){
			 map.removeLayer(theMarker[i]);
		}

	}
	var icon = L.icon({
    iconUrl: '\js\\images\\taxii.gif',
    iconSize:     [20, 20], // size of the icon

	});

	var averageSpeed=[];
	var len= trips.features.length;
	for(var i=0;i<len;i++){
		averageSpeed[i]= trips.features[i].properties.avspeed;
	}
	var topaverageSpeed = averageSpeed.sort((a,b) => b-a).slice(0,5);
	var latlongs=[];

	for(var i=0;i<len;i++){
		if(topaverageSpeed.indexOf(trips.features[i].properties.avspeed) !=-1){


			var sx= (trips.features[i].geometry.coordinates[0])[1];
			var sy= (trips.features[i].geometry.coordinates[0])[0];

			var l= (trips.features[i].geometry.coordinates).length -1;
			var ex= (trips.features[i].geometry.coordinates[l])[1];
			var ey= (trips.features[i].geometry.coordinates[l])[0];

			trips.features[i].properties.highlight =true;


			var m=L.marker([sx,sy],{icon: picon}).bindPopup( 'Average Speed: <b>' + trips.features[i].properties.avspeed +'</b><br>Taxi Id: <b>'+trips.features[i].properties.taxiid+'</b><br>Trip Id: <b>' + trips.features[i].properties.tripid +'</b><br>Start Time: <b>'+
			trips.features[i].properties.starttime+'</b>');
			 map.addLayer(m);
			 theMarker.push(m);
			 latlongs.push(m.getLatLng());
			 var m=L.marker([ex,ey],{icon: dicon}).bindPopup( '1Average Speed: <b>' + trips.features[i].properties.avspeed +'</b><br>Taxi Id: <b>'+trips.features[i].properties.taxiid+'</b><br>Trip Id: <b>' + trips.features[i].properties.tripid +'</b><br>End Time: <b>'+
			trips.features[i].properties.endtime+'</b>');

			 map.addLayer(m);
			 theMarker.push(m);

			var coord=[];
			var points=[];
			coord=trips.features[i].geometry.coordinates;
			for(var k=0;k<coord.length;k++){
			points.push( new L.LatLng((coord[k])[1],(coord[k])[0]));
			}
			var line=L.polyline(points, { opacity:0 });
			map.addLayer(line);
			var animatedMarker = L.animatedMarker(line.getLatLngs(),{icon:icon});
			map.addLayer(animatedMarker);
			theMarker.push(animatedMarker);


			latlongs.push(m.getLatLng());

		}
	}
	hideLayers();
	var markerBounds = L.latLngBounds(latlongs);
		map.fitBounds(markerBounds);
}

//*********************************************************************************************************
//**************************** Showing and Hiding Defalut layout Functionality ****************************
//*********************************************************************************************************

function hideLayers (){
  this.layer.eachLayer(function(layer){
    if(!layer.feature.properties.highlight){
      map.removeLayer(layer);
    }
  });
}

function showLayers (){
  this.layer.eachLayer(function(layer){
    layer.feature.properties.highlight = false;
    map.addLayer(layer);
  });
}


//*********************************************************************************************************
//**************************** Show Most Frequent Pick-up and Drop off Functionality **********************
//*********************************************************************************************************

function showMostFrequent(){
	document.getElementById("lowrange").value = 0;
	document.getElementById("highrange").value = 100;
	document.getElementById("highrange").parentNode.dataset.ubound=100;
	document.getElementById("highrange").parentNode.dataset.lbound=0;
  document.getElementById("streets").value = 'Select Street';
	showPath=false;
	if(theMarker.length>0){
		for(var i=0;i<theMarker.length;i++){
			 map.removeLayer(theMarker[i]);
		}

	}
	this.layer.eachLayer(function(layer){
      map.removeLayer(layer);
	});

  if (streetNames != undefined)
  {
    map.removeLayer(streetNames)
  }

		var fLength= trips.features.length;
		var coordinatesPickUp=[];
		var coordinatesDropOff=[];
		var latlong=[];
		for(var i=0;i<fLength;i++){
				var clen= (trips.features[i].geometry.coordinates).length;;
				coordinatesPickUp[i]= trips.features[i].geometry.coordinates[0];
				coordinatesDropOff[i]= trips.features[i].geometry.coordinates[clen-1];
			}
		var mostFreqPickUp= mostFreqStr(coordinatesPickUp);
		var streetPick;
		var streetDrop
		for(var i=0;i<mostFreqPickUp.length;i++){

			for(var k=0;k<fLength;k++){
				if( trips.features[k].geometry.coordinates[0]== mostFreqPickUp[i] ){
					streetPick=trips.features[i].properties.streetnames[0];
					break;
				}

			}
			var x= (mostFreqPickUp[i])[1];
			var y= (mostFreqPickUp[i])[0];

			var m= L.marker([x,y],{icon: picon}).bindPopup('Most Frquent Pick Up at: ' + x +','+y+'<br>Street Name: '+streetPick).addTo(map);
			latlong.push(m.getLatLng());
			theMarker.push(m);
			//map.addLayer(theMarker);
		}


		var mostFreqDropOff= mostFreqStr(coordinatesDropOff);
		for(var i=0;i<mostFreqDropOff.length;i++){

			for(var k=0;k<fLength;k++){
				var last= (trips.features[k].geometry.coordinates).length -1;
				if( trips.features[k].geometry.coordinates[last]== mostFreqDropOff[i] ){
					streetDrop=trips.features[k].properties.streetnames[last];
					break;
				}

			}
			var x= (mostFreqDropOff[i])[1];
			var y= (mostFreqDropOff[i])[0];
			var m= L.marker([x,y],{icon: dicon}).bindPopup('Most Frquent Drop Off at: ' + x +','+y+'<br>Street Name: '+streetDrop).addTo(map);
			latlong.push(m.getLatLng());
			theMarker.push(m);
		}

		//var latLngs = [ m.getLatLng() ];
		var markerBounds = L.latLngBounds(latlong);
		map.fitBounds(markerBounds);

}

function mostFreqStr(arr) {
  var obj = {}, mostFreq = 0, which = [];

  arr.forEach(ea => {
    if (!obj[ea]) {
      obj[ea] = 1;
    } else {
      obj[ea]++;
    }

    if (obj[ea] > mostFreq) {
      mostFreq = obj[ea];
      which = [ea];
    } else if (obj[ea] === mostFreq) {
      which.push(ea);
    }
  });

  return which;
}


//*********************************************************************************************************
//**************************** Choose avg. speed range Functionality **************************************
//*********************************************************************************************************

function updateSpeed(){

	showPath=false;
	console.log('rangeee speed'+showPath);
	var minSpeed=document.getElementById('lowrange').value;
	var maxSpeed=document.getElementById('highrange').value;

	if(theMarker.length>0){
		for(var i=0;i<theMarker.length;i++){
			 map.removeLayer(theMarker[i]);
		}

	}

  if (streetNames != undefined)
  {
    map.removeLayer(streetNames)
  }

	showLayers();
	document.getElementById('chkYes').checked = false;
	for(i=0;i<trips.features.length;i++){
      if(trips.features[i].properties.avspeed >= minSpeed && trips.features[i].properties.avspeed<= maxSpeed){
        trips.features[i].properties.highlight =true;

	  }
	}
	hideLayers();

}


//*********************************************************************************************************
//**************************** Choose by Street Name Functionality ****************************************
//*********************************************************************************************************

// Code to get the distinct street names and making them available in the dropdown menu

    distinct_street_names[0] = trips.features[0].properties.streetnames[0];

    for(var i=0; i<trips.features.length; i++)
    {
       for(var j=0;  j<trips.features[i].properties.streetnames.length;  j++)
       {
            var len = distinct_street_names.length;
            if (distinct_street_names.indexOf(trips.features[i].properties.streetnames[j]) == -1)
            {
              distinct_street_names[len] = trips.features[i].properties.streetnames[j];
              len++;
          }
       }
    }
    //console.log(distinct_street_names.length);

document.getElementById('streets').options.length = 0;
//var street_optoins =['A','B','C'];
createOption(document.getElementById('streets'), "Select Street", "Select Street");

for (var i = 0; i < distinct_street_names.length; i++) {
createOption(document.getElementById('streets'), distinct_street_names[i], distinct_street_names[i]);
}
function createOption(id, text, value) {
        var opt = document.createElement('option');
        opt.value = value;
        opt.text = text;
        id.options.add(opt);
    }



function showStreets() {

	document.getElementById("lowrange").value = 0;
	document.getElementById("highrange").value = 100;
	document.getElementById("highrange").parentNode.dataset.ubound=100;
	document.getElementById("highrange").parentNode.dataset.lbound=0;
	showPath=false;
	var input_street_name = document.getElementById("streets").value;
  console.log(input_street_name);
        //Remove Markers if any
         if(theMarker.length>0){
           for(var i=0;i<theMarker.length;i++){
              map.removeLayer(theMarker[i]);
           }
         }
       //Remove if there is any other map layer
       this.layer.eachLayer(function(layer){
            map.removeLayer(layer);
       });

       var streets = [];

       streetNames = L.geoJson(trips, {
          style : tripsStyle,
          onEachFeature: function (feature, layer) {
               streets.push(feature);
          } ,
            filter: function (features, layer) {
            for(var i=0; i<features.properties.streetnames.length; i++){
              return_value = false;
              if( features.properties.streetnames[i]== input_street_name) {
                  //console.log("shashikant displaying - Praca da Batalha")
                  return_value = true;
                  break;
              }
          }
          return return_value;
        }

       });

        //Add new geoJSON layer with street Names
       streetNames.addTo(map);

        var latlongs=[];
        var geometry_index = streets[0].properties.streetnames.indexOf(input_street_name);

        var x= streets[0].geometry.coordinates[geometry_index][1];
  			var y= streets[0].geometry.coordinates[geometry_index][0];

        console.log("shashikant x geometry index:"+x);
        console.log("shashikant y geometry index:"+y);

  			var m= L.marker([x,y],{icon: picon}).bindPopup('Co-ordinates: ' + x +','+y+'<br>Street Name: '+streets[0].properties.streetnames[geometry_index]
        +'<br> No. of trips via this street : '+streets.length).addTo(map);
  			theMarker.push(m);
        latlongs.push(m.getLatLng());
        var markerBounds = L.latLngBounds(latlongs);
        map.fitBounds(markerBounds);
};


//*********************************************************************************************************
//********************************** Clearing Map - on Click *********************************************
//*********************************************************************************************************

map.on('click', function () {
	if(theMarker.length>0){
		for(var i=0;i<theMarker.length;i++){
			 map.removeLayer(theMarker[i]);
		}
	}

 document.getElementById('chkYes').checked = false;

 showPath = true;
});
