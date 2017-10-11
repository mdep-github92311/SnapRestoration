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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>Barrier</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>Barrier</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>Dist Line</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>Dist Line</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        }
    })
}

function onEachDistPoint(feature, layer) {
    var popUpContent = [];
    // iterating through the "properties" so it can be displayed in the pop-ups
    for (var prop in feature.properties) {
        popUpContent.push(`<B>${prop}</B>` + ' : ' + feature.properties[prop]);
    }
    $(layer).on('click', function () {
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>Dist Point</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>Dist Point</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>Dist Polygon</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>Dist Polygon</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>Dist Poly Cent</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>Dist Poly Cent</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>Resto Polygon</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>Resto Polygon</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>Resto Point</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>Resto Point</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>Resto Poly Cent</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>Resto Poly Cent</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>Resto Line</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>Resto Line</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>BLM Region</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>BLM Region</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>FS Region</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>FS Region</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>MDEP Bound</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>MDEP Bound</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>MDI Bound</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>MDI Bound</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>NV Counties</U></B><br>" + popUpContent.join("<br>")).appendTo('#sidebar')
        } else {
            $(`#sidebar`).empty();
            $("<B><U>NV Counties</U></B><br>" + popUpContent.join("<br>")).appendTo('#sidebar')
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
        if ($(`#sidebar`).is(`:empty`)) {
            $("<B><U>Soil Vulnerability</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        } else {
            $(`#sidebar`).empty();
            $("<B><U>Soil Vulnerability</U></B><br />" + popUpContent.join("<br />")).appendTo('#sidebar');
        }
    })
}
