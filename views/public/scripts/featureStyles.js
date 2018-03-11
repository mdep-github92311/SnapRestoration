var selected = null, selectedColor = {fillColor: 'white', color: 'white'};
// sets name of properties
function selectedFeature(layer) {
    if (selected == null)
        selected = layer;
    else
        selected.setStyle(selectedColor);
    selectedColor.fillColor = layer.options.fillColor;
    selectedColor.color = layer.options.color;
    layer.setStyle({fillColor :'white', color :'white'});
    selected = layer;
}

function setProp(prop) {
    switch (prop) {
        case 'gid':
            return 'GID';
        case 'agency':
            return 'Agency';
        case 'region':
            return 'Region';
        case 'regions':
            return 'Region';
        case 'ecosystem':
            return 'Ecosystem';
        case 'gps_date':
            return 'Date collected:';
        case 'dist_code':
            return 'Disturbance Code';
        case 'old_dist_c':
            return 'Old Disturbance Code';
        case 'dist_use':
            return 'Disturbance Use';
        case 'use_freq':
            return 'Frequent Use';
        case 'use_recent':
            return 'Recent Use';
        case 'dist_pt_ty':
            return 'Disturbance Type';
        case 'accessibil':
            return 'Accessibility'; 
        case 'assessibil':
            return 'Accessibility'; 
        case 'visibility':
            return 'Visibility';
        case 'comments':
            return 'Comments';
        case 'primary_ob':
            return 'Primary Observer';
            //return 'Who collected the data?';
        case 'secondary_':
            return 'Secondary Observer';
            //return 'Who was with you?';
        case 'previously':
            return 'Previously Restored';
        case 'project_na':
            return 'Project Name';
        case 'estimate_s':
            return 'Estimated Size';
        case 'treated':
            return 'Was the disturbance treated?';
        case 'cultural':
            return 'Are cultural resources impacted?';
        case 't_e_specie':
            return 'Are Threatened or Endangered Species impacted? (If "Yes" include species names in comments)';
        case 'gps_photo':
            return 'Is there a GPS tagged photo?';
        case 'soil_vulne':
            return 'Soil Vunerability';
        case 'photo_azim':
            return 'Which way is photo facing (degrees)?';
        case 'qa_qc':
            return 'QA/QC';
        case 'old_distco':
            return 'Old Disturbance Code';
        case 'site_stabi':
            return 'Site Stability';
        case 'dist_crust':
            return 'Disturbed Soil Crust';
        case 'undist_cru':
            return 'Undisturbed Crust';
        case 'depth':
            return 'Depth';
        case 'width':
            return 'Width';
        case 'type':
            return 'Type';
        case 'plant_dama':
            return 'Plant Canopy Damage';
        case 'miles_dist':
            return 'Miles Disturbed';
        case 'km_dist':
            return 'Km Disturbed';
        case 'dist_sever':
            return 'Disturbance Severity';
        case 'dist_poly_':
            return 'Disturbance Polygon';
        case 'acres_rest':
            return 'Acres Restored';
        case 'kmsq_resto':
            return 'Km^2 Restored';
        case 'resto_code':
            return 'Restoration Code';
        case 'resto_acti':
            return 'Restoration Activity';
        case 'sqft_resto':
            return 'Ft^2 Restored';
        case 'cultural':
            return 'Are cultural resources impacted?';
        case 'te_act':
            return 'Threatened or Endangered Species Activity';
        case 'nonlists_a':
            return 'Non-listed Species';
        case 'signed':
            return 'Signed';
        case 'mulch':
            return 'Mulch';
        case 'deep_till':
            return 'Deep Tillage';
        case 'barrier_in':
            return 'Barrier Installed';
        case 'monitoring':
            return 'Monitoring';
        case 'shape_leng':
            return 'Shape Length';
        case 'shape_area':
            return 'Shape Area';
        case 'te_action':
            return 'T&E Species';
        case 'treatment_':
            return 'Treatment Type';
        case 'non_list_a':
            return 'Non-listed Species';
        case 'site_vulne':
            return 'Site Vulnerability';
        case 'barr_code':
            return 'Barrier Code';
        case 'barr_actio':
            return 'Barrier Action';
        case 'barr_type':
            return 'Barrier Type';
        case 'barr_miles':
            return 'Miles of Barrier';
        case 'barr_km':
            return 'Km of Barrier';
        case 'resto_act':
            return 'Restoration Activity';
        case 'miles_rest':
            return 'Miles Restored';
        case 'km_resto':
            return 'Km Restored';
        default:
            return prop;
    }
}
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
                color: "#fdfe00",
                fillColor: "#fdfe00"
            };
            break;
        case 1:
            return {
                color: "#54ff01",
                fillColor: "#54ff01"
            };
            break;
        case 2:
            return {
                color: "#005de8",
                fillColor: "#005de8"
            };
            break;
        case 3:
            return {
                color: "#8600ac",
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
        selectedFeature(layer);
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
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
    // console.log(control);
    // // adds black border to Dist Lines
    // var distLines = L.geoJSON(feature, {
    //     style: myStyleLines,
    //     interactive: false
    // }).addTo(map);
    // control._addLayer(distLines, 'Disturbance Lines', {groupName: "Disturbance Data", expanded: true}, true);
    if (loggedIn != null && !loggedIn)
        if (feature.properties['t_e_specie'] == 'Yes' || feature.properties['cultural'] == 'Yes')
            {
                map.removeLayer(layer);
                return;
            }
    $(layer).on('click', function () {
        selectedFeature(layer);
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
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
        selectedFeature(layer);
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
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
        selectedFeature(layer);
        // console.log(feature);
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
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
        selectedFeature(layer);
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            //console.log(prop + ' : ' + feature.properties[prop]);
            if (prop == 'agency') {
                popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
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
        selectedFeature(layer);
        //console.log(feature);
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
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
        selectedFeature(layer);
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                //console.log(prop + ' : ' + feature.properties[prop]);
                popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
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
        selectedFeature(layer);
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
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
        selectedFeature(layer);
        var popUpContent = [];
        // iterating through the "properties" so it can be displayed in the pop-ups
        for (var prop in feature.properties) {
            if (prop == 'agency') {
                popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
            } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
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
    // $(layer).on('click', function () {
    //     var popUpContent = [];
    //     // iterating through the "properties" so it can be displayed in the pop-ups
    //     for (var prop in feature.properties) {
    //         if (prop == 'agency') {
    //             popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
    //         } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
    //     }
    //     // opens the marker info tab on sidebar when clicked
    //     sidebar.open('formTools');
    //     //map.panTo(this.getLatLng());
    //     $('#sidebar1').empty();
    //     $("<B><U>BLM Region</U></B><br />").appendTo('#sidebar1');
    //     for (var ii = 0; ii < popUpContent.length; ii++) {
    //         $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
    //     }
    // });
}

function onEachFSRegion(feature, layer) {
    // $(layer).on('click', function () {
    //     var popUpContent = [];
    //     // iterating through the "properties" so it can be displayed in the pop-ups
    //     for (var prop in feature.properties) {
    //         if (prop == 'agency') {
    //             popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
    //         } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
    //     }
    //     // opens the marker info tab on sidebar when clicked
    //     sidebar.open('formTools');
    //     //map.panTo(this.getLatLng());
    //     $('#sidebar1').empty();
    //     $("<B><U>FS Region</U></B><br />").appendTo('#sidebar1');
    //     for (var ii = 0; ii < popUpContent.length; ii++) {
    //         $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
    //     }
    // });
}

function onEachMDEPBound(feature, layer) {
    // $(layer).on('click', function () {
    //     var popUpContent = [];
    //     // iterating through the "properties" so it can be displayed in the pop-ups
    //     for (var prop in feature.properties) {
    //         if (prop == 'agency') {
    //             popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
    //         } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
    //     }
    //     // opens the marker info tab on sidebar when clicked
    //     sidebar.open('formTools');
    //     //map.panTo(this.getLatLng());
    //     $('#sidebar1').empty();
    //     $("<B><U>MDEP Bound</U></B><br />").appendTo('#sidebar1');
    //     for (var ii = 0; ii < popUpContent.length; ii++) {
    //         $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
    //     }
    // });
}

function onEachMDIBound(feature, layer) {
    // $(layer).on('click', function () {
    //     var popUpContent = [];
    //     // iterating through the "properties" so it can be displayed in the pop-ups
    //     for (var prop in feature.properties) {
    //         if (prop == 'agency') {
    //             popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
    //         } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
    //     }
    //     // opens the marker info tab on sidebar when clicked
    //     sidebar.open('formTools');
    //     //map.panTo(this.getLatLng());
    //     $('#sidebar1').empty();
    //     $("<B><U>MDI Bound</U></B><br />").appendTo('#sidebar1');
    //     for (var ii = 0; ii < popUpContent.length; ii++) {
    //         $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
    //     }
    // });
}

function onEachNVCounty(feature, layer) {
    // $(layer).on('click', function () {
    //     var popUpContent = [];
    //     // iterating through the "properties" so it can be displayed in the pop-ups
    //     for (var prop in feature.properties) {
    //         if (prop == 'agency') {
    //             popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
    //         } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
    //     }
    //     // opens the marker info tab on sidebar when clicked
    //     sidebar.open('formTools');
    //     //map.panTo(this.getLatLng());
    //     $('#sidebar1').empty();
    //     $("<B><U>NV Counties</U></B><br />").appendTo('#sidebar1');
    //     for (var ii = 0; ii < popUpContent.length; ii++) {
    // //         $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
    //      }
    // });
}

function onEachSoilVuln(feature, layer) {
    // $(layer).on('click', function () {
    //     var popUpContent = [];
    //     // iterating through the "properties" so it can be displayed in the pop-ups
    //     for (var prop in feature.properties) {
    //         if (prop == 'agency') {
    //             popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + myAgency(feature.properties[prop]));
    //         } else popUpContent.push('<B>' + setProp(prop) + '</B>' + ' : ' + feature.properties[prop]);
    //     }
    //     // opens the marker info tab on sidebar when clicked
    //     sidebar.open('formTools');
    //     //map.panTo(this.getLatLng());
    //     $('#sidebar1').empty();
    //     $("<B><U>Soil Vulnerability</U></B><br />").appendTo('#sidebar1');
    //     for (var ii = 0; ii < popUpContent.length; ii++) {
    //         $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
    //     }
    // });
}