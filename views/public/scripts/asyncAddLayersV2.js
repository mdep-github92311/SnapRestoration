"use strict";

var createLayer = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data, layerName) {
    var barrier, distLines, distPoints, distPoly, distPolyCent, restoPoly, restoLine, restoPoint, restoPolyCent, blmRegions, fsRegions, nvCounties, mdiBound, mdepBound, roads, snapExtent, soilVuln;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.t0 = layerName;
            _context.next = _context.t0 === 'Barrier' ? 4 : _context.t0 === 'Disturbance Lines' ? 10 : _context.t0 === 'Disturbance Points' ? 16 : _context.t0 === 'Disturbance Polygon' ? 22 : _context.t0 === 'Disturbance Poly Cent' ? 28 : _context.t0 === 'Restoration Polygon' ? 35 : _context.t0 === 'Restoration Lines' ? 41 : _context.t0 === 'Restoration Points' ? 47 : _context.t0 === 'Restoration Poly Cent' ? 53 : _context.t0 === 'BLM' ? 60 : _context.t0 === 'FS Regions' ? 67 : _context.t0 === 'Nevada Counties' ? 74 : _context.t0 === 'MDI Boundary' ? 81 : _context.t0 === 'MDEP Boundary' ? 88 : _context.t0 === 'Roads' ? 95 : _context.t0 === 'Snap Extent' ? 102 : _context.t0 === 'Soil Vulnerability' ? 111 : 118;
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
            console.log("added " + layerName);

            return _context.abrupt("break", 118);

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
            console.log("added " + layerName);

            return _context.abrupt("break", 118);

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
            console.log("added " + layerName);

            return _context.abrupt("break", 118);

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
            console.log("added " + layerName);

            return _context.abrupt("break", 118);

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
            console.log("added " + layerName + " Unselected");

            return _context.abrupt("break", 118);

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
            console.log("added " + layerName);

            return _context.abrupt("break", 118);

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
            console.log("added " + layerName);

            return _context.abrupt("break", 118);

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
            console.log("added " + layerName);

            return _context.abrupt("break", 118);

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
            console.log("added " + layerName + " Unselected");

            return _context.abrupt("break", 118);

          case 60:
            if (data.type == null) {
              data = fixCollection(data);
            }
            _context.next = 63;
            return L.geoJson(data, {
              pane: 'Regions',
              style: blmRegion,
              onEachFeature: onEachBLMRegion
            }).addTo(map);

          case 63:
            blmRegions = _context.sent;


            control.addOverlay(blmRegions, layerName, { groupName: 'Regions/ Counties', expanded: false });
            console.log("added " + layerName + " Unselected");

            return _context.abrupt("break", 118);

          case 67:
            if (data.type == null) {
              data = fixCollection(data);
            }
            _context.next = 70;
            return L.geoJson(data, {
              pane: 'Regions',
              style: fsRegion,
              onEachFeature: onEachFSRegion
            }).addTo(map);

          case 70:
            fsRegions = _context.sent;


            control.addOverlay(fsRegions, layerName, { groupName: 'Regions/ Counties', expanded: false });
            console.log("added " + layerName + " Unselected");

            return _context.abrupt("break", 118);

          case 74:
            if (data.type == null) {
              data = fixCollection(data);
            }
            _context.next = 77;
            return L.geoJson(data, {
              pane: 'Bounds_County',
              style: nv_county,
              onEachFeature: onEachNVCounty
            }).addTo(map);

          case 77:
            nvCounties = _context.sent;


            control.addOverlay(nvCounties, layerName, { groupName: 'Regions/ Counties', expanded: false });
            console.log("added " + layerName + " Unselected");

            return _context.abrupt("break", 118);

          case 81:
            if (data.type == null) {
              data = fixCollection(data);
            }
            _context.next = 84;
            return L.geoJson(data, {
              pane: 'Bounds_County',
              style: mdep_i,
              onEachFeature: onEachMDIBound
            }).addTo(map);

          case 84:
            mdiBound = _context.sent;


            control.addOverlay(mdiBound, layerName, { groupName: 'Boundaries', expanded: false });
            console.log("added " + layerName + " Unselected");

            return _context.abrupt("break", 118);

          case 88:
            if (data.type == null) {
              data = fixCollection(data);
            }
            _context.next = 91;
            return L.geoJson(data, {
              pane: 'Bounds_County',
              style: mdep_i,
              onEachFeature: onEachMDEPBound
            }).addTo(map);

          case 91:
            mdepBound = _context.sent;


            control.addOverlay(mdepBound, layerName, { groupName: 'Boundaries', expanded: false });
            console.log("added " + layerName + " Unselected");

            return _context.abrupt("break", 118);

          case 95:
            if (data.type == null) {
              data = fixCollection(data);
            }
            _context.next = 98;
            return L.geoJson(data, {
              pane: 'Lines',
              style: roadColor
            }).addTo(map);

          case 98:
            roads = _context.sent;


            control.addOverlay(roads, layerName, { groupName: 'Roads', expanded: false });
            console.log("added " + layerName + " Unselected");

            return _context.abrupt("break", 118);

          case 102:
            console.log(data);
            if (data.type == null) {
              data = fixCollection(data);
            }
            console.log(data);
            _context.next = 107;
            return L.geoJson(data, {
              pane: 'Misc',
              style: soil_vuln,
              onEachFeature: onEachSoilVuln
            }).addTo(map);

          case 107:
            snapExtent = _context.sent;


            control.addOverlay(snapExtent, layerName, { groupName: 'Misc', expanded: false });
            console.log("added " + layerName + " Unselected");

            return _context.abrupt("break", 118);

          case 111:
            if (data.type == null) {
              data = fixCollection(data);
            }
            _context.next = 114;
            return L.geoJson(data, {
              pane: 'Misc',
              style: soil_vuln
              //onEachFeature: onEachSoilVuln
            }).addTo(map);

          case 114:
            soilVuln = _context.sent;


            control.addOverlay(soilVuln, layerName, { groupName: 'Misc', expanded: false });
            console.log("added " + layerName + " Unselected");

            return _context.abrupt("break", 118);

          case 118:
            control.unSelectGroup('Regions/ Counties');
            control.unSelectGroup('Boundaries');
            control.unSelectGroup('Roads');
            control.unSelectGroup('Misc');
            _context.next = 127;
            break;

          case 124:
            _context.prev = 124;
            _context.t1 = _context["catch"](0);

            console.error(_context.t1);

          case 127:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[0, 124]]);
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
            if (hostReachable()) {
              _context2.next = 3;
              break;
            }

            getOfflineLayers();
            return _context2.abrupt("return");

          case 3:
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
            _context2.prev = 11;
            _context2.t0 = $;
            _context2.next = 15;
            return $.getJSON(baseUrl + '/api/Barriers/barrierGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Barrier');
              count += 5;
            });

          case 15:
            _context2.t1 = _context2.sent;
            _context2.next = 18;
            return $.getJSON(baseUrl + '/api/DistPoints/distPointGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Disturbance Points');
              count += 5;
            });

          case 18:
            _context2.t2 = _context2.sent;
            _context2.next = 21;
            return $.getJSON(baseUrl + '/api/DistLines/distLineGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Disturbance Lines');
              count += 5;
            });

          case 21:
            _context2.t3 = _context2.sent;
            _context2.next = 24;
            return $.getJSON(baseUrl + '/api/DistPolygons/distPolyGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Disturbance Polygon');
              count += 5;
            });

          case 24:
            _context2.t4 = _context2.sent;
            _context2.t5 = $.getJSON(baseUrl + '/api/DistPolyCentroids/distPolyCentGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Disturbance Poly Cent');
              count += 5;
            });
            _context2.next = 28;
            return $.getJSON(baseUrl + '/api/RestoPoints/restoPointGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Restoration Points');
              count += 5;
            });

          case 28:
            _context2.t6 = _context2.sent;
            _context2.next = 31;
            return $.getJSON(baseUrl + '/api/RestoLines/restoLineGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Restoration Lines');
              count += 5;
            });

          case 31:
            _context2.t7 = _context2.sent;
            _context2.t8 =
            //createLayer('/public/geoJSON/roads.zip', 'Roads'),

            dbCache.roads.count(function (records) {
              if (records > 0) {
                dbCache.roads.toArray(function (data) {
                  createLayer(data, 'Roads');
                  count += 15;
                });
                console.log("cached data loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/roads.json', function (data) {
                  createLayer(data, 'Roads');
                  console.log(data);
                  dbCache.roads.bulkAdd(data.features).then(function (lastKey) {
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
            _context2.t9 = dbCache.soilVuln.count(function (records) {
              if (records > 0) {
                dbCache.soilVuln.toArray(function (data) {
                  createLayer(data, 'Soil Vulnerability');
                  count += 10;
                });
                console.log("cached data loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/soil.json', function (data) {
                  createLayer(data, 'Soil Vulnerability');
                  console.log(data);
                  dbCache.soilVuln.bulkAdd(data.features).then(function (lastKey) {
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
            _context2.next = 36;
            return $.getJSON(baseUrl + '/api/RestoPolygons/restoPolyGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Restoration Polygon');
              count += 5;
            });

          case 36:
            _context2.t10 = _context2.sent;
            _context2.t11 = $.getJSON(baseUrl + '/api/RestPolyCentroids/restoPolyCentGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Restoration Poly Cent');
              count += 5;
            });
            _context2.t12 = dbCache.snapExtent.count(function (records) {
              if (records > 0) {
                dbCache.snapExtent.toArray(function (data) {
                  createLayer(data, 'Snap Extent');
                  count += 5;
                });
                console.log("cached snapExtent loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/snapExtents.json', function (data) {
                  createLayer(data, 'Snap Extent');
                  dbCache.snapExtent.bulkAdd(data.features).then(function (lastKey) {
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
            _context2.t13 = dbCache.blmRegion.count(function (records) {
              if (records > 0) {
                dbCache.blmRegion.toArray(function (data) {
                  createLayer(data, 'BLM');
                  count += 5;
                });
                console.log("cached blmRegion loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/blmRegions.json', function (data) {
                  createLayer(data, 'BLM');
                  dbCache.blmRegion.bulkAdd(data.features).then(function (lastKey) {
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
            _context2.t14 = dbCache.fsRegion.count(function (records) {
              if (records > 0) {
                dbCache.fsRegion.toArray(function (data) {
                  createLayer(data, 'FS Regions');
                  count += 5;
                });
                console.log("cached fsRegion loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/fsRegions.json', function (data) {
                  createLayer(data, 'FS Regions');
                  dbCache.fsRegion.bulkAdd(data.features).then(function (lastKey) {
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
            _context2.t15 = dbCache.mdepBound.count(function (records) {
              if (records > 0) {
                dbCache.mdepBound.toArray(function (data) {
                  createLayer(data, 'MDEP Boundary');
                  count += 5;
                });
                console.log("cached mdepBound loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/mdepBoundry.json', function (data) {
                  createLayer(data, 'MDEP Boundary');
                  dbCache.mdepBound.bulkAdd(data.features).then(function (lastKey) {
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
            _context2.t16 = dbCache.mdiBound.count(function (records) {
              if (records > 0) {
                dbCache.mdiBound.toArray(function (data) {
                  createLayer(data, 'MDI Boundary');
                  count += 5;
                });
                console.log("cached MDI Boundary loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/mdiBoundry.json', function (data) {
                  createLayer(data, 'MDI Boundary');
                  dbCache.mdiBound.bulkAdd(data.features).then(function (lastKey) {
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
            _context2.t17 = dbCache.nvCounties.count(function (records) {
              if (records > 0) {
                dbCache.nvCounties.toArray(function (data) {
                  createLayer(data, 'Nevada Counties');
                  count += 5;
                });
                console.log("cached Nevada Counties loaded");
              } else {
                $.getJSON(baseUrl + '/public/geoJSON/nvCounties.json', function (data) {
                  createLayer(data, 'Nevada Counties');
                  dbCache.nvCounties.bulkAdd(data.features).then(function (lastKey) {
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

            _context2.next = 54;
            break;

          case 48:
            _context2.prev = 48;
            _context2.t19 = _context2["catch"](11);

            console.error(_context2.t19);
            console.log('Now Loading Offline layers');
            count = 100;
            getOfflineLayers();

          case 54:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, this, [[11, 48]]);
  }));

  return function getLayers() {
    return _ref2.apply(this, arguments);
  };
}();

var getOfflineLayers = function () {
  var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
    var progress, count, interval, getUrl, baseUrl;
    return regeneratorRuntime.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
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

            try {
              $.when(dbCache.roads.count(function (records) {
                if (records > 0) {
                  dbCache.roads.toArray(function (data) {
                    createLayer(data, 'Roads');
                  });
                  console.log("cached data loaded");
                }
                count += 20;
              }), dbCache.soilVuln.count(function (records) {
                if (records > 0) {
                  dbCache.soilVuln.toArray(function (data) {
                    createLayer(data, 'Soil Vulnerability');
                  });
                  console.log("cached data loaded");
                }
                count += 20;
              }), dbCache.snapExtent.count(function (records) {
                if (records > 0) {
                  dbCache.snapExtent.toArray(function (data) {
                    createLayer(data, 'Snap Extent');
                  });
                  console.log("cached snapExtent loaded");
                }
                count += 10;
              }), dbCache.blmRegion.count(function (records) {
                if (records > 0) {
                  dbCache.blmRegion.toArray(function (data) {
                    createLayer(data, 'BLM');
                  });
                  console.log("cached blmRegion loaded");
                }
                count += 10;
              }), dbCache.fsRegion.count(function (records) {
                if (records > 0) {
                  dbCache.fsRegion.toArray(function (data) {
                    createLayer(data, 'FS Regions');
                  });
                  console.log("cached fsRegion loaded");
                }
                count += 10;
              }), dbCache.mdepBound.count(function (records) {
                if (records > 0) {
                  dbCache.mdepBound.toArray(function (data) {
                    createLayer(data, 'MDEP Boundary');
                  });
                  console.log("cached mdepBound loaded");
                }
                count += 10;
              }), dbCache.mdiBound.count(function (records) {
                if (records > 0) {
                  dbCache.mdiBound.toArray(function (data) {
                    createLayer(data, 'MDI Boundary');
                  });
                  console.log("cached MDI Boundary loaded");
                }
                count += 10;
              }), dbCache.nvCounties.count(function (records) {
                if (records > 0) {
                  dbCache.nvCounties.toArray(function (data) {
                    createLayer(data, 'Nevada Counties');
                  });
                  console.log("cached Nevada Counties loaded");
                }
                count += 10;
              })).then(function () {
                //$.LoadingOverlay("hide");
                console.log(count);
              });
            } catch (err) {
              console.error(err);
            }

          case 7:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function getOfflineLayers() {
    return _ref3.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function hostReachable() {

  // Handle IE and more capable browsers
  var xhr = new (window.ActiveXObject || XMLHttpRequest)("Microsoft.XMLHTTP");
  var status;

  // Open new request as a HEAD to the root hostname with a random param to bust the cache
  xhr.open("HEAD", "//" + window.location.hostname + "/?rand=" + Math.floor((1 + Math.random()) * 0x10000), false);

  // Issue request and handle response
  try {
    xhr.send();
    return xhr.status >= 200 && (xhr.status < 300 || xhr.status === 304);
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

var dbCache = new Dexie('CachedData');

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
  console.log(err);
});

;