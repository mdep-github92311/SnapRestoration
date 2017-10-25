// snaps map to center the point that is clicked
var clickedMarker;

function clickFeature(e) {
    if(clickedMarker) {
          clickedMarker.setIcon('/public/css/images/arrow_down.png');
    }
    var layer = e.target;
    e.target.setIcon('/public/css/images/arrow_down.png');
    clickedMarker = e.target;

    info.update(layer.feature.properties);
}
var icon = L.icon({
        iconUrl: 'https://cdn1.iconfinder.com/data/icons/Map-Markers-Icons-Demo-PNG/256/Map-Marker-Marker-Outside-Azure.png',
        iconSize: [ 48, 48 ],
    });
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

function onEachBarrier(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop} </B> : ` + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
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
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        sidebar.open('formTools');
        map.panTo(this.getLatLng());
        $(`#sidebar1`).empty();
        $("<B><U>Soil Vulnerability</U></B><br />").appendTo('#sidebar1');
        for (var ii = 0; ii < popUpContent.length; ii++) {
            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
        }
    })
}
