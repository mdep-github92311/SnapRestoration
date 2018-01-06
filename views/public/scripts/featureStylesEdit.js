"use strict";
var newShapeGeom = null;
var currPos = null;
// creating a style function for points in the map based on the agency number
function myStylePointsEdit(feature) {
    switch (feature.properties.agency) {
        case 0:
            return {
                radius: 300,
                fillColor: "#e41a1c",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;
        case 1:
            return {
                radius: 300,
                fillColor: "#4daf4a",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;

        case 2:
            return {
                radius: 300,
                fillColor: "#984ea3",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            break;
        case 3:
            return {
                radius: 300,
                fillColor: "#ff7f00",
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
function myStyleLinesEdit(feature) {
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

//creating a style function for Dist polygons in the map based on the agency number
function myStyleDistPolyEdit(feature) {
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

//creating a style function for Resto polygons in the map based on the agency number
function myStyleRestoPolyEdit(feature) {
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
function pointToLayerEdit(feature, latlng) {
    return new L.Circle(latlng, 300);
}


function setToolEvents(layer) {
    $("#cancelDraw").on("click", function() {
        layer.editing.disable();
        if (layer.toGeoJSON().geometry.type == 'Point')
            layer.setLatLng(currPos);
        else
            layer.setLatLngs(currPos);
        turnOffEditTools();
    });
    $("#saveDraw").on("click", function() {
        layer.editing.disable();
        if (layer.toGeoJSON().geometry.type == 'Point')
            currPos = layer.getLatLng();
        else
            currPos = layer.getLatLngs();
        newShapeGeom = layer.toGeoJSON().geometry;
        //setPos(db.restoPointSub, layer.toGeoJSON().geometry, layer.toGeoJSON().properties.gid);
        turnOffEditTools();
    });
}

function onEachBarrierEdit(feature, layer) {
    setTimeout(function(){ map.flyTo(layer.getCenter(),11, { maxZoom: 11 }); }, 100);
    currPos = layer.getLatLng();
    setToolEvents(layer);
    $("#barrierEditDrawButton").on("click", function(event) {
        newShapeGeom = layer.toGeoJSON().geometry;
        currPos = layer.getLatLng();
        layer.editing.enable();
        turnOnEditTools();
    });
    $(layer).on('click', function () {
        // opens the saved subs tab on sidebar when clicked
        sidebar.open('savedSubs');
        map.panTo(this.getCenter());
    });
}

function onEachDistLineEdit(feature, layer) {
    setTimeout(function(){ map.flyTo(layer.getCenter(),11, { maxZoom: 11 }); }, 100);
    currPos = layer.getLatLng();
    setToolEvents(layer);
    $("#distLineEditDrawButton").on("click", function(event) {
        newShapeGeom = layer.toGeoJSON().geometry;
        currPos = layer.getLatLng();
        layer.editing.enable();
        turnOnEditTools();
    });
    $(layer).on('click', function () {
        // opens the saved subs tab on sidebar when clicked
        sidebar.open('savedSubs');
        // gets the point in the middle of the line to pan the camera to
        map.panTo(this.getCenter());
    });
}

function onEachDistPointEdit(feature, layer) {
    map.flyTo(layer.getLatLng(),11, { maxZoom: 11 });
    currPos = layer.getLatLng();
    setToolEvents(layer);
    $("#distPointEditDrawButton").on("click", function(event) {
        newShapeGeom = layer.toGeoJSON().geometry;
        currPos = layer.getLatLng();
        layer.editing.enable();
        turnOnEditTools();
    });
    $(layer).on('click', function () {
        // opens the saved subs tab on sidebar when clicked
        sidebar.open('savedSubs');
        map.panTo(this.getLatLng());
    });
}

function onEachDistPolyEdit(feature, layer) {
    setTimeout(function(){ map.flyTo(layer.getCenter(),11, { maxZoom: 11 }); }, 100);
    currPos = layer.getLatLng();
    setToolEvents(layer);
    $("#distPolyEditDrawButton").on("click", function(event) {
        newShapeGeom = layer.toGeoJSON().geometry;
        currPos = layer.getLatLng();
        layer.editing.enable();
        turnOnEditTools();
    });
    $(layer).on('click', function () {
        // opens the saved subs tab on sidebar when clicked
        sidebar.open('savedSubs');
        //gets the center of the poly to pan the camera
        map.panTo(this.getCenter());
    });
}

function onEachDistPolyCentEdit(feature, layer) {
    setTimeout(function(){ map.flyTo(layer.getCenter(),11, { maxZoom: 11 }); }, 100);
    currPos = layer.getLatLng();
    setToolEvents(layer);
    $("#distPolyCentEditDrawButton").on("click", function(event) {
        newShapeGeom = layer.toGeoJSON().geometry;
        currPos = layer.getLatLng();
        layer.editing.enable();
        turnOnEditTools();
    });
    $(layer).on('click', function () {
        // opens the saved subs tab on sidebar when clicked
        sidebar.open('savedSubs');
        map.panTo(this.getCenter());
    });
}

function onEachRestoPolyEdit(feature, layer) {
    setTimeout(function(){ map.flyTo(layer.getCenter(),11, { maxZoom: 11 }); }, 100);
    currPos = layer.getLatLng();
    setToolEvents(layer);
    $("#restoPolyEditDrawButton").on("click", function(event) {
        newShapeGeom = layer.toGeoJSON().geometry;
        currPos = layer.getLatLng();
        layer.editing.enable();
        turnOnEditTools();
    });
    $(layer).on('click', function () {
        // opens the saved subs tab on sidebar when clicked
        sidebar.open('savedSubs');
        //gets the center of the poly to pan the camera
        map.panTo(this.getCenter());
    });
}

function onEachRestoPointEdit(feature, layer) {
    map.flyTo(layer.getLatLng(),11, { maxZoom: 11 });
    //console.log(layer);
    currPos = layer.getLatLng();
    setToolEvents(layer);
    $("#restoPointEditDrawButton").on("click", function(event) {
        newShapeGeom = layer.toGeoJSON().geometry;
        currPos = layer.getLatLng();
        layer.editing.enable();
        turnOnEditTools();
    });
    $(layer).on('click', function () {
        // opens the saved subs tab on sidebar when clicked
        sidebar.open('savedSubs');
        map.panTo(this.getLatLng());
    });
}

function onEachRestoPolyCentEdit(feature, layer) {
    setTimeout(function(){ map.flyTo(layer.getCenter(),11, { maxZoom: 11 }); }, 100);
    currPos = layer.getLatLng();
    setToolEvents(layer);
    $("#restoPolyCentEditDrawButton").on("click", function(event) {
        newShapeGeom = layer.toGeoJSON().geometry;
        currPos = layer.getLatLng();
        layer.editing.enable();
        turnOnEditTools();
    });
    $(layer).on('click', function () {
        // opens the saved subs tab on sidebar when clicked
        sidebar.open('savedSubs');
        map.panTo(this.getCenter());
    });
}

function onEachRestoLineEdit(feature, layer) {
    setTimeout(function(){ map.flyTo(layer.getCenter(),11, { maxZoom: 11 }); }, 100);
    currPos = layer.getLatLng();
    setToolEvents(layer);
    $("#restoLineEditDrawButton").on("click", function(event) {
        newShapeGeom = layer.toGeoJSON().geometry;
        currPos = layer.getLatLng();
        layer.editing.enable();
        turnOnEditTools();
    });
    $(layer).on('click', function () {
        // opens the saved subs tab on sidebar when clicked
        sidebar.open('savedSubs');
        // gets the point in the middle of the line to pan the camera to
        map.panTo(this.getCenter());
    });
}

function createLayerEdit(data, layerName) {
    try {
        switch (layerName) {
            case 'Barrier':
                var barrier = L.geoJson(data, {
                    pane: 'Lines',
                    style: myStyleLines,
                    onEachFeature: onEachBarrierEdit
                }).addTo(map);

                //control.addOverlay(barrier, layerName, {groupName: 'Barrier Data', expanded: true});
                console.log("added " + layerName);

                break;

            case 'Disturbance Lines':
                var distLines = L.geoJson(data, {
                    pane: 'Lines',
                    style: myStyleLines,
                    onEachFeature: onEachDistLineEdit
                }).addTo(map);

                //control.addOverlay(distLines, layerName, {groupName: 'Disturbance Data', expanded: true});
                console.log("added " + layerName);

                break;

            case 'Disturbance Points':
                var distPoints = L.geoJson(data, {
                    pane: 'Points',
                    style: myStylePoints,
                    // changing the default point makers to circle markers
                    //pointToLayer: pointToLayerEdit,
                    onEachFeature: onEachDistPointEdit
                }).addTo(map);

                //control.addOverlay(distPoints, layerName, {groupName: 'Disturbance Data', expanded: true});
                console.log("added " + layerName);

                break;

            case 'Disturbance Polygon':
                var distPoly = L.geoJson(data, {
                    pane: 'Polygons',
                    style: myStyleDistPoly,
                    onEachFeature: onEachDistPolyEdit
                }).addTo(map);

                //control.addOverlay(distPoly, layerName, {groupName: 'Disturbance Data', expanded: true});
                console.log("added " + layerName);

                break;

            case 'Disturbance Poly Cent':
                var distPolyCent = L.geoJson(data, {
                    pane: 'Points',
                    style: myStyleDistPoly,
                    // changing the default point makers to circle markers
                    //pointToLayer: pointToLayer,
                    onEachFeature: onEachDistPolyCentEdit
                }).addTo(map);

                //control.addOverlay(distPolyCent, layerName, {groupName: 'Disturbance Data', expanded: true});
                //control.unSelectLayer(distPolyCent);
                console.log("added " + layerName + " Unselected");

                break;

            case 'Restoration Polygon':
                var restoPoly = L.geoJson(data, {
                    pane: 'Polygons',
                    style: myStyleRestoPoly,
                    onEachFeature: onEachRestoPolyEdit
                }).addTo(map);

                //control.addOverlay(restoPoly, layerName, {groupName: 'Restoration Data', expanded: true});
                console.log("added " + layerName);

                break;

            case 'Restoration Lines':
                var restoLine = L.geoJson(data, {
                    pane: 'Lines',
                    style: myStyleLines,
                    onEachFeature: onEachRestoLineEdit
                }).addTo(map);

                //control.addOverlay(restoLine, layerName, {groupName: 'Restoration Data', expanded: true});
                console.log("added " + layerName);

                break;

            case 'Restoration Points':
                var restoPoint = L.geoJson(data, {
                    pane: 'Points',
                    style: myStylePoints,
                    // changing the default point makers to circle markers
                    //pointToLayer: pointToLayerEdit,
                    onEachFeature: onEachRestoPointEdit
                }).addTo(map);

                //control.addOverlay(restoPoint, layerName, {groupName: 'Restoration Data', expanded: true});
                console.log("added " + layerName);

                break;

            case 'Restoration Poly Cent':
                var restoPolyCent = L.geoJson(data, {
                    pane: 'Points',
                    style: myStylePoints,
                    // changing the default point makers to circle markers
                    //pointToLayer: pointToLayer,
                    onEachFeature: onEachRestoPolyCentEdit
                }).addTo(map);

                //control.addOverlay(restoPolyCent, layerName, {groupName: 'Restoration Data', expanded: true});
                //control.unSelectLayer(restoPolyCent);
                console.log("added " + layerName + " Unselected");

                break;
        }
    } catch (err) {
        console.error(err);
    }
};