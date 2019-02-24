var isMobile = false;
// device detection
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) ||
    /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) isMobile = true;

function hostReachable() {

    // Handle IE and more capable browsers
    var xhr = new (window.ActiveXObject || XMLHttpRequest)("Microsoft.XMLHTTP");
    var status;

    // Open new request as a HEAD to the root hostname with a random param to bust the cache
    xhr.open("HEAD", "//" + window.location.hostname + "/?rand=" + Math.floor((1 + Math.random()) * 0x10000), false);

    // Issue request and handle response
    try {
        xhr.send();
        return (xhr.status >= 200 && (xhr.status < 300 || xhr.status === 304));
    }
    catch (error) {
        return false;
    }

}

function fixCollection(data) {
    var newData = [];
    newData.type = "FeatureCollection";
    newData.features = data;
    return newData;

}

const dbCache = new Dexie('CachedData');

dbCache.version(1).stores({
    blmRegion: 'properties.gid, type, geometry',
    fsRegion: 'properties.gid, type, geometry',
    fwsRegion: 'properties.gid, type, geometry',
    npsRegion: 'properties.gid, type, geometry',
    mdepBound: 'properties.gid, type, geometry',
    mdiBound: 'properties.gid, type, geometry',
    nvCounties: 'properties.gid, type, geometry',
    roads: 'properties.gid, type, geometry',
    soilVuln: 'properties.gid, type, geometry',
    snapExtent: 'properties.gid, type, geometry'
});
dbCache.open().then(function (db) {
    console.log('Opened CachedData DB');
    //console.log(db);
}).catch(function (err) {
    console.log(err)
});
var savedLayers = { Barriers: [], RPoints: [], RLines: [], RPolys: [], DPoints: [], DLines: [], DPolys: [] }
async function createLayer(data, layerName) {
    try {
        switch (layerName) {
            case 'Barrier':
                const barrier = await L.geoJson(data, {
                    pane: 'Lines',
                    type: 'Barrier',
                    style: myBarrierLines,
                    onEachFeature: onEachBarrier
                }).addTo(map);
                savedLayers.Barriers = barrier;
                control.addOverlay(barrier, layerName, { groupName: 'Barrier Data', expanded: true });
                console.log(`added ${layerName}`);

                break;

            case 'Disturbance Lines':
                const distLines = await L.geoJson(data, {
                    pane: 'Lines',
                    type: 'Disturbance',
                    style: myStyleLines,
                    onEachFeature: onEachDistLine
                }).addTo(map);
                savedLayers.DLines = distLines;
                control.addOverlay(distLines, layerName, { groupName: 'Disturbance Data', expanded: true });
                console.log(`added ${layerName}`);

                break;

            case 'Disturbance Points':
                const distPoints = await L.geoJson(data, {
                    pane: 'Points',
                    type: 'Disturbance',
                    style: myStyleDistPoints,
                    // changing the default point makers to circle markers
                    pointToLayer: pointToLayer,
                    onEachFeature: onEachDistPoint
                }).addTo(map);
                savedLayers.DPoints = distPoints;
                control.addOverlay(distPoints, layerName, { groupName: 'Disturbance Data', expanded: true });
                console.log(`added ${layerName}`);

                break;

            case 'Disturbance Polygon':
                const distPoly = await L.geoJson(data, {
                    pane: 'Polygons',
                    type: 'Disturbance',
                    style: myStyleDistPoly,
                    onEachFeature: onEachDistPoly
                }).addTo(map);
                savedLayers.DPolys = distPoly;
                control.addOverlay(distPoly, layerName, { groupName: 'Disturbance Data', expanded: true });
                console.log(`added ${layerName}`);

                break;

            case 'Disturbance Poly Cent':
                const distPolyCent = await L.geoJson(data, {
                    pane: 'Polygons',
                    type: 'Disturbance',
                    style: myStyleDistPoly,
                    // changing the default point makers to circle markers
                    pointToLayer: pointToLayer,
                    onEachFeature: onEachDistPolyCent
                }).addTo(map);
                control.addOverlay(distPolyCent, layerName, { groupName: 'Disturbance Data', expanded: true });
                control.unSelectLayer(distPolyCent);
                console.log(`added ${layerName} Unselected`);

                break;

            case 'Restoration Polygon':
                const restoPoly = await L.geoJson(data, {
                    pane: 'Polygons',
                    type: 'Restoration',
                    style: myStyleRestoPoly,
                    onEachFeature: onEachRestoPoly
                }).addTo(map);
                savedLayers.RPolys = restoPoly;
                control.addOverlay(restoPoly, layerName, { groupName: 'Restoration Data', expanded: true });
                console.log(`added ${layerName}`);

                break;

            case 'Restoration Lines':
                const restoLine = await L.geoJson(data, {
                    pane: 'Lines',
                    type: 'Restoration',
                    style: myStyleLines,
                    onEachFeature: onEachRestoLine
                }).addTo(map);
                savedLayers.RLines = restoLine;
                control.addOverlay(restoLine, layerName, { groupName: 'Restoration Data', expanded: true });
                console.log(`added ${layerName}`);

                break;

            case 'Restoration Points':
                const restoPoint = await L.geoJson(data, {
                    pane: 'Points',
                    type: 'Restoration',
                    style: myStylePoints,
                    // changing the default point makers to circle markers
                    pointToLayer: pointToLayer,
                    onEachFeature: onEachRestoPoint
                }).addTo(map);
                savedLayers.RPoints = restoPoint;
                control.addOverlay(restoPoint, layerName, { groupName: 'Restoration Data', expanded: true });
                console.log(`added ${layerName}`);

                break;

            case 'Restoration Poly Cent':
                const restoPolyCent = await L.geoJson(data, {
                    pane: 'Polygons',
                    type: 'Restoration',
                    style: myStylePoints,
                    // changing the default point makers to circle markers
                    pointToLayer: pointToLayer,
                    onEachFeature: onEachRestoPolyCent
                }).addTo(map);

                control.addOverlay(restoPolyCent, layerName, { groupName: 'Restoration Data', expanded: true });
                control.unSelectLayer(restoPolyCent);
                console.log(`added ${layerName} Unselected`);

                break;

            case 'BLM Regions':
                if (data.type == null) {
                    data = data;
                }
                const blmRegions = await L.geoJson(data, {
                    pane: 'Regions',
                    style: blmRegion,
                    onEachFeature: onEachBLMRegion
                }).addTo(map);

                control.addOverlay(blmRegions, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                console.log(`added ${layerName} Unselected`);

                break;

            case 'FS Regions':
                if (data.type == null) {
                    data = data;
                }
                const fsRegions = await L.geoJson(data, {
                    pane: 'Regions',
                    style: fsRegion,
                    onEachFeature: onEachFSRegion
                }).addTo(map);

                control.addOverlay(fsRegions, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                console.log(`added ${layerName} Unselected`);

                break;
                
            case 'FWS Regions':
                if (data.type == null) {
                    data = data;
                }
                const fwsRegions = await L.geoJson(data, {
                    pane: 'Regions',
                    style: fwsRegion
                }).addTo(map);

                control.addOverlay(fwsRegions, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                console.log(`added ${layerName} Unselected`);

                break;
            
            case 'NPS Regions':
                if (data.type == null) {
                    data = data;
                }
                const npsRegions = await L.geoJson(data, {
                    pane: 'Regions',
                    style: npsRegion
                }).addTo(map);

            case 'Nevada Counties':
                if (data.type == null) {
                    data = data;
                }
                const nvCounties = await L.geoJson(data, {
                    pane: 'Bounds_County',
                    style: nv_county,
                    onEachFeature: onEachNVCounty
                }).addTo(map);

                control.addOverlay(nvCounties, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                console.log(`added ${layerName} Unselected`);

                break;

            case 'MDI Boundary':
                if (data.type == null) {
                    data = data;
                }
                const mdiBound = await L.geoJson(data, {
                    pane: 'Bounds_County',
                    style: mdep_i,
                    onEachFeature: onEachMDIBound
                }).addTo(map);

                control.addOverlay(mdiBound, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                console.log(`added ${layerName} Unselected`);

                break;

            case 'MDEP Boundary':
                if (data.type == null) {
                    data = data;
                }
                const mdepBound = await L.geoJson(data, {
                    pane: 'Bounds_County',
                    style: mdep_i,
                    onEachFeature: onEachMDEPBound
                }).addTo(map);

                control.addOverlay(mdepBound, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                console.log(`added ${layerName} Unselected`);

                break;

            case 'Roads':
                if (data.type == null) {
                    data = data;
                }
                const roads = await L.geoJson(data, {
                    pane: 'Lines',
                    style: roadColor,
                    interactive: false
                }).addTo(map);


                control.addOverlay(roads, layerName, { groupName: 'Misc', expanded: false });
                console.log(`added ${layerName} Unselected`);

                break;

            case 'Snap Extent':
                console.log(data)
                if (data.type == null) {
                    data = data;
                }
                console.log(data)
                const snapExtent = await L.geoJson(data, {
                    pane: 'Misc',
                    style: soil_vuln
                }).addTo(map);

                control.addOverlay(snapExtent, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                console.log(`added ${layerName} Unselected`);

                break;

            case 'Soil Vulnerability':
                if (data.type == null) {
                    data = data;
                }
                const soilVuln = await L.geoJson(data, {
                    pane: 'Misc',
                    style: soil_vuln,
                    onEachFeature: onEachSoilVuln
                }).addTo(map);

                control.addOverlay(soilVuln, layerName, { groupName: 'Misc', expanded: false });
                console.log(`added ${layerName} Unselected`);

                break;
        }
        if (isMobile) {
            control.unSelectGroup('Barrier Data');
            control.unSelectGroup('Disturbance Data');
            control.unSelectGroup('Restoration Data');
        }
        control.unSelectGroup('Regions/ Boundaries');
        control.unSelectGroup('Regions/ Boundaries');
        control.unSelectGroup('Roads');
        control.unSelectGroup('Misc');
    }
    catch (err) {
        console.error(err);
    }
};

async function getLayers() {
    if (!hostReachable()) {
        getOfflineLayers()
        return;
    }
    const progress = new LoadingOverlayProgress({
        bar: {
            "background": "#e41a1c",
            "top": "600px",
            "height": "50px"
        },
        text: {
            "color": "black",
            "font-family": "monospace",
            "top": "575px"
        }
    });
    $.LoadingOverlay("show", {
        custom: progress.Init()
    });
    var count = 0;
    const interval = setInterval(function () {
        if (count >= 100) {
            clearInterval(interval);
            //delete progress;
            $.LoadingOverlay("hide");
            return;
        }
        progress.Update(count);
    }, 100);
    var getUrl = window.location;
    var baseUrl = getUrl.origin;
    var ipAddress = "216.117.167.186:443";
    ipAddress = "snap-restoration-brstillwell.c9users.io";
    try {
        $.when(
            await $.getJSON(baseUrl + '/api/Barriers/barrierGeoJSON', function (data) {
                createLayer(data[0].row_to_json, 'Barrier');
                count += 5;
            }),

            await $.getJSON(baseUrl + '/api/DistPoints/distPointGeoJSON', function (data) {
                createLayer(data[0].row_to_json, 'Disturbance Points');
                count += 5;
            }),

            await $.getJSON(baseUrl + '/api/DistLines/distLineGeoJSON', function (data) {
                createLayer(data[0].row_to_json, 'Disturbance Lines');
                count += 15;
            }),

            await $.getJSON(baseUrl + '/api/DistPolygons/distPolyGeoJSON', function (data) {
                createLayer(data[0].row_to_json, 'Disturbance Polygon');
                count += 10;
            }),

            $.getJSON(baseUrl + '/api/DistPolyCentroids/distPolyCentGeoJSON', function (data) {
                createLayer(data[0].row_to_json, 'Disturbance Poly Cent');
                count += 5;
            }),

            await $.getJSON(baseUrl + '/api/RestoPoints/restoPointGeoJSON', function (data) {
                createLayer(data[0].row_to_json, 'Restoration Points');
                count += 5;
            }),

            await $.getJSON(baseUrl + '/api/RestoLines/restoLineGeoJSON', function (data) {
                createLayer(data[0].row_to_json, 'Restoration Lines');
                count += 5;
            }),
            //createLayer('/public/geoJSON/roads.zip', 'Roads'),
            await $.getJSON(baseUrl + '/api/RestoPolygons/restoPolyGeoJSON', function (data) {
                createLayer(data[0].row_to_json, 'Restoration Polygon');
                count += 5;
            }),

            await $.getJSON(baseUrl + '/api/RestPolyCentroids/restoPolyCentGeoJSON', function (data) {
                createLayer(data[0].row_to_json, 'Restoration Poly Cent');
                count += 5;
            }),
            await dbCache.blmRegion.count(function (records) {
                if (records > 0) {
                    dbCache.blmRegion.toArray(function (data) {
                        createLayer(data, 'BLM Regions');
                        count += 5;
                    });
                    console.log("cached blmRegion loaded");
                }
                else {
                    $.getJSON(baseUrl + '/public/geoJSON/blmRegions.json', function (data) {
                        createLayer(data, 'BLM Regions');
                        dbCache.blmRegion.bulkAdd(data.features).then(function (lastKey) {
                            console.log("Done caching BLM");
                        }).catch(Dexie.BulkError, function (e) {
                            // Explicitely catching the bulkAdd() operation makes those successful
                            // additions commit despite that there were errors.
                            console.error("Some blmRegion did not succeed. However, " +
                                100000 - e.failures.length + " blmRegion was added successfully");
                        });
                        count += 5;
                    })
                        .fail(function (jqXHR, textStatus, error) {
                            console.log(JSON.stringify(jqXHR));
                        })
                }
            }),

            await dbCache.fsRegion.count(function (records) {
                if (records > 0) {
                    dbCache.fsRegion.toArray(function (data) {
                        createLayer(data, 'FS Regions');
                        count += 5;
                    });
                    console.log("cached fsRegion loaded");
                }
                else {
                    $.getJSON(baseUrl + '/public/geoJSON/fsRegions.json', function (data) {
                        createLayer(data, 'FS Regions');
                        dbCache.fsRegion.bulkAdd(data.features).then(function (lastKey) {
                            console.log("Done caching FS Regions");
                        }).catch(Dexie.BulkError, function (e) {
                            // Explicitely catching the bulkAdd() operation makes those successful
                            // additions commit despite that there were errors.
                            console.error("Some FS Regions did not succeed. However, " +
                                100000 - e.failures.length + " FS Regions was added successfully");
                        });
                        count += 5;
                    })
                        .fail(function (jqXHR, textStatus, error) {
                            console.log(JSON.stringify(jqXHR));
                        })
                }
            }),
            await dbCache.fwsRegion.count(function (records) {
                if (records > 0) {
                    dbCache.fwsRegion.toArray(function (data) {
                        createLayer(data, 'FWS Regions');
                        count += 5;
                    });
                    console.log("cached FWS Regions loaded");
                }
                else {
                    $.getJSON(baseUrl + '/public/geoJSON/fwsRegions.json', function (data) {
                        createLayer(data, 'FWS Regions');
                        dbCache.fwsRegion.bulkAdd(data.features).then(function (lastKey) {
                            console.log("Done caching FWS Regions");
                        }).catch(Dexie.BulkError, function (e) {
                            // Explicitely catching the bulkAdd() operation makes those successful
                            // additions commit despite that there were errors.
                            console.error("Some fwsRegion did not succeed. However, " +
                                100000 - e.failures.length + " fwsRegion was added successfully");
                        });
                        count += 5;
                    })
                        .fail(function (jqXHR, textStatus, error) {
                            console.log(JSON.stringify(jqXHR));
                        })
                }
            }),
            await dbCache.npsRegion.count(function (records) {
                if (records > 0) {
                    dbCache.npsRegion.toArray(function (data) {
                        createLayer(data, 'NPS Regions');
                        count += 5;
                    });
                    console.log("cached NPS Regions loaded");
                }
                else {
                    $.getJSON(baseUrl + '/public/geoJSON/npsRegions.json', function (data) {
                        createLayer(data, 'NPS Regions');
                        dbCache.npsRegion.bulkAdd(data.features).then(function (lastKey) {
                            console.log("Done caching NPS Regions");
                        }).catch(Dexie.BulkError, function (e) {
                            // Explicitely catching the bulkAdd() operation makes those successful
                            // additions commit despite that there were errors.
                            console.error("Some npsRegion did not succeed. However, " +
                                100000 - e.failures.length + " npsRegion was added successfully");
                        });
                        count += 5;
                    })
                        .fail(function (jqXHR, textStatus, error) {
                            console.log(JSON.stringify(jqXHR));
                        })
                }
            }),

            await dbCache.mdepBound.count(function (records) {
                if (records > 0) {
                    dbCache.mdepBound.toArray(function (data) {
                        createLayer(data, 'MDEP Boundary');
                        count += 5;
                    });
                    console.log("cached mdepBound loaded");
                }
                else {
                    $.getJSON(baseUrl + '/public/geoJSON/mdepBoundry.json', function (data) {
                        createLayer(data, 'MDEP Boundary');
                        dbCache.mdepBound.bulkAdd(data.features).then(function (lastKey) {
                            console.log("Done caching MDEP Boundary");
                        }).catch(Dexie.BulkError, function (e) {
                            // Explicitely catching the bulkAdd() operation makes those successful
                            // additions commit despite that there were errors.
                            console.error("Some MDEP Boundary did not succeed. However, " +
                                100000 - e.failures.length + " MDEP Boundary was added successfully");
                        });
                        count += 5;
                    })
                        .fail(function (jqXHR, textStatus, error) {
                            console.log(JSON.stringify(jqXHR));
                        })
                }
            }),

            await dbCache.mdiBound.count(function (records) {
                if (records > 0) {
                    dbCache.mdiBound.toArray(function (data) {
                        createLayer(data, 'MDI Boundary');
                        count += 5;
                    });
                    console.log("cached MDI Boundary loaded");
                }
                else {
                    $.getJSON(baseUrl + '/public/geoJSON/mdiBoundry.json', function (data) {
                        createLayer(data, 'MDI Boundary');
                        dbCache.mdiBound.bulkAdd(data.features).then(function (lastKey) {
                            console.log("Done caching MDI Boundary");
                        }).catch(Dexie.BulkError, function (e) {
                            // Explicitely catching the bulkAdd() operation makes those successful
                            // additions commit despite that there were errors.
                            console.error("Some MDI Boundary did not succeed. However, " +
                                100000 - e.failures.length + " MDI Boundary was added successfully");
                        });
                        count += 5;
                    })
                        .fail(function (jqXHR, textStatus, error) {
                            console.log(JSON.stringify(jqXHR));
                        })
                }
            }),

            await dbCache.nvCounties.count(function (records) {
                if (records > 0) {
                    dbCache.nvCounties.toArray(function (data) {
                        createLayer(data, 'Nevada Counties');
                        count += 5;
                    });
                    console.log("cached Nevada Counties loaded");
                }
                else {
                    $.getJSON(baseUrl + '/public/geoJSON/nvCounties.json', function (data) {
                        createLayer(data, 'Nevada Counties');
                        dbCache.nvCounties.bulkAdd(data.features).then(function (lastKey) {
                            console.log("Done caching Nevada Counties");
                        }).catch(Dexie.BulkError, function (e) {
                            // Explicitely catching the bulkAdd() operation makes those successful
                            // additions commit despite that there were errors.
                            console.error("Some Nevada Counties did not succeed. However, " +
                                100000 - e.failures.length + " Nevada Counties was added successfully");
                        });
                        count += 5;
                    })
                        .fail(function (jqXHR, textStatus, error) {
                            console.log(JSON.stringify(jqXHR));
                        });
                }
            }),
            await dbCache.snapExtent.count(function (records) {
                if (records > 0) {
                    dbCache.snapExtent.toArray(function (data) {
                        createLayer(data, 'Snap Extent');
                        count += 5;
                    });
                    console.log("cached snapExtent loaded");
                }
                else {
                    $.getJSON(baseUrl + '/public/geoJSON/snapExtents.json', function (data) {
                        createLayer(data, 'Snap Extent');
                        dbCache.snapExtent.bulkAdd(data.features).then(function (lastKey) {
                            console.log("Done caching snapExtent");
                        }).catch(Dexie.BulkError, function (e) {
                            // Explicitely catching the bulkAdd() operation makes those successful
                            // additions commit despite that there were errors.
                            console.error("Some snapExtent did not succeed. However, " +
                                100000 - e.failures.length + " snapExtent was added successfully");
                        });
                        count += 5;
                    })
                        .fail(function (jqXHR, textStatus, error) {
                            console.log(JSON.stringify(jqXHR));
                        })
                }
            }),
        ).then(function () {
            //$.LoadingOverlay("hide");
            console.log(count);
        });
    }
    catch (err) {
        console.error(err);
        console.log('Now Loading Offline layers')
        count = 100;
        getOfflineLayers();
    }
}


async function getOfflineLayers() {
    const progress = new LoadingOverlayProgress({
        bar: {
            "background": "#e41a1c",
            "top": "600px",
            "height": "50px"
        },
        text: {
            "color": "black",
            "font-family": "monospace",
            "top": "575px"
        }
    });
    $.LoadingOverlay("show", {
        custom: progress.Init()
    });
    var count = 0;
    const interval = setInterval(function () {
        if (count >= 100) {
            clearInterval(interval);
            //delete progress;
            $.LoadingOverlay("hide");
            return;
        }
        progress.Update(count);
    }, 100);
    var getUrl = window.location;
    var baseUrl = getUrl.origin;
    try {
        $.when(
            dbCache.snapExtent.count(function (records) {
                if (records > 0) {
                    dbCache.snapExtent.toArray(function (data) {
                        createLayer(data, 'Snap Extent');
                    });
                    console.log("cached snapExtent loaded");
                }
                count += 20;
            }),

            dbCache.blmRegion.count(function (records) {
                if (records > 0) {
                    dbCache.blmRegion.toArray(function (data) {
                        createLayer(data, 'BLM Regions');
                    });
                    console.log("cached blmRegion loaded");
                }
                count += 30;
            }),

            dbCache.fsRegion.count(function (records) {
                if (records > 0) {
                    dbCache.fsRegion.toArray(function (data) {
                        createLayer(data, 'FS Regions');
                    });
                    console.log("cached fsRegion loaded");
                }
                count += 10;
            }),
            dbCache.fwsRegion.count(function (records) {
                if (records > 0) {
                    dbCache.fwsRegion.toArray(function (data) {
                        createLayer(data, 'FWS Regions');
                    });
                    console.log("cached fwsRegion loaded");
                }
                count += 5;
            }),
            
            dbCache.npsRegion.count(function (records) {
                if (records > 0) {
                    dbCache.fsRegion.toArray(function (data) {
                        createLayer(data, 'NPS Regions');
                    });
                    console.log("cached npsRegion loaded");
                }
                count += 5;
            }),

            dbCache.mdepBound.count(function (records) {
                if (records > 0) {
                    dbCache.mdepBound.toArray(function (data) {
                        createLayer(data, 'MDEP Boundary');
                    });
                    console.log("cached mdepBound loaded");
                }
                count += 10;
            }),

            dbCache.mdiBound.count(function (records) {
                if (records > 0) {
                    dbCache.mdiBound.toArray(function (data) {
                        createLayer(data, 'MDI Boundary');
                    });
                    console.log("cached MDI Boundary loaded");
                }
                count += 10;
            }),

            dbCache.nvCounties.count(function (records) {
                if (records > 0) {
                    dbCache.nvCounties.toArray(function (data) {
                        createLayer(data, 'Nevada Counties');
                    });
                    console.log("cached Nevada Counties loaded");
                }
                count += 10;
            })
        ).then(function () {
            //$.LoadingOverlay("hide");
            console.log(count);
        });
    }
    catch (err) {
        console.error(err);
    }
}
