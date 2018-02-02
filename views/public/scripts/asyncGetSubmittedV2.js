"use strict";

var getSubmissions = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(type, geoJSONstring) {
    var barriers, distPoints, distPolys, distLines, restoLines, restoPoints, restoPolys, overallCount, subs;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            barriers = distPoints = distPolys = distLines = restoLines = restoPoints = restoPolys = [];
            overallCount = 0;
            _context.prev = 2;

            if (!(type != 'AllSubs')) {
              _context.next = 11;
              break;
            }

            _context.t0 = $;
            _context.next = 7;
            return $.getJSON('../../api/' + type + '/' + geoJSONstring, function (data) {
              switch (type) {
                case 'BarrierSubs':
                  barriers = data[0].row_to_json;
                  if (barriers.features != null) overallCount += barriers.features.length;
                  break;
                case 'DistPointSubs':
                  distPoints = data[0].row_to_json;
                  if (distPoints.features != null) overallCount += distPoints.features.length;
                  break;
                case 'DistLineSubs':
                  distLines = data[0].row_to_json;
                  if (distLines.features != null) overallCount += distLines.features.length;
                  break;
                case 'DistPolygonSubs':
                  distPolys = data[0].row_to_json;
                  if (distPolys.features != null) overallCount += distPolys.features.length;
                  break;
                case 'RestoPointSubs':
                  restoPoints = data[0].row_to_json;
                  if (restoPoints.features != null) overallCount += restoPoints.features.length;
                  break;
                case 'RestoLineSubs':
                  restoLines = data[0].row_to_json;
                  if (restoLines.features != null) overallCount += restoLines.features.length;
                  break;
                case 'RestoPolygonSubs':
                  restoPolys = data[0].row_to_json;
                  if (restoPolys.features != null) overallCount += restoPolys.features.length;
                  break;

              }
            });

          case 7:
            _context.t1 = _context.sent;

            _context.t0.when.call(_context.t0, _context.t1);

            _context.next = 34;
            break;

          case 11:
            _context.t2 = $;
            _context.next = 14;
            return $.getJSON('../../api/BarrierSubs/barrierSubGeoJSON', function (data) {
              barriers = data[0].row_to_json;
              if (barriers.features != null) overallCount += barriers.features.length;
            });

          case 14:
            _context.t3 = _context.sent;
            _context.next = 17;
            return $.getJSON('../../api/DistPointSubs/distPointSubGeoJSON', function (data) {
              distPoints = data[0].row_to_json;
              if (distPoints.features != null) overallCount += distPoints.features.length;
            });

          case 17:
            _context.t4 = _context.sent;
            _context.next = 20;
            return $.getJSON('../../api/DistLineSubs/distLineSubGeoJSON', function (data) {
              distLines = data[0].row_to_json;
              if (distLines.features != null) overallCount += distLines.features.length;
            });

          case 20:
            _context.t5 = _context.sent;
            _context.next = 23;
            return $.getJSON('../../api/DistPolygonSubs/distPolySubGeoJSON', function (data) {
              distPolys = data[0].row_to_json;
              if (distPolys.features != null) overallCount += distPolys.features.length;
            });

          case 23:
            _context.t6 = _context.sent;
            _context.next = 26;
            return $.getJSON('../../api/RestoPointSubs/restoPointSubGeoJSON', function (data) {
              //console.log(data);
              restoPoints = data[0].row_to_json;
              if (restoPoints.features != null) overallCount += restoPoints.features.length;
            });

          case 26:
            _context.t7 = _context.sent;
            _context.next = 29;
            return $.getJSON('../../api/RestoLineSubs/restoLineSubGeoJSON', function (data) {
              restoLines = data[0].row_to_json;
              if (restoLines.features != null) overallCount += restoLines.features.length;
            });

          case 29:
            _context.t8 = _context.sent;
            _context.next = 32;
            return $.getJSON('../../api/RestoPolygonSubs/restoPolySubGeoJSON', function (data) {
              restoPolys = data[0].row_to_json;
              if (restoPolys.features != null) overallCount += restoPolys.features.length;
            });

          case 32:
            _context.t9 = _context.sent;

            _context.t2.when.call(_context.t2, _context.t3, _context.t4, _context.t5, _context.t6, _context.t7, _context.t8, _context.t9);

          case 34:
            subs = {
              barriers: barriers,
              distPoints: distPoints,
              distPolys: distPolys,
              distLines: distLines,
              restoLines: restoLines,
              restoPoints: restoPoints,
              restoPolys: restoPolys,
              overallCount: overallCount
            };
            return _context.abrupt('return', subs);

          case 38:
            _context.prev = 38;
            _context.t10 = _context['catch'](2);

            console.error(_context.t10);

          case 41:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[2, 38]]);
  }));

  return function getSubmissions(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

;