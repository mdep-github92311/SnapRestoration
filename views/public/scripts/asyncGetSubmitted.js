async function getSubmissions() {
  var barriers, distPoints, distPolys, distLines, restoLines, restoPoints, restoPolys;
  barriers = distPoints = distPolys = distLines = restoLines = restoPoints = restoPolys = [];
  var ipAddress = "216.117.167.186:443";
  var ipAddress1 = "snap-restoration-brstillwell.c9users.io";
  var overallCount = 0;
try {
    $.when(
      
      await $.getJSON('http://' + ipAddress + '/api/BarrierSubs/barrierSubGeoJSON', function (data) {
      //await $.getJSON('http://snap-restoration-brstillwell.c9users.io/api/BarrierSubs/barrierSubGeoJSON', function (data) {
        barriers = data[0].row_to_json;
        if (barriers.features != null)
          overallCount += barriers.features.length;
      }),
        
      await $.getJSON('http://' + ipAddress + '/api/DistPointSubs/distPointSubGeoJSON', function (data) {
      //await $.getJSON('http://snap-restoration-brstillwell.c9users.io/api/DistPointSubs/distPointSubGeoJSON', function (data) {
        distPoints = data[0].row_to_json;
        if (distPoints.features != null)
          overallCount += distPoints.features.length;
      }),
    
      await $.getJSON('http://' + ipAddress + '/api/DistLineSubs/distLineSubGeoJSON', function (data) {
      //$.getJSON('http://snap-restoration-brstillwell.c9users.io/api/DistLineSubs/distLineSubGeoJSON', function (data) {
        distLines = data[0].row_to_json;
        if (distLines.features != null)
          overallCount += distLines.features.length;
        
      }),
    
      await $.getJSON('http://' + ipAddress + '/api/DistPolygonSubs/distPolySubGeoJSON', function (data) {
      //await $.getJSON('http://snap-restoration-brstillwell.c9users.io/api/DistPolygonSubs/distPolySubGeoJSON', function (data) {
        distPolys = data[0].row_to_json;
        if (distPolys.features != null)
          overallCount += distPolys.features.length;
      }),
    
      /*//$.getJSON('http://' + ipAddress + '/api/DistPolyCentroids/distPolyCentGeoJSON', function (data) {
      $.getJSON('http://snap-restoration-brstillwell.c9users.io/api/DistPolyCentroids/distPolyCentGeoJSON', function (data) {
        // some code
      }),*/
    
      await $.getJSON('http://' + ipAddress + '/api/RestoPointSubs/restoPointSubGeoJSON', function (data) {
      //await $.getJSON('http://snap-restoration-brstillwell.c9users.io/api/RestoPointSubs/restoPointSubGeoJSON', function (data) {
        //console.log(data);
        restoPoints = data[0].row_to_json;
        if (restoPoints.features != null)
          overallCount += restoPoints.features.length;
      }),
    
      await $.getJSON('http://' + ipAddress + '/api/RestoLineSubs/restoLineSubGeoJSON', function (data) {
      //await $.getJSON('http://snap-restoration-brstillwell.c9users.io/api/RestoLineSubs/restoLineSubGeoJSON', function (data) {
        restoLines = data[0].row_to_json;
        if (restoLines.features != null)
          overallCount += restoLines.features.length;
      }),
    
      await $.getJSON('http://' + ipAddress + '/api/RestoPolygonSubs/restoPolySubGeoJSON', function (data) {
      //await $.getJSON('http://snap-restoration-brstillwell.c9users.io/api/RestoPolygonSubs/restoPolySubGeoJSON', function (data) {
        restoPolys = data[0].row_to_json;
        if (restoPolys.features != null)
          overallCount += restoPolys.features.length;
      })
    );

    var subs = {
        barriers, 
        distPoints, 
        distPolys, 
        distLines, 
        restoLines, 
        restoPoints, 
        restoPolys,
        overallCount
    };            
      
    return subs;
    
    /*console.log(
      barriers, 
      distPoints, 
      distPolys, 
      distLines, 
      restoLines, 
      restoPoints, 
      restoPolys);*/
      
    }
      
  catch (err) {
      console.error(err);
  }
};
