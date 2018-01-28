"use strict";

var getData = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(type, geoJSONstring) {
    var barriers, distPoints, distPolys, distLines, restoLines, restoPoints, restoPolys, ipAddress, overallCount, data;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            barriers = distPoints = distPolys = distLines = restoLines = restoPoints = restoPolys = [];
            ipAddress = "216.117.167.186:443";

            ipAddress = "snap-restoration-brstillwell.c9users.io";
            overallCount = 0;
            _context.prev = 4;
            _context.t0 = $;
            _context.next = 8;
            return $.getJSON('../../api/' + type + '/' + geoJSONstring, function (data) {
              switch (type) {
                case 'Barriers':
                  barriers = data[0].row_to_json;
                  if (barriers.features != null) overallCount += barriers.features.length;
                  break;
                case 'DistPoints':
                  distPoints = data[0].row_to_json;
                  if (distPoints.features != null) overallCount += distPoints.features.length;
                  break;
                case 'DistLines':
                  distLines = data[0].row_to_json;
                  if (distLines.features != null) overallCount += distLines.features.length;
                  break;
                case 'DistPolygons':
                  distPolys = data[0].row_to_json;
                  if (distPolys.features != null) overallCount += distPolys.features.length;
                  break;
                case 'RestoPoints':
                  restoPoints = data[0].row_to_json;
                  if (restoPoints.features != null) overallCount += restoPoints.features.length;
                  break;
                case 'RestoLines':
                  restoLines = data[0].row_to_json;
                  if (restoLines.features != null) overallCount += restoLines.features.length;
                  break;
                case 'RestoPolygons':
                  restoPolys = data[0].row_to_json;
                  if (restoPolys.features != null) overallCount += restoPolys.features.length;
                  break;

              }
            });

          case 8:
            _context.t1 = _context.sent;

            _context.t0.when.call(_context.t0, _context.t1);

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
            return _context.abrupt("return", data);

          case 14:
            _context.prev = 14;
            _context.t2 = _context["catch"](4);

            console.error(_context.t2);

          case 17:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, this, [[4, 14]]);
  }));

  return function getData(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

;