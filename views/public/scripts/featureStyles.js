
// switch value with agency name
function myAgency(agen) {
    switch (agen) {
        case 0:
            return 'BLM';
            break;
        case 1:
            return 'NPS';
            break;
        case 2:
            return 'FS';
            break;
        case 3:
            return 'FWS';
            break;
        default:
            return 'null';
            break;
    }
}
// creating a style function for points in the map based on the agency number
function myStylePoints(feature) {
    switch (feature.properties.agency) {
        case 0:
            return {
                radius: 300,
                fillColor: "#fdfe00",
                color: "#fdfe00",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;
        case 1:
            return {
                radius: 300,
                fillColor: "#54ff01",
                color: "#54ff01",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;

        case 2:
            return {
                radius: 300,
                fillColor: "#005de8",
                color: "#005de8",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;
        case 3:
            return {
                radius: 300,
                fillColor: "#8600ac",
                color: "#8600ac",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;
        default:
            return {
                radius: 300,
                fillColor: "#ffffff",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;
    }
}

function myStyleDistPoints(feature) {
    switch (feature.properties.agency) {
        case 0:
            return {
                radius: 300,
                fillColor: "#fdfe00",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;
        case 1:
            return {
                radius: 300,
                fillColor: "#54ff01",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;

        case 2:
            return {
                radius: 300,
                fillColor: "#005de8",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;
        case 3:
            return {
                radius: 300,
                fillColor: "#8600ac",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;
        default:
            return {
                radius: 300,
                fillColor: "#ffffff",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;
    }
}

// creating a style function for lines in the map based on the agency number
function myStyleLines(feature) {
    switch (feature.properties.agency) {
        case 0:
            return {
                color: "#fdfe00",
                weight: 3,
                opacity: 1
            };
            break;
        case 1:
            return {
                color: "#54ff01",
                weight: 3,
                opacity: 1
            };
            break;
        case 2:
            return {
                color: "#005de8",
                weight: 3,
                opacity: 1
            };
            break;
        case 3:
            return {
                color: "#8600ac",
                weight: 3,
                opacity: 1
            };
            break;
    }
}

function myDistLines(feature) {
    return {
        color: '#000',
        weight: 5
    }
    
}
function myBarrierLines(feature) {
    switch (feature.properties.agency) {
        case 0:
            return {
                color: "#fdfe00",
                weight: 3,
                opacity: 1,
                dashArray: "2 7"
            };
            break;
        case 1:
            return {
                color: "#54ff01",
                weight: 3,
                opacity: 1,
                dashArray: "2 7"
            };
            break;
        case 2:
            return {
                color: "#005de8",
                weight: 3,
                opacity: 1,
                dashArray: "2 7"
            };
            break;
        case 3:
            return {
                color: "#8600ac",
                weight: 3,
                opacity: 1,
                dashArray: "2 7"
            };
            break;
    }
}

//creating a style function for Dist polygons in the map based on the agency number
function myStyleDistPoly(feature) {
    switch (feature.properties.agency) {
        case 0:
            return {
                color: "#000",
                fillColor: "#fdfe00"
            };
            break;
        case 1:
            return {
                color: "#000",
                fillColor: "#54ff01"
            };
            break;
        case 2:
            return {
                color: "#000",
                fillColor: "#005de8"
            };
            break;
        case 3:
            return {
                color: "#000",
                fillColor: "#8600ac"
            };
            break;
    }
}

//creating a style function for Resto polygons in the map based on the agency number
function myStyleRestoPoly(feature) {
    switch (feature.properties.agency) {
        case 0:
            return {
                color: "#fdfe00"
            };
            break;
        case 1:
            return {
                color: "#54ff01"
            };
            break;
        case 2:
            return {
                color: "#005de8"
            };
            break;
        case 3:
            return {
                color: "#8600ac"
            };
            break;
    }
}
// creating a function that will chang the default point makers to circle markers
function pointToLayer(feature, latlng) {
    return new L.Circle(latlng, 30);
}

function blmRegion(feature) {
    return { color: "#fdfe00" };
}

function fsRegion(feature) {
    return { color: "#54ff01" };
}

function mdep_i(feature) {
    return { color: "#377eb8" };
}

function nv_county(feature) {
    return { color: "#ffff33" };
}

function soil_vuln(feature) {
    return { color: "#a65628" };
}

function roadColor(feature) {
    return { color: "#000000",
        weight: 3,
        opacity: 1
    };
}

function onEachBarrier(feature, layer) {
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        map.panTo(this.getCenter());
        $('#sidebar1').empty();
        $("<B><U>Barrier</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachDistLine(feature, layer) {
    console.log(layer);
    // adds black border to Dist Lines
    L.geoJSON(feature, {
        style: myStyleLines,
        interactive: false
    }).addTo(map);
    if (loggedIn != null && !loggedIn)
        if (feature.properties['t_e_specie'] == 'Yes' || feature.properties['cultural'] == 'Yes')
            {
                map.removeLayer(layer);
                return;
            }
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');

        // gets the point in the middle of the line to pan the camera to

        map.panTo(this.getCenter());

        $('#sidebar1').empty();
        $("<B><U>Dist Line</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachDistPoint(feature, layer) {
    if (loggedIn != null && !loggedIn)
        if (feature.properties['t_e_specie'] == 'Yes' || feature.properties['cultural'] == 'Yes')
            {
                map.removeLayer(layer);
                return;
            }
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
        console.log("Dist Point - " + this.getLatLng());
        $('#sidebar1').empty();
        $("<B><U>Dist Point</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachDistPoly(feature, layer) {
    if (loggedIn != null && !loggedIn)
        if (feature.properties['t_e_specie'] == 'Yes' || feature.properties['cultural'] == 'Yes')
            {
                map.removeLayer(layer);
                return;
            }
    // console.log('layer')
    // console.log(layer);
    $(layer).on('click', function () {
        // console.log(feature);
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');

        //gets the center of the poly to pan the camera
        map.panTo(this.getCenter());

        $('#sidebar1').empty();
        $("<B><U>Dist Polygon</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachDistPolyCent(feature, layer) {
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            //console.log(prop + ' : ' + feature.properties[prop]);
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $('#sidebar1').empty();
        $("<B><U>Dist Poly Cent</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachRestoPoly(feature, layer) {
    $(layer).on('click', function () {
        //console.log(feature);
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');

        //gets the center of the poly to pan the camera
        map.panTo(this.getCenter());
        //map.panTo(this.getLatLng());
        $('#sidebar1').empty();
        $("<B><U>Resto Polygon</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachRestoPoint(feature, layer) {
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                //console.log(prop + ' : ' + feature.properties[prop]);
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
        $('#sidebar1').empty();
        $("<B><U>Resto Point</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachRestoPolyCent(feature, layer) {
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        map.panTo(this.getCenter());
        $('#sidebar1').empty();
        $("<B><U>Resto Poly Cent</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachRestoLine(feature, layer) {
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');

        // gets the point in the middle of the line to pan the camera to

        map.panTo(this.getCenter());

        $('#sidebar1').empty();
        $("<B><U>Resto Line</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachBLMRegion(feature, layer) {
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $('#sidebar1').empty();
        $("<B><U>BLM Region</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachFSRegion(feature, layer) {
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $('#sidebar1').empty();
        $("<B><U>FS Region</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachMDEPBound(feature, layer) {
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $('#sidebar1').empty();
        $("<B><U>MDEP Bound</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachMDIBound(feature, layer) {
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $('#sidebar1').empty();
        $("<B><U>MDI Bound</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachNVCounty(feature, layer) {
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $('#sidebar1').empty();
        $("<B><U>NV Counties</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}

function onEachSoilVuln(feature, layer) {
    $(layer).on('click', function () {
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + feature.properties[prop]);
        }
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $('#sidebar1').empty();
        $("<B><U>Soil Vulnerability</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    });
}