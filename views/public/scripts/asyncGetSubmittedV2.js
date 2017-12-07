"use strict";
var getUrl = window.location;
var baseUrl = getUrl.origin;
var getSubmissions = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var barriers, distPoints, distPolys, distLines, restoLines, restoPoints, restoPolys, overallCount, subs;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            barriers = distPoints = distPolys = distLines = restoLines = restoPoints = restoPolys = [];
            overallCount = 0;
            _context.prev = 4;
            _context.t0 = $;
            _context.next = 8;
            return $.getJSON(baseUrl + '/api/BarrierSubs/barrierSubGeoJSON', function (data) {
              barriers = data[0].row_to_json;
              if (barriers.features != null) overallCount += barriers.features.length;
            });

          case 8:
            _context.t1 = _context.sent;
            _context.next = 11;
            return $.getJSON(baseUrl + '/api/DistPointSubs/distPointSubGeoJSON', function (data) {
              distPoints = data[0].row_to_json;
              if (distPoints.features != null) overallCount += distPoints.features.length;
            });

          case 11:
            _context.t2 = _context.sent;
            _context.next = 14;
            return $.getJSON(baseUrl + '/api/DistLineSubs/distLineSubGeoJSON', function (data) {
              distLines = data[0].row_to_json;
              if (distLines.features != null) overallCount += distLines.features.length;
            });

          case 14:
            _context.t3 = _context.sent;
            _context.next = 17;
            return $.getJSON(baseUrl + '/api/DistPolygonSubs/distPolySubGeoJSON', function (data) {
              distPolys = data[0].row_to_json;
              if (distPolys.features != null) overallCount += distPolys.features.length;
            });

          case 17:
            _context.t4 = _context.sent;
            _context.next = 20;
            return $.getJSON(baseUrl + '/api/RestoPointSubs/restoPointSubGeoJSON', function (data) {
              //console.log(data);
              restoPoints = data[0].row_to_json;
              if (restoPoints.features != null) overallCount += restoPoints.features.length;
            });

          case 20:
            _context.t5 = _context.sent;
            _context.next = 23;
            return $.getJSON(baseUrl + '/api/RestoLineSubs/restoLineSubGeoJSON', function (data) {
              restoLines = data[0].row_to_json;
              if (restoLines.features != null) overallCount += restoLines.features.length;
            });

          case 23:
            _context.t6 = _context.sent;
            _context.next = 26;
            return $.getJSON(baseUrl + '/api/RestoPolygonSubs/restoPolySubGeoJSON', function (data) {
              restoPolys = data[0].row_to_json;
              if (restoPolys.features != null) overallCount += restoPolys.features.length;
            });

          case 26:
            _context.t7 = _context.sent;

            _context.t0.when.call(_context.t0, _context.t1, _context.t2, _context.t3, _context.t4, _context.t5, _context.t6, _context.t7);

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
            return _context.abrupt("return", subs);

          case 32:
            _context.prev = 32;
            _context.t8 = _context["catch"](4);

            console.error(_context.t8);

          case 35:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[4, 32]]);
  }));

  return function getSubmissions() {
    return _ref.apply(this, arguments);
  };
}();


function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

;