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
        const roads = await L.geoJson(data, {
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
      delete progress;
      $.LoadingOverlay("hide");
      return;
    }
    progress.Update(count);
  }, 100);
  
  var ipAddress = "216.117.167.186:443";
  var ipAddress1 = "snap-restoration-brstillwell.c9users.io";
  try {
    $.when(
      await $.getJSON('https://' + ipAddress + '/api/Barriers/barrierGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Barrier');
        count += 5;
      }),

      await $.getJSON('https://' + ipAddress + '/api/DistPoints/distPointGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Points');
        count += 5;
      }),

      await $.getJSON('https://' + ipAddress + '/api/DistLines/distLineGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Lines');
        count += 5;
      }),

      await $.getJSON('https://' + ipAddress + '/api/DistPolygons/distPolyGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Polygon');
        count += 5;
      }),

      $.getJSON('https://' + ipAddress + '/api/DistPolyCentroids/distPolyCentGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Disturbance Poly Cent');
        count += 5;
      }),

      await $.getJSON('https://' + ipAddress + '/api/RestoPoints/restoPointGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Points');
        count += 5;
      }),

      await $.getJSON('https://' + ipAddress + '/api/RestoLines/restoLineGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Lines');
        count += 5;
      }),

      $.getJSON('https://' + ipAddress + '/api/Roads/roadsGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Roads');
        count += 15;
      })
      .fail(function(jqXHR, textStatus, error) {
        console.log(JSON.stringify(jqXHR));
      }),

      $.getJSON('https://' + ipAddress + '/api/SoilVulnerabilities/soilVulnGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Soil Vulnerability');
        count += 10;
      })
      .fail(function(jqXHR, textStatus, error) {
        console.log(error)
      }),

      await $.getJSON('https://' + ipAddress + '/api/RestoPolygons/restoPolyGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Polygon');
        count += 5;
      }),

      $.getJSON('https://' + ipAddress + '/api/RestPolyCentroids/restoPolyCentGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Restoration Poly Cent');
        count += 5;
      }),

      $.getJSON('https://' + ipAddress + '/api/SnapExtents/snapExtentGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Snap Extent');
        count += 5;
      }),

      $.getJSON('https://' + ipAddress + '/api/BlmRegions/blmRegionsGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'BLM');
        count += 5;
      }),

      $.getJSON('https://' + ipAddress + '/api/FsRegions/fsRegionsGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'FS Regions');
        count += 5;
      }),

      $.getJSON('https://' + ipAddress + '/api/MdepBoundaries/mdepBoundGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'MDEP Boundary');
        count += 5;
      }),

      $.getJSON('https://' + ipAddress + '/api/MdiBoundaries/mdiBoundGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'MDI Boundary');
        count += 5;
      }),

      $.getJSON('https://' + ipAddress + '/api/NvCounties/nvCountiesGeoJSON', function (data) {
        createLayer(data[0].row_to_json, 'Nevada Counties');
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
