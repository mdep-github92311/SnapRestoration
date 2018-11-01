"use strict";

var getSubmissions = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(type) {
    var barriers, distPoints, distPolys, distLines, restoLines, restoPoints, restoPolys, overallCount, subs;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            barriers = distPoints = distPolys = distLines = restoLines = restoPoints = restoPolys = [];
            overallCount = 0;
            _context.prev = 2;

            if (!(type != 'AllSubs')) {
              _context.next = 30;
              break;
            }

            _context.t0 = type;
            _context.next = _context.t0 === 'barriers' ? 7 : _context.t0 === 'distPoints' ? 10 : _context.t0 === 'distLines' ? 13 : _context.t0 === 'distPolys' ? 16 : _context.t0 === 'restoPoints' ? 19 : _context.t0 === 'restoLines' ? 22 : _context.t0 === 'restoPolys' ? 25 : 28;
            break;

          case 7:
            _context.next = 9;
            return $.getJSON('../../api/BarrierSubs/barrierSubGeoJSON', function (data) {
              barriers = data[0].row_to_json;
              if (barriers.features != null) overallCount += barriers.features.length;
            });

          case 9:
            return _context.abrupt('break', 28);

          case 10:
            _context.next = 12;
            return $.getJSON('../../api/DistPointSubs/distPointSubGeoJSON', function (data) {
              distPoints = data[0].row_to_json;
              if (distPoints.features != null) overallCount += distPoints.features.length;
            });

          case 12:
            return _context.abrupt('break', 28);

          case 13:
            _context.next = 15;
            return $.getJSON('../../api/DistLineSubs/distLineSubGeoJSON', function (data) {
              distLines = data[0].row_to_json;
              if (distLines.features != null) overallCount += distLines.features.length;
            });

          case 15:
            return _context.abrupt('break', 28);

          case 16:
            _context.next = 18;
            return $.getJSON('../../api/DistPolygonSubs/distPolySubGeoJSON', function (data) {
              distPolys = data[0].row_to_json;
              if (distPolys.features != null) overallCount += distPolys.features.length;
            });

          case 18:
            return _context.abrupt('break', 28);

          case 19:
            _context.next = 21;
            return $.getJSON('../../api/RestoPointSubs/restoPointSubGeoJSON', function (data) {
              restoPoints = data[0].row_to_json;
              if (restoPoints.features != null) overallCount += restoPoints.features.length;
            });

          case 21:
            return _context.abrupt('break', 28);

          case 22:
            _context.next = 24;
            return $.getJSON('../../api/RestoLineSubs/restoLineSubGeoJSON', function (data) {
              restoLines = data[0].row_to_json;
              if (restoLines.features != null) overallCount += restoLines.features.length;
            });

          case 24:
            return _context.abrupt('break', 28);

          case 25:
            _context.next = 27;
            return $.getJSON('../../api/RestoPolygonSubs/restoPolySubGeoJSON', function (data) {
              restoPolys = data[0].row_to_json;
              if (restoPolys.features != null) overallCount += restoPolys.features.length;
            });

          case 27:
            return _context.abrupt('break', 28);

          case 28:
            _context.next = 53;
            break;

          case 30:
            _context.t1 = $;
            _context.next = 33;
            return $.getJSON('../../api/BarrierSubs/barrierSubGeoJSON', function (data) {
              barriers = data[0].row_to_json;
              if (barriers.features != null) overallCount += barriers.features.length;
            });

          case 33:
            _context.t2 = _context.sent;
            _context.next = 36;
            return $.getJSON('../../api/DistPointSubs/distPointSubGeoJSON', function (data) {
              distPoints = data[0].row_to_json;
              if (distPoints.features != null) overallCount += distPoints.features.length;
            });

          case 36:
            _context.t3 = _context.sent;
            _context.next = 39;
            return $.getJSON('../../api/DistLineSubs/distLineSubGeoJSON', function (data) {
              distLines = data[0].row_to_json;
              if (distLines.features != null) overallCount += distLines.features.length;
            });

          case 39:
            _context.t4 = _context.sent;
            _context.next = 42;
            return $.getJSON('../../api/DistPolygonSubs/distPolySubGeoJSON', function (data) {
              distPolys = data[0].row_to_json;
              if (distPolys.features != null) overallCount += distPolys.features.length;
            });

          case 42:
            _context.t5 = _context.sent;
            _context.next = 45;
            return $.getJSON('../../api/RestoPointSubs/restoPointSubGeoJSON', function (data) {
              //console.log(data);
              restoPoints = data[0].row_to_json;
              if (restoPoints.features != null) overallCount += restoPoints.features.length;
            });

          case 45:
            _context.t6 = _context.sent;
            _context.next = 48;
            return $.getJSON('../../api/RestoLineSubs/restoLineSubGeoJSON', function (data) {
              restoLines = data[0].row_to_json;
              if (restoLines.features != null) overallCount += restoLines.features.length;
            });

          case 48:
            _context.t7 = _context.sent;
            _context.next = 51;
            return $.getJSON('../../api/RestoPolygonSubs/restoPolySubGeoJSON', function (data) {
              restoPolys = data[0].row_to_json;
              if (restoPolys.features != null) overallCount += restoPolys.features.length;
            });

          case 51:
            _context.t8 = _context.sent;

            _context.t1.when.call(_context.t1, _context.t2, _context.t3, _context.t4, _context.t5, _context.t6, _context.t7, _context.t8);

          case 53:
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

          case 57:
            _context.prev = 57;
            _context.t9 = _context['catch'](2);

            console.error(_context.t9);

          case 60:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[2, 57]]);
  }));

  return function getSubmissions(_x) {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

;