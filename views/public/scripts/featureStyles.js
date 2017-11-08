
// creating a style function for points in the map based on the agency number
function myStylePoints(feature) {
    switch (feature.properties.agency) {
        case 0:
            return {
                radius: 8,
                fillColor: "#e41a1c",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;
        case 1:
            return {
                radius: 8,
                fillColor: "#4daf4a",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;

        case 2:
            return {
                radius: 8,
                FillColor: "#984ea3",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;
        case 3:
            return {
                radius: 8,
                FillColor: "#ff7f00",
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
                color: "#e41a1c",
                weight: 3,
                opacity: 1
            };
            break;
        case 1:
            return {
                color: "#4daf4a",
                weight: 3,
                opacity: 1
            };
            break;
        case 2:
            return {
                color: "#984ea3",
                weight: 3,
                opacity: 1
            };
            break;
        case 3:
            return {
                color: "#ff7f00",
                weight: 3,
                opacity: 1
            };
            break;
    }
}

//creating a style function for Dist polygons in the map based on the agencey number
function myStyleDistPoly(feature) {
    switch (feature.properties.agencey) {
        case 0:
            return {
                color: "#e41a1c"
            };
            break;
        case 1:
            return {
                color: "#4daf4a"
            };
            break;
        case 2:
            return {
                color: "#984ea3"
            };
            break;
        case 3:
            return {
                color: "#ff7f00"
            };
            break;
    }
}

//creating a style function for Resto polygons in the map based on the agency number
function myStyleRestoPoly(feature) {
    switch (feature.properties.agency) {
        case 0:
            return {
                color: "#e41a1c"
            };
            break;
        case 1:
            return {
                color: "#4daf4a"
            };
            break;
        case 2:
            return {
                color: "#984ea3"
            };
            break;
        case 3:
            return {
                color: "#ff7f00"
            };
            break;
    }
}
// creating a function that will chang the default point makers to circle markers
function pointToLayer(feature, latlng) {
    return new L.CircleMarker(latlng, null);
}

function blmRegion(feature) {
    return {color: "#e41a1c"}
}

function fsRegion(feature) {
    return {color: "#4daf4a"}
}

function mdep_i(feature) {
    return {color: "#377eb8"}
}

function nv_county(feature) {
    return {color: "#ffff33"}
}

function soil_vuln(feature) {
    return {color: "#a65628"}
}

function roadColor(feature) {
    return {color: "#000000",
                weight: 3,
                opacity: 1
    }
}

function onEachBarrier(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>Barrier</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachDistLine(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        
        // gets the point in the middle of the line to pan the camera to
        var latLang = this.getLatLngs();
        var middleLatLong = latLang[0][Math.floor(latLang[0].length/2)];
        map.panTo(middleLatLong);
        
        $(`#sidebar1`).empty();
        $("<B><U>Dist Line</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachDistPoint(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
        console.log("Dist Point - " + this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>Dist Point</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
        
    })
}

function onEachDistPoly(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        
        if (this.getLatLngs() != null)
            console.log(this.getLatLngs());
        //gets the center of the poly to pan the camera
        var latLang = this.getLatLngs();
        var leftMostCoord, rightMostCoord, topMostCoord, bottomMostCoord;
        leftMostCoord = rightMostCoord = latLang[0][0][0].lng;
        topMostCoord = bottomMostCoord = latLang[0][0][0].lat;
        latLang[0].forEach(function(outerElem) {
            outerElem.forEach(function(elem) {
                if (elem.lat > topMostCoord)
                    topMostCoord = elem.lat;
                if (elem.lng > leftMostCoord)
                    leftMostCoord = elem.lng;
                if (elem.lat < bottomMostCoord)
                    bottomMostCoord = elem.lat;
                if (elem.lng < rightMostCoord)
                    rightMostCoord = elem.lng;
            });
        });
        var centerCoord = {
            lng:(leftMostCoord + rightMostCoord)/2,
            lat:(topMostCoord + bottomMostCoord)/2
        };
        map.panTo(centerCoord);
        
        $(`#sidebar1`).empty();
        $("<B><U>Dist Polygon</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachDistPolyCent(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        //console.log(prop + ' : ' + feature.properties[prop]);
        if(prop == 'agency' || prop == 'agencey'){
            //console.log(prop + ' : ' + feature.properties[prop]);
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>Dist Poly Cent</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachRestoPoly(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        
        if (this.getLatLngs() != null)
            console.log(this.getLatLngs());
        //gets the center of the poly to pan the camera
        var latLang = this.getLatLngs();
        var leftMostCoord, rightMostCoord, topMostCoord, bottomMostCoord;
        leftMostCoord = rightMostCoord = latLang[0][0][0].lng;
        topMostCoord = bottomMostCoord = latLang[0][0][0].lat;
        latLang[0].forEach(function(outerElem) {
            outerElem.forEach(function(elem) {
                if (elem.lat > topMostCoord)
                    topMostCoord = elem.lat;
                if (elem.lng > leftMostCoord)
                    leftMostCoord = elem.lng;
                if (elem.lat < bottomMostCoord)
                    bottomMostCoord = elem.lat;
                if (elem.lng < rightMostCoord)
                    rightMostCoord = elem.lng;
            });
        });
        var centerCoord = {
            lng:(leftMostCoord + rightMostCoord)/2,
            lat:(topMostCoord + bottomMostCoord)/2
        };
        map.panTo(centerCoord);
        //map.panTo(this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>Resto Polygon</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachRestoPoint(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            //console.log(prop + ' : ' + feature.properties[prop]);
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>Resto Point</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachRestoPolyCent(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>Resto Poly Cent</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachRestoLine(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        
        // gets the point in the middle of the line to pan the camera to
        var latLang = this.getLatLngs();
        var middleLatLong = latLang[0][Math.floor(latLang[0].length/2)];
        map.panTo(middleLatLong);
        
        $(`#sidebar1`).empty();
        $("<B><U>Resto Line</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachBLMRegion(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>BLM Region</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachFSRegion(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>FS Region</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachMDEPBound(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>MDEP Bound</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachMDIBound(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>MDI Bound</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachNVCounty(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>NV Counties</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}

function onEachSoilVuln(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        if(prop == 'agency' || prop == 'agencey'){
            switch (feature.properties[prop]) {
                case 0:
                    popUpContent.push(`<B>${prop}</B>` + ' : BLM');
                    break;
                case 1:
                    popUpContent.push(`<B>${prop}</B>` + ' : NPS');
                    break;
                case 2:
                    popUpContent.push(`<B>${prop}</B>` + ' : FS');
                    break;
                case 3:
                    popUpContent.push(`<B>${prop}</B>` + ' : FWS');
                    break;
                default:
                    break;
            }
        }
        else
            popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        // opens the marker info tab on sidebar when clicked
        sidebar.open('formTools');
        //map.panTo(this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>Soil Vulnerability</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}
