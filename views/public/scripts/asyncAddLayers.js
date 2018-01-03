const db = new Dexie('CachedData');

  db.version(1).stores({
    blmRegion: 'properties.gid, type, geometry',
    fsRegion: 'properties.gid, type, geometry',
    mdepBound: 'properties.gid, type, geometry',
    mdiBound: 'properties.gid, type, geometry',
    nvCounties: 'properties.gid, type, geometry',
    roads: 'properties.gid, type, geometry',
    soilVuln: 'properties.gid, type, geometry',
    snapExtent: 'properties.gid, type, geometry'
  });
  db.open().then(function (db) {
    console.log('Opened CachedData DB');
    //console.log(db);
  }).catch(function (err) {
    console.log(err)
  });

async function createLayer(data, layerName) {
  try {
    switch (layerName) {
      case 'Barrier':
        const barrier = await L.geoJson(data, {
          pane: 'Lines',
          style: myStyleLines,
          onEachFeature: onEachBarrier
        }).addTo(map);

        control.addOverlay(barrier, layerName, {groupName: 'Barrier Data', expanded: true});
        console.log(`added ${layerName}`);

        break;

      case 'Disturbance Lines':
        const distLines = await L.geoJson(data, {
          pane: 'Lines',
          style: myStyleLines,
          onEachFeature: onEachDistLine
        }).addTo(map);

        control.addOverlay(distLines, layerName, {groupName: 'Disturbance Data', expanded: true});
        console.log(`added ${layerName}`);

        break;

      case 'Disturbance Points':
        const distPoints = await L.geoJson(data, {
          pane: 'Points',
          style: myStylePoints,
          // changing the default point makers to circle markers
          pointToLayer: pointToLayer,
          onEachFeature: onEachDistPoint
        }).addTo(map);

        control.addOverlay(distPoints, layerName, {groupName: 'Disturbance Data', expanded: true});
        console.log(`added ${layerName}`);

        break;

      case 'Disturbance Polygon':
        const distPoly = await L.geoJson(data, {
          pane: 'Polygons',
          style: myStyleDistPoly,
          onEachFeature: onEachDistPoly
        }).addTo(map);

        control.addOverlay(distPoly, layerName, {groupName: 'Disturbance Data', expanded: true});
        console.log(`added ${layerName}`);

        break;

      case 'Disturbance Poly Cent':
        const distPolyCent = await L.geoJson(data, {
          pane: 'Points',
          style: myStyleDistPoly,
          // changing the default point makers to circle markers
          pointToLayer: pointToLayer,
          onEachFeature: onEachDistPolyCent
        }).addTo(map);

        control.addOverlay(distPolyCent, layerName, {groupName: 'Disturbance Data', expanded: true});
        control.unSelectLayer(distPolyCent);
        console.log(`added ${layerName} Unselected`);

        break;

      case 'Restoration Polygon':
        const restoPoly = await L.geoJson(data, {
          pane: 'Polygons',
          style: myStyleRestoPoly,
          onEachFeature: onEachRestoPoly
        }).addTo(map);

        control.addOverlay(restoPoly, layerName, {groupName: 'Restoration Data', expanded: true});
        console.log(`added ${layerName}`);

        break;

      case 'Restoration Lines':
        const restoLine = await L.geoJson(data, {
          pane: 'Lines',
          style: myStyleLines,
          onEachFeature: onEachRestoLine
        }).addTo(map);

        control.addOverlay(restoLine, layerName, {groupName: 'Restoration Data', expanded: true});
        console.log(`added ${layerName}`);

        break;

      case 'Restoration Points':
        const restoPoint = await L.geoJson(data, {
          pane: 'Points',
          style: myStylePoints,
          // changing the default point makers to circle markers
          pointToLayer: pointToLayer,
          onEachFeature: onEachRestoPoint
        }).addTo(map);

        control.addOverlay(restoPoint, layerName, {groupName: 'Restoration Data', expanded: true});
        console.log(`added ${layerName}`);

        break;

      case 'Restoration Poly Cent':
        const restoPolyCent = await L.geoJson(data, {
          pane: 'Points',
          style: myStylePoints,
          // changing the default point makers to circle markers
          pointToLayer: pointToLayer,
          onEachFeature: onEachRestoPolyCent
        }).addTo(map);

        control.addOverlay(restoPolyCent, layerName, {groupName: 'Restoration Data', expanded: true});
        control.unSelectLayer(restoPolyCent);
        console.log(`added ${layerName} Unselected`);

        break;

      case 'BLM':
        const blmRegions = await L.geoJson(data, {
          pane: 'Regions',
          style: blmRegion,
          onEachFeature: onEachBLMRegion
        }).addTo(map);

        control.addOverlay(blmRegions, layerName, {groupName: 'Regions/ Counties', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'FS Regions':
        const fsRegions = await L.geoJson(data, {
          pane: 'Regions',
          style: fsRegion,
          onEachFeature: onEachFSRegion
        }).addTo(map);

        control.addOverlay(fsRegions, layerName, {groupName: 'Regions/ Counties', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'Nevada Counties':
        const nvCounties = await L.geoJson(data, {
          pane: 'Bounds_County',
          style: nv_county,
          onEachFeature: onEachNVCounty
        }).addTo(map);

        control.addOverlay(nvCounties, layerName, {groupName: 'Regions/ Counties', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'MDI Boundary':
        const mdiBound = await L.geoJson(data, {
          pane: 'Bounds_County',
          style: mdep_i,
          onEachFeature: onEachMDIBound
        }).addTo(map);

        control.addOverlay(mdiBound, layerName, {groupName: 'Boundaries', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'MDEP Boundary':
        const mdepBound = await L.geoJson(data, {
          pane: 'Bounds_County',
          style: mdep_i,
          onEachFeature: onEachMDEPBound
        }).addTo(map);

        control.addOverlay(mdepBound, layerName, {groupName: 'Boundaries', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'Roads':
        const roads = await L.shapefile(data, {
          pane: 'Lines',
          style: roadColor
        }).addTo(map);

        control.addOverlay(roads, layerName, {groupName: 'Roads', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'Snap Extent':
        const snapExtent = await L.geoJson(data, {
          pane: 'Misc',
          style: soil_vuln,
          onEachFeature: onEachSoilVuln
        }).addTo(map);

        control.addOverlay(snapExtent, layerName, {groupName: 'Misc', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'Soil Vulnerability':
        const soilVuln = await L.geoJson(data, {
          pane: 'Misc',
          style: soil_vuln
          //onEachFeature: onEachSoilVuln
        }).addTo(map);

        control.addOverlay(soilVuln, layerName, {groupName: 'Misc', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;
    }
    control.unSelectGroup('Regions/ Counties');
    control.unSelectGroup('Boundaries');
    control.unSelectGroup('Roads');
    control.unSelectGroup('Misc');
  }
  catch (err) {
    console.error(err);
  }
};

async function getLayers() {
  const progress = new LoadingOverlayProgress({
    bar     : {
      "background"    : "#e41a1c",
      "top"           : "600px",
      "height"        : "50px"
    },
    text    : {
      "color"         : "black",
      "font-family"   : "monospace",
      "top"           : "575px"
    }
  });
  $.LoadingOverlay("show", {
    custom  : progress.Init()
  });
  var count = 0;
  const interval = setInterval(function(){
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
      await $.getJSON(baseUrl +  '/api/Barriers/barrierGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Barrier');
        count += 5;
      }),

      await $.getJSON(baseUrl + '/api/DistPoints/distPointGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Points');
        count += 5;
      }),

      await $.getJSON(baseUrl + '/api/DistLines/distLineGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Lines');
        count += 5;
      }),

      await $.getJSON(baseUrl + '/api/DistPolygons/distPolyGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Polygon');
        count += 5;
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
        count += 35;
      }),
      createLayer('/public/geoJSON/roads.zip', 'Roads'),
      /*
      db.roads.count(function (records) { 
        if (records > 0) {
          db.roads.toArray(function(data) { createLayer(data, 'Roads')});
          console.log("cached data loaded");
          count += 15;
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/roads.json', function (data) {
            createLayer(data, 'Roads');
            console.log(data);
            db.roads.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching roads");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some roads did not succeed. However, " +
                   100000-e.failures.length + " roads was added successfully");
            });
            count += 15;
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
      }),
      */
      
      db.soilVuln.count(function (records) { 
        if (records > 0) {
          db.soilVuln.toArray(function(data) { createLayer(data, 'Soil Vulnerability')});
          console.log("cached data loaded");
          count += 10;
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/soil.json', function (data) {
            createLayer(data, 'Soil Vulnerability');
            console.log(data);
            db.soilVuln.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching soilVuln");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some soilVuln did not succeed. However, " +
                   100000-e.failures.length + " soilVuln was added successfully");
            });
            count += 10;
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
      }),

      await $.getJSON(baseUrl + '/api/RestoPolygons/restoPolyGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Polygon');
        count += 5;
      }),

      $.getJSON(baseUrl + '/api/RestPolyCentroids/restoPolyCentGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Poly Cent');
        count += 5;
      }),
      
      db.snapExtent.count(function (records) { 
        if (records > 0) {
          db.snapExtent.toArray(function(data) { createLayer(data, 'Snap Extent')});
          console.log("cached snapExtent loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/snapExtents.json', function (data) {
            createLayer(data, 'Snap Extent');
            db.snapExtent.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching snapExtent");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some snapExtent did not succeed. However, " +
                   100000-e.failures.length + " snapExtent was added successfully");
            });
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
        count += 5;
      }),
      
      db.blmRegion.count(function (records) { 
        if (records > 0) {
          db.blmRegion.toArray(function(data) { createLayer(data, 'BLM')});
          console.log("cached blmRegion loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/blmRegions.json', function (data) {
            createLayer(data, 'BLM');
            db.blmRegion.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching BLM");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some blmRegion did not succeed. However, " +
                   100000-e.failures.length + " blmRegion was added successfully");
            });
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
        count += 5;
      }),
      
      db.fsRegion.count(function (records) { 
        if (records > 0) {
          db.fsRegion.toArray(function(data) { createLayer(data, 'FS Regions')});
          console.log("cached fsRegion loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/fsRegions.json', function (data) {
            createLayer(data, 'FS Regions');
            db.fsRegion.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching FS Regions");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some FS Regions did not succeed. However, " +
                   100000-e.failures.length + " FS Regions was added successfully");
            });
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
        count += 5;
      }),
      
      db.mdepBound.count(function (records) { 
        if (records > 0) {
          db.mdepBound.toArray(function(data) { createLayer(data, 'MDEP Boundary')});
          console.log("cached mdepBound loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/mdepBoundry.json', function (data) {
            createLayer(data, 'MDEP Boundary');
            db.mdepBound.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching MDEP Boundary");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some MDEP Boundary did not succeed. However, " +
                   100000-e.failures.length + " MDEP Boundary was added successfully");
            });
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
        count += 5;
      }),
      
      db.mdiBound.count(function (records) { 
        if (records > 0) {
          db.mdiBound.toArray(function(data) { createLayer(data, 'MDI Boundary')});
          console.log("cached MDI Boundary loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/mdiBoundry.json', function (data) {
            createLayer(data, 'MDI Boundary');
            db.mdiBound.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching MDI Boundary");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some MDI Boundary did not succeed. However, " +
                   100000-e.failures.length + " MDI Boundary was added successfully");
            });
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
        count += 5;
      }),
      
      db.nvCounties.count(function (records) { 
        if (records > 0) {
          db.nvCounties.toArray(function(data) { createLayer(data, 'Nevada Counties')});
          console.log("cached Nevada Counties loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/nvCounties.json', function (data) {
            createLayer(data, 'Nevada Counties');
            db.nvCounties.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching Nevada Counties");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some Nevada Counties did not succeed. However, " +
                   100000-e.failures.length + " Nevada Counties was added successfully");
            });
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
        count += 5;
      })
    ).then(function () {
      //$.LoadingOverlay("hide");
      console.log(count);
    });
  }
  catch (err) {
    console.error(err);
  }
};
