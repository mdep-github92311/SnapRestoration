'use strict';

var createLayer = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data, layerName) {
    var barrier, distLines, distPoints, distPoly, distPolyCent, restoPoly, restoLine, restoPoint, restoPolyCent, blmRegions, fsRegions, nvCounties, mdiBound, mdepBound, roads, snapExtent, soilVuln;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.t0 = layerName;
            _context.next = _context.t0 === 'Barrier' ? 4 : _context.t0 === 'Disturbance Lines' ? 10 : _context.t0 === 'Disturbance Points' ? 16 : _context.t0 === 'Disturbance Polygon' ? 22 : _context.t0 === 'Disturbance Poly Cent' ? 28 : _context.t0 === 'Restoration Polygon' ? 35 : _context.t0 === 'Restoration Lines' ? 41 : _context.t0 === 'Restoration Points' ? 47 : _context.t0 === 'Restoration Poly Cent' ? 53 : _context.t0 === 'BLM' ? 60 : _context.t0 === 'FS Regions' ? 66 : _context.t0 === 'Nevada Counties' ? 72 : _context.t0 === 'MDI Boundary' ? 78 : _context.t0 === 'MDEP Boundary' ? 84 : _context.t0 === 'Roads' ? 90 : _context.t0 === 'Snap Extent' ? 96 : _context.t0 === 'Soil Vulnerability' ? 102 : 108;
            break;

          case 4:
            _context.next = 6;
            return L.geoJson(data, {
              pane: 'Lines',
              style: myStyleLines,
              onEachFeature: onEachBarrier
            }).addTo(map);

          case 6:
            barrier = _context.sent;


            control.addOverlay(barrier, layerName, { groupName: 'Barrier Data', expanded: true });
            console.log('added ' + layerName);

            return _context.abrupt('break', 108);

          case 10:
            _context.next = 12;
            return L.geoJson(data, {
              pane: 'Lines',
              style: myStyleLines,
              onEachFeature: onEachDistLine
            }).addTo(map);

          case 12:
            distLines = _context.sent;


            control.addOverlay(distLines, layerName, { groupName: 'Disturbance Data', expanded: true });
            console.log('added ' + layerName);

            return _context.abrupt('break', 108);

          case 16:
            _context.next = 18;
            return L.geoJson(data, {
              pane: 'Points',
              style: myStylePoints,
              // changing the default point makers to circle markers
              pointToLayer: pointToLayer,
              onEachFeature: onEachDistPoint
            }).addTo(map);

          case 18:
            distPoints = _context.sent;


            control.addOverlay(distPoints, layerName, { groupName: 'Disturbance Data', expanded: true });
            console.log('added ' + layerName);

            return _context.abrupt('break', 108);

          case 22:
            _context.next = 24;
            return L.geoJson(data, {
              pane: 'Polygons',
              style: myStyleDistPoly,
              onEachFeature: onEachDistPoly
            }).addTo(map);

          case 24:
            distPoly = _context.sent;


            control.addOverlay(distPoly, layerName, { groupName: 'Disturbance Data', expanded: true });
            console.log('added ' + layerName);

            return _context.abrupt('break', 108);

          case 28:
            _context.next = 30;
            return L.geoJson(data, {
              pane: 'Points',
              style: myStyleDistPoly,
              // changing the default point makers to circle markers
              pointToLayer: pointToLayer,
              onEachFeature: onEachDistPolyCent
            }).addTo(map);

          case 30:
            distPolyCent = _context.sent;


            control.addOverlay(distPolyCent, layerName, { groupName: 'Disturbance Data', expanded: true });
            control.unSelectLayer(distPolyCent);
            console.log('added ' + layerName + ' Unselected');

            return _context.abrupt('break', 108);

          case 35:
            _context.next = 37;
            return L.geoJson(data, {
              pane: 'Polygons',
              style: myStyleRestoPoly,
              onEachFeature: onEachRestoPoly
            }).addTo(map);

          case 37:
            restoPoly = _context.sent;


            control.addOverlay(restoPoly, layerName, { groupName: 'Restoration Data', expanded: true });
            console.log('added ' + layerName);

            return _context.abrupt('break', 108);

          case 41:
            _context.next = 43;
            return L.geoJson(data, {
              pane: 'Lines',
              style: myStyleLines,
              onEachFeature: onEachRestoLine
            }).addTo(map);

          case 43:
            restoLine = _context.sent;


            control.addOverlay(restoLine, layerName, { groupName: 'Restoration Data', expanded: true });
            console.log('added ' + layerName);

            return _context.abrupt('break', 108);

          case 47:
            _context.next = 49;
            return L.geoJson(data, {
              pane: 'Points',
              style: myStylePoints,
              // changing the default point makers to circle markers
              pointToLayer: pointToLayer,
              onEachFeature: onEachRestoPoint
            }).addTo(map);

          case 49:
            restoPoint = _context.sent;


            control.addOverlay(restoPoint, layerName, { groupName: 'Restoration Data', expanded: true });
            console.log('added ' + layerName);

            return _context.abrupt('break', 108);

          case 53:
            _context.next = 55;
            return L.geoJson(data, {
              pane: 'Points',
              style: myStylePoints,
              // changing the default point makers to circle markers
              pointToLayer: pointToLayer,
              onEachFeature: onEachRestoPolyCent
            }).addTo(map);

          case 55:
            restoPolyCent = _context.sent;


            control.addOverlay(restoPolyCent, layerName, { groupName: 'Restoration Data', expanded: true });
            control.unSelectLayer(restoPolyCent);
            console.log('added ' + layerName + ' Unselected');

            return _context.abrupt('break', 108);

          case 60:
            _context.next = 62;
            return L.geoJson(data, {
              pane: 'Regions',
              style: blmRegion,
              onEachFeature: onEachBLMRegion
            }).addTo(map);

          case 62:
            blmRegions = _context.sent;


            control.addOverlay(blmRegions, layerName, { groupName: 'Regions/ Counties', expanded: false });
            console.log('added ' + layerName + ' Unselected');

            return _context.abrupt('break', 108);

          case 66:
            _context.next = 68;
            return L.geoJson(data, {
              pane: 'Regions',
              style: fsRegion,
              onEachFeature: onEachFSRegion
            }).addTo(map);

          case 68:
            fsRegions = _context.sent;


            control.addOverlay(fsRegions, layerName, { groupName: 'Regions/ Counties', expanded: false });
            console.log('added ' + layerName + ' Unselected');

            return _context.abrupt('break', 108);

          case 72:
            _context.next = 74;
            return L.geoJson(data, {
              pane: 'Bounds_County',
              style: nv_county,
              onEachFeature: onEachNVCounty
            }).addTo(map);

          case 74:
            nvCounties = _context.sent;


            control.addOverlay(nvCounties, layerName, { groupName: 'Regions/ Counties', expanded: false });
            console.log('added ' + layerName + ' Unselected');

            return _context.abrupt('break', 108);

          case 78:
            _context.next = 80;
            return L.geoJson(data, {
              pane: 'Bounds_County',
              style: mdep_i,
              onEachFeature: onEachMDIBound
            }).addTo(map);

          case 80:
            mdiBound = _context.sent;


            control.addOverlay(mdiBound, layerName, { groupName: 'Boundaries', expanded: false });
            console.log('added ' + layerName + ' Unselected');

            return _context.abrupt('break', 108);

          case 84:
            _context.next = 86;
            return L.geoJson(data, {
              pane: 'Bounds_County',
              style: mdep_i,
              onEachFeature: onEachMDEPBound
            }).addTo(map);

          case 86:
            mdepBound = _context.sent;


            control.addOverlay(mdepBound, layerName, { groupName: 'Boundaries', expanded: false });
            console.log('added ' + layerName + ' Unselected');

            return _context.abrupt('break', 108);

          case 90:
            _context.next = 92;
            return L.shapefile(data, {
              pane: 'Lines',
              style: roadColor
            }).addTo(map);

          case 92:
            roads = _context.sent;


            control.addOverlay(roads, layerName, { groupName: 'Roads', expanded: false });
            console.log('added ' + layerName + ' Unselected');

            return _context.abrupt('break', 108);

          case 96:
            _context.next = 98;
            return L.geoJson(data, {
              pane: 'Misc',
              style: soil_vuln,
              onEachFeature: onEachSoilVuln
            }).addTo(map);

          case 98:
            snapExtent = _context.sent;


            control.addOverlay(snapExtent, layerName, { groupName: 'Misc', expanded: false });
            console.log('added ' + layerName + ' Unselected');

            return _context.abrupt('break', 108);

          case 102:
            _context.next = 104;
            return L.geoJson(data, {
              pane: 'Misc',
              style: soil_vuln
              //onEachFeature: onEachSoilVuln
            }).addTo(map);

          case 104:
            soilVuln = _context.sent;


            control.addOverlay(soilVuln, layerName, { groupName: 'Misc', expanded: false });
            console.log('added ' + layerName + ' Unselected');

            return _context.abrupt('break', 108);

          case 108:
            control.unSelectGroup('Regions/ Counties');
            control.unSelectGroup('Boundaries');
            control.unSelectGroup('Roads');
            control.unSelectGroup('Misc');
            _context.next = 117;
            break;

          case 114:
            _context.prev = 114;
            _context.t1 = _context['catch'](0);

            console.error(_context.t1);

          case 117:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 114]]);
  }));

  return function createLayer(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var getLayers = function () {
  var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
    var progress, count, interval, getUrl, baseUrl, ipAddress;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            progress = new LoadingOverlayProgress({
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
            count = 0;
            interval = setInterval(function () {
              if (count >= 100) {
                clearInterval(interval);
                //delete progress;
                $.LoadingOverlay("hide");
                return;
              }
              progress.Update(count);
            }, 100);
            getUrl = window.location;
            baseUrl = getUrl.origin;
            ipAddress = "216.117.167.186:443";

            ipAddress = "snap-restoration-brstillwell.c9users.io";
            _context2.prev = 8;
            _context2.t0 = $;
            _context2.next = 12;
            return $.getJSON(baseUrl + '/api/Barriers/barrierGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Barrier');
              count += 5;
            });

          case 12:
            _context2.t1 = _context2.sent;
            _context2.next = 15;
            return $.getJSON(baseUrl + '/api/DistPoints/distPointGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Disturbance Points');
              count += 5;
            });

          case 15:
            _context2.t2 = _context2.sent;
            _context2.next = 18;
            return $.getJSON(baseUrl + '/api/DistLines/distLineGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Disturbance Lines');
              count += 5;
            });

          case 18:
            _context2.t3 = _context2.sent;
            _context2.next = 21;
            return $.getJSON(baseUrl + '/api/DistPolygons/distPolyGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Disturbance Polygon');
              count += 5;
            });

          case 21:
            _context2.t4 = _context2.sent;
            _context2.t5 = $.getJSON(baseUrl + '/api/DistPolyCentroids/distPolyCentGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Disturbance Poly Cent');
              count += 5;
            });
            _context2.next = 25;
            return $.getJSON(baseUrl + '/api/RestoPoints/restoPointGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Restoration Points');
              count += 5;
            });

          case 25:
            _context2.t6 = _context2.sent;
            _context2.next = 28;
            return $.getJSON(baseUrl + '/api/RestoLines/restoLineGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Restoration Lines');
              count += 5;
            });

          case 28:
            _context2.t7 = _context2.sent;
            _context2.t8 =
            //createLayer('/public/geoJSON/roads.zip', 'Roads'),

            db.roads.count(function (records) {
              if (records > 0) {
                db.roads.toArray(function (data) {
                  createLayer(data, 'Roads');
                  count += 15;
                });
                console.log("cached data loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/roads.json', function (data) {
                  createLayer(data, 'Roads');
                  console.log(data);
                  db.roads.bulkAdd(data.features).then(function (lastKey) {
                    console.log("Done caching roads");
                  }).catch(Dexie.BulkError, function (e) {
                    // Explicitely catching the bulkAdd() operation makes those successful
                    // additions commit despite that there were errors.
                    console.error("Some roads did not succeed. However, " + 100000 - e.failures.length + " roads was added successfully");
                  });
                  count += 15;
                }).fail(function (jqXHR, textStatus, error) {
                  console.log(JSON.stringify(jqXHR));
                });
              }
            });
            _context2.t9 = db.soilVuln.count(function (records) {
              if (records > 0) {
                db.soilVuln.toArray(function (data) {
                  createLayer(data, 'Soil Vulnerability');
                  count += 10;
                });
                console.log("cached data loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/soil.json', function (data) {
                  createLayer(data, 'Soil Vulnerability');
                  console.log(data);
                  db.soilVuln.bulkAdd(data.features).then(function (lastKey) {
                    console.log("Done caching soilVuln");
                  }).catch(Dexie.BulkError, function (e) {
                    // Explicitely catching the bulkAdd() operation makes those successful
                    // additions commit despite that there were errors.
                    console.error("Some soilVuln did not succeed. However, " + 100000 - e.failures.length + " soilVuln was added successfully");
                  });
                  count += 10;
                }).fail(function (jqXHR, textStatus, error) {
                  console.log(JSON.stringify(jqXHR));
                });
              }
            });
            _context2.next = 33;
            return $.getJSON(baseUrl + '/api/RestoPolygons/restoPolyGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Restoration Polygon');
              count += 5;
            });

          case 33:
            _context2.t10 = _context2.sent;
            _context2.t11 = $.getJSON(baseUrl + '/api/RestPolyCentroids/restoPolyCentGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Restoration Poly Cent');
              count += 5;
            });
            _context2.t12 = db.snapExtent.count(function (records) {
              if (records > 0) {
                db.snapExtent.toArray(function (data) {
                  createLayer(data, 'Snap Extent');
                  count += 5;
                });
                console.log("cached snapExtent loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/snapExtents.json', function (data) {
                  createLayer(data, 'Snap Extent');
                  db.snapExtent.bulkAdd(data.features).then(function (lastKey) {
                    console.log("Done caching snapExtent");
                  }).catch(Dexie.BulkError, function (e) {
                    // Explicitely catching the bulkAdd() operation makes those successful
                    // additions commit despite that there were errors.
                    console.error("Some snapExtent did not succeed. However, " + 100000 - e.failures.length + " snapExtent was added successfully");
                  });
                  count += 5;
                }).fail(function (jqXHR, textStatus, error) {
                  console.log(JSON.stringify(jqXHR));
                });
              }
            });
            _context2.t13 = db.blmRegion.count(function (records) {
              if (records > 0) {
                db.blmRegion.toArray(function (data) {
                  createLayer(data, 'BLM');
                  count += 5;
                });
                console.log("cached blmRegion loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/blmRegions.json', function (data) {
                  createLayer(data, 'BLM');
                  db.blmRegion.bulkAdd(data.features).then(function (lastKey) {
                    console.log("Done caching BLM");
                  }).catch(Dexie.BulkError, function (e) {
                    // Explicitely catching the bulkAdd() operation makes those successful
                    // additions commit despite that there were errors.
                    console.error("Some blmRegion did not succeed. However, " + 100000 - e.failures.length + " blmRegion was added successfully");
                  });
                  count += 5;
                }).fail(function (jqXHR, textStatus, error) {
                  console.log(JSON.stringify(jqXHR));
                });
              }
            });
            _context2.t14 = db.fsRegion.count(function (records) {
              if (records > 0) {
                db.fsRegion.toArray(function (data) {
                  createLayer(data, 'FS Regions');
                  count += 5;
                });
                console.log("cached fsRegion loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/fsRegions.json', function (data) {
                  createLayer(data, 'FS Regions');
                  db.fsRegion.bulkAdd(data.features).then(function (lastKey) {
                    console.log("Done caching FS Regions");
                  }).catch(Dexie.BulkError, function (e) {
                    // Explicitely catching the bulkAdd() operation makes those successful
                    // additions commit despite that there were errors.
                    console.error("Some FS Regions did not succeed. However, " + 100000 - e.failures.length + " FS Regions was added successfully");
                  });
                  count += 5;
                }).fail(function (jqXHR, textStatus, error) {
                  console.log(JSON.stringify(jqXHR));
                });
              }
            });
            _context2.t15 = db.mdepBound.count(function (records) {
              if (records > 0) {
                db.mdepBound.toArray(function (data) {
                  createLayer(data, 'MDEP Boundary');
                  count += 5;
                });
                console.log("cached mdepBound loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/mdepBoundry.json', function (data) {
                  createLayer(data, 'MDEP Boundary');
                  db.mdepBound.bulkAdd(data.features).then(function (lastKey) {
                    console.log("Done caching MDEP Boundary");
                  }).catch(Dexie.BulkError, function (e) {
                    // Explicitely catching the bulkAdd() operation makes those successful
                    // additions commit despite that there were errors.
                    console.error("Some MDEP Boundary did not succeed. However, " + 100000 - e.failures.length + " MDEP Boundary was added successfully");
                  });
                  count += 5;
                }).fail(function (jqXHR, textStatus, error) {
                  console.log(JSON.stringify(jqXHR));
                });
              }
            });
            _context2.t16 = db.mdiBound.count(function (records) {
              if (records > 0) {
                db.mdiBound.toArray(function (data) {
                  createLayer(data, 'MDI Boundary');
                  count += 5;
                });
                console.log("cached MDI Boundary loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/mdiBoundry.json', function (data) {
                  createLayer(data, 'MDI Boundary');
                  db.mdiBound.bulkAdd(data.features).then(function (lastKey) {
                    console.log("Done caching MDI Boundary");
                  }).catch(Dexie.BulkError, function (e) {
                    // Explicitely catching the bulkAdd() operation makes those successful
                    // additions commit despite that there were errors.
                    console.error("Some MDI Boundary did not succeed. However, " + 100000 - e.failures.length + " MDI Boundary was added successfully");
                  });
                  count += 5;
                }).fail(function (jqXHR, textStatus, error) {
                  console.log(JSON.stringify(jqXHR));
                });
              }
            });
            _context2.t17 = db.nvCounties.count(function (records) {
              if (records > 0) {
                db.nvCounties.toArray(function (data) {
                  createLayer(data, 'Nevada Counties');
                  count += 5;
                });
                console.log("cached Nevada Counties loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/nvCounties.json', function (data) {
                  createLayer(data, 'Nevada Counties');
                  db.nvCounties.bulkAdd(data.features).then(function (lastKey) {
                    console.log("Done caching Nevada Counties");
                  }).catch(Dexie.BulkError, function (e) {
                    // Explicitely catching the bulkAdd() operation makes those successful
                    // additions commit despite that there were errors.
                    console.error("Some Nevada Counties did not succeed. However, " + 100000 - e.failures.length + " Nevada Counties was added successfully");
                  });
                  count += 5;
                }).fail(function (jqXHR, textStatus, error) {
                  console.log(JSON.stringify(jqXHR));
                });
              }
            });

            _context2.t18 = function () {
              //$.LoadingOverlay("hide");
              console.log(count);
            };

            _context2.t0.when.call(_context2.t0, _context2.t1, _context2.t2, _context2.t3, _context2.t4, _context2.t5, _context2.t6, _context2.t7, _context2.t8, _context2.t9, _context2.t10, _context2.t11, _context2.t12, _context2.t13, _context2.t14, _context2.t15, _context2.t16, _context2.t17).then(_context2.t18);

            _context2.next = 48;
            break;

          case 45:
            _context2.prev = 45;
            _context2.t19 = _context2['catch'](8);

            console.error(_context2.t19);

          case 48:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[8, 45]]);
  }));

  return function getLayers() {
    return _ref2.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var db = new Dexie('CachedData');

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
  console.log(err);
});

;

;