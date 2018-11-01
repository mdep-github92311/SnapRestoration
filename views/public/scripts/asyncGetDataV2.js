"use strict";

var getData = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(type, geoJSONstring) {
    var barriers, distPoints, distPolys, distLines, restoLines, restoPoints, restoPolys, overallCount, data;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            barriers = distPoints = distPolys = distLines = restoLines = restoPoints = restoPolys = [];
            overallCount = 0;
            _context.prev = 2;
            _context.t0 = type;
            _context.next = _context.t0 === 'barriers' ? 6 : _context.t0 === 'distPoints' ? 9 : _context.t0 === 'distLines' ? 12 : _context.t0 === 'distPolys' ? 15 : _context.t0 === 'restoPoints' ? 18 : _context.t0 === 'restoLines' ? 21 : _context.t0 === 'restoPolys' ? 24 : 27;
            break;

          case 6:
            _context.next = 8;
            return $.getJSON('../../api/Barriers/barrierGeoJSON', function (data) {
              barriers = data[0].row_to_json;
              if (barriers.features != null) overallCount += barriers.features.length;
            });

          case 8:
            return _context.abrupt('break', 27);

          case 9:
            _context.next = 11;
            return $.getJSON('../../api/DistPoints/distPointGeoJSON', function (data) {
              distPoints = data[0].row_to_json;
              if (distPoints.features != null) overallCount += distPoints.features.length;
            });

          case 11:
            return _context.abrupt('break', 27);

          case 12:
            _context.next = 14;
            return $.getJSON('../../api/DistLines/distLineGeoJSON', function (data) {
              distLines = data[0].row_to_json;
              if (distLines.features != null) overallCount += distLines.features.length;
            });

          case 14:
            return _context.abrupt('break', 27);

          case 15:
            _context.next = 17;
            return $.getJSON('../../api/DistPolygons/distPolyGeoJSON', function (data) {
              distPolys = data[0].row_to_json;
              if (distPolys.features != null) overallCount += distPolys.features.length;
            });

          case 17:
            return _context.abrupt('break', 27);

          case 18:
            _context.next = 20;
            return $.getJSON('../../api/RestoPoints/restoPointGeoJSON', function (data) {
              restoPoints = data[0].row_to_json;
              if (restoPoints.features != null) overallCount += restoPoints.features.length;
            });

          case 20:
            return _context.abrupt('break', 27);

          case 21:
            _context.next = 23;
            return $.getJSON('../../api/RestoLines/restoLineGeoJSON', function (data) {
              restoLines = data[0].row_to_json;
              if (restoLines.features != null) overallCount += restoLines.features.length;
            });

          case 23:
            return _context.abrupt('break', 27);

          case 24:
            _context.next = 26;
            return $.getJSON('../../api/RestoPolygons/restoPolyGeoJSON', function (data) {
              restoPolys = data[0].row_to_json;
              if (restoPolys.features != null) overallCount += restoPolys.features.length;
            });

          case 26:
            return _context.abrupt('break', 27);

          case 27:
            data = {
              barriers: barriers,
              distPoints: distPoints,
              distPolys: distPolys,
              distLines: distLines,
              restoLines: restoLines,
              restoPoints: restoPoints,
              restoPolys: restoPolys,
              overallCount: overallCount
            };
            return _context.abrupt('return', data);

          case 31:
            _context.prev = 31;
            _context.t1 = _context['catch'](2);

            console.error(_context.t1);

          case 34:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this, [[2, 31]]);
  }));

  return function getData(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

;