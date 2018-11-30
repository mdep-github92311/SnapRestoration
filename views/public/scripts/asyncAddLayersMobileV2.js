"use strict";

var createLayer = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(data, layerName) {
        var barrier, distLines, distPoints, distPoly, distPolyCent, restoPoly, restoLine, restoPoint, restoPolyCent, blmRegions, fsRegions, fwsRegions, npsRegions, nvCounties, mdiBound, mdepBound, roads, snapExtent, soilVuln;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.prev = 0;
                        _context.t0 = layerName;
                        _context.next = _context.t0 === 'Barrier' ? 4 : _context.t0 === 'Disturbance Lines' ? 11 : _context.t0 === 'Disturbance Points' ? 18 : _context.t0 === 'Disturbance Polygon' ? 25 : _context.t0 === 'Disturbance Poly Cent' ? 32 : _context.t0 === 'Restoration Polygon' ? 39 : _context.t0 === 'Restoration Lines' ? 46 : _context.t0 === 'Restoration Points' ? 53 : _context.t0 === 'Restoration Poly Cent' ? 60 : _context.t0 === 'BLM Regions' ? 67 : _context.t0 === 'FS Regions' ? 74 : _context.t0 === 'FWS Regions' ? 81 : _context.t0 === 'NPS Regions' ? 88 : _context.t0 === 'Nevada Counties' ? 92 : _context.t0 === 'MDI Boundary' ? 99 : _context.t0 === 'MDEP Boundary' ? 106 : _context.t0 === 'Roads' ? 113 : _context.t0 === 'Snap Extent' ? 120 : _context.t0 === 'Soil Vulnerability' ? 129 : 136;
                        break;

                    case 4:
                        _context.next = 6;
                        return L.geoJson(data, {
                            pane: 'Lines',
                            style: myBarrierLines,
                            onEachFeature: onEachBarrier
                        }).addTo(map);

                    case 6:
                        barrier = _context.sent;

                        savedLayers.Barriers = barrier;
                        control.addOverlay(barrier, layerName, { groupName: 'Barrier Data', expanded: true });
                        console.log("added " + layerName);

                        return _context.abrupt("break", 136);

                    case 11:
                        _context.next = 13;
                        return L.geoJson(data, {
                            pane: 'Lines',
                            style: myStyleLines,
                            onEachFeature: onEachDistLine
                        }).addTo(map);

                    case 13:
                        distLines = _context.sent;

                        savedLayers.DLines = distLines;
                        control.addOverlay(distLines, layerName, { groupName: 'Disturbance Data', expanded: true });
                        console.log("added " + layerName);

                        return _context.abrupt("break", 136);

                    case 18:
                        _context.next = 20;
                        return L.geoJson(data, {
                            pane: 'Points',
                            style: myStyleDistPoints,
                            // changing the default point makers to circle markers
                            pointToLayer: pointToLayer,
                            onEachFeature: onEachDistPoint
                        }).addTo(map);

                    case 20:
                        distPoints = _context.sent;

                        savedLayers.DPoints = distPoints;
                        control.addOverlay(distPoints, layerName, { groupName: 'Disturbance Data', expanded: true });
                        console.log("added " + layerName);

                        return _context.abrupt("break", 136);

                    case 25:
                        _context.next = 27;
                        return L.geoJson(data, {
                            pane: 'Polygons',
                            style: myStyleDistPoly,
                            onEachFeature: onEachDistPoly
                        }).addTo(map);

                    case 27:
                        distPoly = _context.sent;

                        savedLayers.DPolys = distPoly;
                        control.addOverlay(distPoly, layerName, { groupName: 'Disturbance Data', expanded: true });
                        console.log("added " + layerName);

                        return _context.abrupt("break", 136);

                    case 32:
                        _context.next = 34;
                        return L.geoJson(data, {
                            pane: 'Points',
                            style: myStyleDistPoly,
                            // changing the default point makers to circle markers
                            pointToLayer: pointToLayer,
                            onEachFeature: onEachDistPolyCent
                        }).addTo(map);

                    case 34:
                        distPolyCent = _context.sent;

                        control.addOverlay(distPolyCent, layerName, { groupName: 'Disturbance Data', expanded: true });
                        control.unSelectLayer(distPolyCent);
                        console.log("added " + layerName + " Unselected");

                        return _context.abrupt("break", 136);

                    case 39:
                        _context.next = 41;
                        return L.geoJson(data, {
                            pane: 'Polygons',
                            style: myStyleRestoPoly,
                            onEachFeature: onEachRestoPoly
                        }).addTo(map);

                    case 41:
                        restoPoly = _context.sent;

                        savedLayers.RPolys = restoPoly;
                        control.addOverlay(restoPoly, layerName, { groupName: 'Restoration Data', expanded: true });
                        console.log("added " + layerName);

                        return _context.abrupt("break", 136);

                    case 46:
                        _context.next = 48;
                        return L.geoJson(data, {
                            pane: 'Lines',
                            style: myStyleLines,
                            onEachFeature: onEachRestoLine
                        }).addTo(map);

                    case 48:
                        restoLine = _context.sent;

                        savedLayers.RLines = restoLine;
                        control.addOverlay(restoLine, layerName, { groupName: 'Restoration Data', expanded: true });
                        console.log("added " + layerName);

                        return _context.abrupt("break", 136);

                    case 53:
                        _context.next = 55;
                        return L.geoJson(data, {
                            pane: 'Points',
                            style: myStylePoints,
                            // changing the default point makers to circle markers
                            pointToLayer: pointToLayer,
                            onEachFeature: onEachRestoPoint
                        }).addTo(map);

                    case 55:
                        restoPoint = _context.sent;

                        savedLayers.RPoints = restoPoint;
                        control.addOverlay(restoPoint, layerName, { groupName: 'Restoration Data', expanded: true });
                        console.log("added " + layerName);

                        return _context.abrupt("break", 136);

                    case 60:
                        _context.next = 62;
                        return L.geoJson(data, {
                            pane: 'Points',
                            style: myStylePoints,
                            // changing the default point makers to circle markers
                            pointToLayer: pointToLayer,
                            onEachFeature: onEachRestoPolyCent
                        }).addTo(map);

                    case 62:
                        restoPolyCent = _context.sent;


                        control.addOverlay(restoPolyCent, layerName, { groupName: 'Restoration Data', expanded: true });
                        control.unSelectLayer(restoPolyCent);
                        console.log("added " + layerName + " Unselected");

                        return _context.abrupt("break", 136);

                    case 67:
                        if (data.type == null) {
                            data = data;
                        }
                        _context.next = 70;
                        return L.geoJson(data, {
                            pane: 'Regions',
                            style: blmRegion,
                            onEachFeature: onEachBLMRegion
                        }).addTo(map);

                    case 70:
                        blmRegions = _context.sent;


                        control.addOverlay(blmRegions, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                        console.log("added " + layerName + " Unselected");

                        return _context.abrupt("break", 136);

                    case 74:
                        if (data.type == null) {
                            data = data;
                        }
                        _context.next = 77;
                        return L.geoJson(data, {
                            pane: 'Regions',
                            style: fsRegion,
                            onEachFeature: onEachFSRegion
                        }).addTo(map);

                    case 77:
                        fsRegions = _context.sent;


                        control.addOverlay(fsRegions, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                        console.log("added " + layerName + " Unselected");

                        return _context.abrupt("break", 136);

                    case 81:
                        if (data.type == null) {
                            data = data;
                        }
                        _context.next = 84;
                        return L.geoJson(data, {
                            pane: 'Regions',
                            style: fwsRegion
                        }).addTo(map);

                    case 84:
                        fwsRegions = _context.sent;


                        control.addOverlay(fwsRegions, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                        console.log("added " + layerName + " Unselected");

                        return _context.abrupt("break", 136);

                    case 88:
                        if (data.type == null) {
                            data = data;
                        }
                        _context.next = 91;
                        return L.geoJson(data, {
                            pane: 'Regions',
                            style: npsRegion
                        }).addTo(map);

                    case 91:
                        npsRegions = _context.sent;

                    case 92:
                        if (data.type == null) {
                            data = data;
                        }
                        _context.next = 95;
                        return L.geoJson(data, {
                            pane: 'Bounds_County',
                            style: nv_county,
                            onEachFeature: onEachNVCounty
                        }).addTo(map);

                    case 95:
                        nvCounties = _context.sent;


                        control.addOverlay(nvCounties, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                        console.log("added " + layerName + " Unselected");

                        return _context.abrupt("break", 136);

                    case 99:
                        if (data.type == null) {
                            data = data;
                        }
                        _context.next = 102;
                        return L.geoJson(data, {
                            pane: 'Bounds_County',
                            style: mdep_i,
                            onEachFeature: onEachMDIBound
                        }).addTo(map);

                    case 102:
                        mdiBound = _context.sent;


                        control.addOverlay(mdiBound, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                        console.log("added " + layerName + " Unselected");

                        return _context.abrupt("break", 136);

                    case 106:
                        if (data.type == null) {
                            data = data;
                        }
                        _context.next = 109;
                        return L.geoJson(data, {
                            pane: 'Bounds_County',
                            style: mdep_i,
                            onEachFeature: onEachMDEPBound
                        }).addTo(map);

                    case 109:
                        mdepBound = _context.sent;


                        control.addOverlay(mdepBound, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                        console.log("added " + layerName + " Unselected");

                        return _context.abrupt("break", 136);

                    case 113:
                        if (data.type == null) {
                            data = data;
                        }
                        _context.next = 116;
                        return L.geoJson(data, {
                            pane: 'Lines',
                            style: roadColor,
                            interactive: false
                        }).addTo(map);

                    case 116:
                        roads = _context.sent;


                        control.addOverlay(roads, layerName, { groupName: 'Misc', expanded: false });
                        console.log("added " + layerName + " Unselected");

                        return _context.abrupt("break", 136);

                    case 120:
                        console.log(data);
                        if (data.type == null) {
                            data = data;
                        }
                        console.log(data);
                        _context.next = 125;
                        return L.geoJson(data, {
                            pane: 'Misc',
                            style: soil_vuln
                        }).addTo(map);

                    case 125:
                        snapExtent = _context.sent;


                        control.addOverlay(snapExtent, layerName, { groupName: 'Regions/ Boundaries', expanded: false });
                        console.log("added " + layerName + " Unselected");

                        return _context.abrupt("break", 136);

                    case 129:
                        if (data.type == null) {
                            data = data;
                        }
                        _context.next = 132;
                        return L.geoJson(data, {
                            pane: 'Misc',
                            style: soil_vuln,
                            onEachFeature: onEachSoilVuln
                        }).addTo(map);

                    case 132:
                        soilVuln = _context.sent;


                        control.addOverlay(soilVuln, layerName, { groupName: 'Misc', expanded: false });
                        console.log("added " + layerName + " Unselected");

                        return _context.abrupt("break", 136);

                    case 136:
                        if (isMobile) {
                            control.unSelectGroup('Barrier Data');
                            control.unSelectGroup('Disturbance Data');
                            control.unSelectGroup('Restoration Data');
                        }
                        control.unSelectGroup('Regions/ Boundaries');
                        control.unSelectGroup('Regions/ Boundaries');
                        control.unSelectGroup('Roads');
                        control.unSelectGroup('Misc');
                        _context.next = 146;
                        break;

                    case 143:
                        _context.prev = 143;
                        _context.t1 = _context["catch"](0);

                        console.error(_context.t1);

                    case 146:
                    case "end":
                        return _context.stop();
                }
            }
        }, _callee, this, [[0, 143]]);
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
                            count += 15;
                        });

                    case 21:
                        _context2.t3 = _context2.sent;
                        _context2.next = 24;
                        return $.getJSON(baseUrl + '/api/DistPolygons/distPolyGeoJSON', function (data) {
                            createLayer(data[0].row_to_json, 'Disturbance Polygon');
                            count += 10;
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
                        _context2.next = 34;
                        return $.getJSON(baseUrl + '/api/RestoPolygons/restoPolyGeoJSON', function (data) {
                            createLayer(data[0].row_to_json, 'Restoration Polygon');
                            count += 5;
                        });

                    case 34:
                        _context2.t8 = _context2.sent;
                        _context2.t9 = $.getJSON(baseUrl + '/api/RestPolyCentroids/restoPolyCentGeoJSON', function (data) {
                            createLayer(data[0].row_to_json, 'Restoration Poly Cent');
                            count += 5;
                        });
                        _context2.t10 = dbCache.blmRegion.count(function (records) {
                            if (records > 0) {
                                dbCache.blmRegion.toArray(function (data) {
                                    createLayer(data, 'BLM Regions');
                                    count += 5;
                                });
                                console.log("cached blmRegion loaded");
                            } else {
                                $.getJSON(baseUrl + '/public/geoJSON/blmRegions.json', function (data) {
                                    createLayer(data, 'BLM Regions');
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
                        _context2.t11 = dbCache.fsRegion.count(function (records) {
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
                        _context2.t12 = dbCache.fwsRegion.count(function (records) {
                            if (records > 0) {
                                dbCache.fwsRegion.toArray(function (data) {
                                    createLayer(data, 'FWS Regions');
                                    count += 5;
                                });
                                console.log("cached FWS Regions loaded");
                            } else {
                                $.getJSON(baseUrl + '/public/geoJSON/fwsRegions.json', function (data) {
                                    createLayer(data, 'FWS Regions');
                                    dbCache.fwsRegion.bulkAdd(data.features).then(function (lastKey) {
                                        console.log("Done caching FWS Regions");
                                    }).catch(Dexie.BulkError, function (e) {
                                        // Explicitely catching the bulkAdd() operation makes those successful
                                        // additions commit despite that there were errors.
                                        console.error("Some fwsRegion did not succeed. However, " + 100000 - e.failures.length + " fwsRegion was added successfully");
                                    });
                                    count += 5;
                                }).fail(function (jqXHR, textStatus, error) {
                                    console.log(JSON.stringify(jqXHR));
                                });
                            }
                        });
                        _context2.next = 41;
                        return dbCache.npsRegion.count(function (records) {
                            if (records > 0) {
                                dbCache.npsRegion.toArray(function (data) {
                                    createLayer(data, 'NPS Regions');
                                    count += 5;
                                });
                                console.log("cached NPS Regions loaded");
                            } else {
                                $.getJSON(baseUrl + '/public/geoJSON/npsRegions.json', function (data) {
                                    createLayer(data, 'NPS Regions');
                                    dbCache.npsRegion.bulkAdd(data.features).then(function (lastKey) {
                                        console.log("Done caching NPS Regions");
                                    }).catch(Dexie.BulkError, function (e) {
                                        // Explicitely catching the bulkAdd() operation makes those successful
                                        // additions commit despite that there were errors.
                                        console.error("Some npsRegion did not succeed. However, " + 100000 - e.failures.length + " npsRegion was added successfully");
                                    });
                                    count += 5;
                                }).fail(function (jqXHR, textStatus, error) {
                                    console.log(JSON.stringify(jqXHR));
                                });
                            }
                        });

                    case 41:
                        _context2.t13 = _context2.sent;
                        _context2.t14 = dbCache.mdepBound.count(function (records) {
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
                        _context2.t15 = dbCache.mdiBound.count(function (records) {
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
                        _context2.t16 = dbCache.nvCounties.count(function (records) {
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
                        _context2.t17 = dbCache.snapExtent.count(function (records) {
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

                        _context2.t18 = function () {
                            //$.LoadingOverlay("hide");
                            console.log(count);
                        };

                        _context2.t0.when.call(_context2.t0, _context2.t1, _context2.t2, _context2.t3, _context2.t4, _context2.t5, _context2.t6, _context2.t7, _context2.t8, _context2.t9, _context2.t10, _context2.t11, _context2.t12, _context2.t13, _context2.t14, _context2.t15, _context2.t16, _context2.t17).then(_context2.t18);

                        _context2.next = 56;
                        break;

                    case 50:
                        _context2.prev = 50;
                        _context2.t19 = _context2["catch"](11);

                        console.error(_context2.t19);
                        console.log('Now Loading Offline layers');
                        count = 100;
                        getOfflineLayers();

                    case 56:
                    case "end":
                        return _context2.stop();
                }
            }
        }, _callee2, this, [[11, 50]]);
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
                            $.when(dbCache.snapExtent.count(function (records) {
                                if (records > 0) {
                                    dbCache.snapExtent.toArray(function (data) {
                                        createLayer(data, 'Snap Extent');
                                    });
                                    console.log("cached snapExtent loaded");
                                }
                                count += 20;
                            }), dbCache.blmRegion.count(function (records) {
                                if (records > 0) {
                                    dbCache.blmRegion.toArray(function (data) {
                                        createLayer(data, 'BLM Regions');
                                    });
                                    console.log("cached blmRegion loaded");
                                }
                                count += 30;
                            }), dbCache.fsRegion.count(function (records) {
                                if (records > 0) {
                                    dbCache.fsRegion.toArray(function (data) {
                                        createLayer(data, 'FS Regions');
                                    });
                                    console.log("cached fsRegion loaded");
                                }
                                count += 10;
                            }), dbCache.fwsRegion.count(function (records) {
                                if (records > 0) {
                                    dbCache.fwsRegion.toArray(function (data) {
                                        createLayer(data, 'FWS Regions');
                                    });
                                    console.log("cached fwsRegion loaded");
                                }
                                count += 5;
                            }), dbCache.npsRegion.count(function (records) {
                                if (records > 0) {
                                    dbCache.fsRegion.toArray(function (data) {
                                        createLayer(data, 'NPS Regions');
                                    });
                                    console.log("cached npsRegion loaded");
                                }
                                count += 5;
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

var isMobile = false;
// device detection
if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) isMobile = true;

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
    console.log(err);
});
var savedLayers = { Barriers: [], RPoints: [], RLines: [], RPolys: [], DPoints: [], DLines: [], DPolys: [] };
;