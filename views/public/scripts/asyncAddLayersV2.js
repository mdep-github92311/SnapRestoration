'use strict';

var getUrl = window.location;
var baseUrl = getUrl.origin;
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
            return L.geoJson(data, {
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
    var progress, count, interval;
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
            
            _context2.prev = 6;
            _context2.t0 = $;
            _context2.next = 10;
            return $.getJSON(baseUrl + '/api/Barriers/barrierGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Barrier');
              count += 5;
            });

          case 10:
            _context2.t1 = _context2.sent;
            _context2.next = 13;
            return $.getJSON(baseUrl + '/api/DistPoints/distPointGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Disturbance Points');
              count += 5;
            });

          case 13:
            _context2.t2 = _context2.sent;
            _context2.next = 16;
            return $.getJSON(baseUrl + '/api/DistLines/distLineGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Disturbance Lines');
              count += 5;
            });

          case 16:
            _context2.t3 = _context2.sent;
            _context2.next = 19;
            return $.getJSON(baseUrl + '/api/DistPolygons/distPolyGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Disturbance Polygon');
              count += 5;
            });

          case 19:
            _context2.t4 = _context2.sent;
            _context2.t5 = $.getJSON(baseUrl + '/api/DistPolyCentroids/distPolyCentGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Disturbance Poly Cent');
              count += 5;
            });
            _context2.next = 23;
            return $.getJSON(baseUrl + '/api/RestoPoints/restoPointGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Restoration Points');
              count += 5;
            });

          case 23:
            _context2.t6 = _context2.sent;
            _context2.next = 26;
            return $.getJSON(baseUrl + '/api/RestoLines/restoLineGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Restoration Lines');
              count += 30;
            });

          case 26:
            _context2.t7 = _context2.sent;
            _context2.next = 29;
            return $.getJSON(baseUrl + '/api/RestoPolygons/restoPolyGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Restoration Polygon');
              count += 5;
            });

          case 29:
            _context2.t8 = _context2.sent;
            _context2.t9 = $.getJSON(baseUrl + '/api/RestPolyCentroids/restoPolyCentGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Restoration Poly Cent');
              count += 5;
            });
            _context2.t10 = $.getJSON(baseUrl + '/api/SnapExtents/snapExtentGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Snap Extent');
              count += 5;
            });
            _context2.t11 = $.getJSON(baseUrl + '/api/BlmRegions/blmRegionsGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'BLM');
              count += 5;
            });
            _context2.t12 = $.getJSON(baseUrl + '/api/FsRegions/fsRegionsGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'FS Regions');
              count += 5;
            });
            _context2.t13 = $.getJSON(baseUrl + '/api/MdepBoundaries/mdepBoundGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'MDEP Boundary');
              count += 5;
            });
            _context2.t14 = $.getJSON(baseUrl + '/api/MdiBoundaries/mdiBoundGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'MDI Boundary');
              count += 5;
            });
            _context2.t15 = $.getJSON(baseUrl + '/api/NvCounties/nvCountiesGeoJSON', function (data) {
              createLayer(data[0].row_to_json, 'Nevada Counties');
              count += 5;
            });

            _context2.t16 = function () {
              //$.LoadingOverlay("hide");
              console.log(count);
            };

            _context2.t0.when.call(_context2.t0, _context2.t1, _context2.t2, _context2.t3, _context2.t4, _context2.t5, _context2.t6, _context2.t7, _context2.t8, _context2.t9, _context2.t10, _context2.t11, _context2.t12, _context2.t13, _context2.t14, _context2.t15).then(_context2.t16);

            _context2.next = 44;
            break;

          case 41:
            _context2.prev = 41;
            _context2.t17 = _context2['catch'](6);

            console.error(_context2.t17);

          case 44:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this, [[6, 41]]);
  }));

  return function getLayers() {
    return _ref2.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

;

;