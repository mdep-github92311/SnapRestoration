function hostReachable() {

  // Handle IE and more capable browsers
  var xhr = new ( window.ActiveXObject || XMLHttpRequest )( "Microsoft.XMLHTTP" );
  var status;

  // Open new request as a HEAD to the root hostname with a random param to bust the cache
  xhr.open( "HEAD", "//" + window.location.hostname + "/?rand=" + Math.floor((1 + Math.random()) * 0x10000), false );

  // Issue request and handle response
  try {
    xhr.send();
    return ( xhr.status >= 200 && (xhr.status < 300 || xhr.status === 304) );
  } catch (error) {
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

async function createLayer(data, layerName) {
  //console.log(layerName)
  if (data == null || data.features == null)
    return;
    console.log(data)
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
        if(data.type == null) {
          data = fixCollection(data);
        }
        const blmRegions = await L.geoJson(data, {
          pane: 'Regions',
          style: blmRegion,
          onEachFeature: onEachBLMRegion
        }).addTo(map);

        control.addOverlay(blmRegions, layerName, {groupName: 'Regions/ Counties', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'FS Regions':
        if(data.type == null) {
          data = fixCollection(data);
        }
        const fsRegions = await L.geoJson(data, {
          pane: 'Regions',
          style: fsRegion,
          onEachFeature: onEachFSRegion
        }).addTo(map);

        control.addOverlay(fsRegions, layerName, {groupName: 'Regions/ Counties', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'Nevada Counties':
        if(data.type == null) {
          data = fixCollection(data);
        }
        const nvCounties = await L.geoJson(data, {
          pane: 'Bounds_County',
          style: nv_county,
          onEachFeature: onEachNVCounty
        }).addTo(map);

        control.addOverlay(nvCounties, layerName, {groupName: 'Regions/ Counties', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'MDI Boundary':
        if(data.type == null) {
          data = fixCollection(data);
        }
        const mdiBound = await L.geoJson(data, {
          pane: 'Bounds_County',
          style: mdep_i,
          onEachFeature: onEachMDIBound
        }).addTo(map);

        control.addOverlay(mdiBound, layerName, {groupName: 'Boundaries', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'MDEP Boundary':
        if(data.type == null) {
          data = fixCollection(data);
        }
        const mdepBound = await L.geoJson(data, {
          pane: 'Bounds_County',
          style: mdep_i,
          onEachFeature: onEachMDEPBound
        }).addTo(map);

        control.addOverlay(mdepBound, layerName, {groupName: 'Boundaries', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'Roads':
        if(data.type == null) {
          data = fixCollection(data);
        }
        const roads = await L.geoJson(data, {
          pane: 'Lines',
          style: roadColor
        }).addTo(map);
        

        control.addOverlay(roads, layerName, {groupName: 'Roads', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'Snap Extent':
        console.log(data)
        if(data.type == null) {
          data = fixCollection(data);
        }
        console.log(data)
        const snapExtent = await L.geoJson(data, {
          pane: 'Misc',
          style: soil_vuln,
          onEachFeature: onEachSoilVuln
        }).addTo(map);

        control.addOverlay(snapExtent, layerName, {groupName: 'Misc', expanded: false});
        console.log(`added ${layerName} Unselected`);

        break;

      case 'Soil Vulnerability':
        if(data.type == null) {
          data = fixCollection(data);
        }
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
  if (!hostReachable())
  {
    getOfflineLayers()
    return;
  }
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
      await $.getJSON(baseUrl +  '/api/BarrierBLMs', function (data) {
        createLayer(data[0].row_to_json, 'Barrier');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/DistPointBLMs/distPointBLMGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Points');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/DistLineBLMs/distLineBLMGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Lines');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/DistPolygonBLMs/distPolyBLMGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Polygon');
        count += 1;
      }),

      $.getJSON(baseUrl + '/api/DistPolyCentroidBLMs/distPolyCentBLMGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Poly Cent');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/RestoPointBLMs/restoPointBLMGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Points');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/RestoLineBLMs/restoLineBLMGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Lines');
        count += 1;
      }),
      
      await $.getJSON(baseUrl + '/api/RestoPolygonBLMs/restoPolyBLMGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Polygon');
        count += 2;
      }),

      $.getJSON(baseUrl + '/api/RestPolyCentroidBLMs/restoPolyCentBLMGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Poly Cent');
        count += 2;
      }),
      
      await $.getJSON(baseUrl +  '/api/BarrierFs', function (data) {
        createLayer(data[0].row_to_json, 'Barrier');
        count += 2;
      }),

      await $.getJSON(baseUrl + '/api/DistPointFs/distPointFSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Points');
        count += 2;
      }),

      await $.getJSON(baseUrl + '/api/DistLineFs/distLineFSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Lines');
        count += 2;
      }),

      await $.getJSON(baseUrl + '/api/DistPolygonFs/distPolyFSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Polygon');
        count += 2;
      }),

      $.getJSON(baseUrl + '/api/DistPolyCentroidFs/distPolyCentFSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Poly Cent');
        count += 2;
      }),

      await $.getJSON(baseUrl + '/api/RestoPointFs/restoPointFSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Points');
        count += 2;
      }),

      await $.getJSON(baseUrl + '/api/RestoLineFs/restoLineFSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Lines');
        count += 2;
      }),
      
      await $.getJSON(baseUrl + '/api/RestoPolygonFs/restoPolyFSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Polygon');
        count += 2;
      }),

      $.getJSON(baseUrl + '/api/RestPolyCentroidFs/restoPolyCentFSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Poly Cent');
        count += 2;
      }),
      
      await $.getJSON(baseUrl +  '/api/BarrierFWs', function (data) {
        createLayer(data[0].row_to_json, 'Barrier');
        count += 2;
      }),

      await $.getJSON(baseUrl + '/api/DistPointFWs/distPointFWSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Points');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/DistLineFWs/distLineFWSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Lines');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/DistPolygonFWs/distPolyFWSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Polygon');
        count += 1;
      }),

      $.getJSON(baseUrl + '/api/DistPolyCentroidFWs/distPolyCentFWSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Poly Cent');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/RestoPointFWs/restoPointFWSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Points');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/RestoLineFWs/restoLineFWSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Lines');
        count += 1;
      }),
      
      await $.getJSON(baseUrl + '/api/RestoPolygonFWs/restoPolyFWSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Polygon');
        count += 1;
      }),

      $.getJSON(baseUrl + '/api/RestPolyCentroidFWs/restoPolyCentFWSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Poly Cent');
        count += 1;
      }),
      
      await $.getJSON(baseUrl +  '/api/BarrierNPs', function (data) {
        createLayer(data[0].row_to_json, 'Barrier');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/DistPointNPs/distPointNPSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Points');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/DistLineNPs/distLineNPSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Lines');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/DistPolygonNPs/distPolyNPSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Polygon');
        count += 1;
      }),

      $.getJSON(baseUrl + '/api/DistPolyCentroidNPs/distPolyCentNPSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Poly Cent');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/RestoPointNPs/restoPointNPSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Points');
        count += 1;
      }),

      await $.getJSON(baseUrl + '/api/RestoLineNPs/restoLineNPSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Lines');
        count += 1;
      }),
      
      await $.getJSON(baseUrl + '/api/RestoPolygonNPs/restoPolyNPSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Polygon');
        count += 1;
      }),

      $.getJSON(baseUrl + '/api/RestPolyCentroidNPs/restoPolyCentNPSGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Poly Cent');
        count += 1;
      }),
      //createLayer('/public/geoJSON/roads.zip', 'Roads'),
      
      dbCache.roads.count(function (records) { 
        if (records > 0) {
          dbCache.roads.toArray(function(data) { 
            createLayer(data, 'Roads')
            count += 15;
          });
          console.log("cached data loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/roads.json', function (data) {
            createLayer(data, 'Roads');
            console.log(data);
            dbCache.roads.bulkAdd(data.features).then(function(lastKey) {
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
      
      
      dbCache.soilVuln.count(function (records) { 
        if (records > 0) {
          dbCache.soilVuln.toArray(function(data) { 
            createLayer(data, 'Soil Vulnerability');
            count += 10;
          });
          console.log("cached data loaded");
          
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/soil.json', function (data) {
            createLayer(data, 'Soil Vulnerability');
            console.log(data);
            dbCache.soilVuln.bulkAdd(data.features).then(function(lastKey) {
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
      
      dbCache.snapExtent.count(function (records) { 
        if (records > 0) {
          dbCache.snapExtent.toArray(function(data) { 
            createLayer(data, 'Snap Extent');
            count += 5;
          });
          console.log("cached snapExtent loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/snapExtents.json', function (data) {
            createLayer(data, 'Snap Extent');
            dbCache.snapExtent.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching snapExtent");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some snapExtent did not succeed. However, " +
                   100000-e.failures.length + " snapExtent was added successfully");
            });
            count += 5;
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
      }),
      
      dbCache.blmRegion.count(function (records) { 
        if (records > 0) {
          dbCache.blmRegion.toArray(function(data) { 
            createLayer(data, 'BLM');
            count += 5;
          });
          console.log("cached blmRegion loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/blmRegions.json', function (data) {
            createLayer(data, 'BLM');
            dbCache.blmRegion.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching BLM");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some blmRegion did not succeed. However, " +
                   100000-e.failures.length + " blmRegion was added successfully");
            });
            count += 5;
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
      }),
      
      dbCache.fsRegion.count(function (records) { 
        if (records > 0) {
          dbCache.fsRegion.toArray(function(data) { 
            createLayer(data, 'FS Regions');
            count += 5;
          });
          console.log("cached fsRegion loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/fsRegions.json', function (data) {
            createLayer(data, 'FS Regions');
            dbCache.fsRegion.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching FS Regions");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some FS Regions did not succeed. However, " +
                   100000-e.failures.length + " FS Regions was added successfully");
            });
            count += 5;
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
      }),
      
      dbCache.mdepBound.count(function (records) { 
        if (records > 0) {
          dbCache.mdepBound.toArray(function(data) { 
            createLayer(data, 'MDEP Boundary');
            count += 5;
          });
          console.log("cached mdepBound loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/mdepBoundry.json', function (data) {
            createLayer(data, 'MDEP Boundary');
            dbCache.mdepBound.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching MDEP Boundary");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some MDEP Boundary did not succeed. However, " +
                   100000-e.failures.length + " MDEP Boundary was added successfully");
            });
            count += 5;
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
      }),
      
      dbCache.mdiBound.count(function (records) { 
        if (records > 0) {
          dbCache.mdiBound.toArray(function(data) { 
            createLayer(data, 'MDI Boundary');
            count += 5;
          });
          console.log("cached MDI Boundary loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/mdiBoundry.json', function (data) {
            createLayer(data, 'MDI Boundary');
            dbCache.mdiBound.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching MDI Boundary");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some MDI Boundary did not succeed. However, " +
                   100000-e.failures.length + " MDI Boundary was added successfully");
            });
            count += 5;
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          })                      
        }
      }),
      
      dbCache.nvCounties.count(function (records) { 
        if (records > 0) {
          dbCache.nvCounties.toArray(function(data) { 
            createLayer(data, 'Nevada Counties');
            count += 5;
          });
          console.log("cached Nevada Counties loaded");
        }
        else {
          $.getJSON(baseUrl + '/public/geoJSON/nvCounties.json', function (data) {
            createLayer(data, 'Nevada Counties');
            dbCache.nvCounties.bulkAdd(data.features).then(function(lastKey) {
                console.log("Done caching Nevada Counties");
            }).catch(Dexie.BulkError, function (e) {
                // Explicitely catching the bulkAdd() operation makes those successful
                // additions commit despite that there were errors.
                console.error ("Some Nevada Counties did not succeed. However, " +
                   100000-e.failures.length + " Nevada Counties was added successfully");
            });
            count += 5;
          })
          .fail(function(jqXHR, textStatus, error) {
            console.log(JSON.stringify(jqXHR));
          });                    
        }
      })
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
  try {
    $.when(
      dbCache.roads.count(function (records) { 
        if (records > 0) {
          dbCache.roads.toArray(function(data) { 
            createLayer(data, 'Roads');
          });
          console.log("cached data loaded");
        }
        count += 20;
      }),
      dbCache.soilVuln.count(function (records) { 
        if (records > 0) {
          dbCache.soilVuln.toArray(function(data) { 
            createLayer(data, 'Soil Vulnerability');
          });
          console.log("cached data loaded");
        }
        count += 20;
      }),
      
      dbCache.snapExtent.count(function (records) { 
        if (records > 0) {
          dbCache.snapExtent.toArray(function(data) { 
            createLayer(data, 'Snap Extent');
          });
          console.log("cached snapExtent loaded");
        }
        count += 10;
      }),
      
      dbCache.blmRegion.count(function (records) { 
        if (records > 0) {
          dbCache.blmRegion.toArray(function(data) { 
            createLayer(data, 'BLM');
          });
          console.log("cached blmRegion loaded");
        }
        count += 10;
      }),
      
      dbCache.fsRegion.count(function (records) { 
        if (records > 0) {
          dbCache.fsRegion.toArray(function(data) { 
            createLayer(data, 'FS Regions');
          });
          console.log("cached fsRegion loaded");
        }
        count += 10;
      }),
      
      dbCache.mdepBound.count(function (records) { 
        if (records > 0) {
          dbCache.mdepBound.toArray(function(data) { 
            createLayer(data, 'MDEP Boundary');
          });
          console.log("cached mdepBound loaded");
        }
        count += 10;
      }),
      
      dbCache.mdiBound.count(function (records) { 
        if (records > 0) {
          dbCache.mdiBound.toArray(function(data) { 
            createLayer(data, 'MDI Boundary');
          });
          console.log("cached MDI Boundary loaded");
        }
        count += 10;
      }),
      
      dbCache.nvCounties.count(function (records) { 
        if (records > 0) {
          dbCache.nvCounties.toArray(function(data) { 
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