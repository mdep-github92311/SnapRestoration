<!--
Created by msgis-student on 6/9/2017.
-->
<!DOCTYPE html>
<html>
  <head>
      <?php 
          session_start(); 
          echo 'hello';  
      ?>
    <title>SNAP Restoration Map</title>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.2.0/dist/leaflet.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/0.4.9/leaflet.draw.css">
    <link rel="stylesheet" href="/public/css/styledLayerControl.css">
    <link rel="stylesheet" href="/public/css/sidebarV2.css">
    <script src="https://code.jquery.com/jquery-3.2.1.min.js" integrity="sha256-hwg4gsxgFZhOsEEamdOYGBf13FyQuiTwlAQgxVSNgt4=" crossorigin="anonymous"></script>
    <!--script(src="/dist/leaflet.offline.min.js")-->
    <script src="https://unpkg.com/kinto@9.0.2/dist/kinto.min.js"></script>
    <script src="https://unpkg.com/dexie@latest/dist/dexie.js"></script>
    <script src="https://unpkg.com/leaflet@1.0.3/dist/leaflet.js" type="text/javascript"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/0.4.9/leaflet.draw.js" type="text/javascript"></script>
    <script src="https://cdn.jsdelivr.net/jquery.loadingoverlay/1.5.3/loadingoverlay.js" type="text/javascript"></script>
    <script src="https://cdn.jsdelivr.net/jquery.loadingoverlay/latest/loadingoverlay_progress.min.js" type="text/javascript"></script>
    <!--script(src="https://jsconsole.com/js/remote.js?f7599f18-06f3-47dc-bb3f-f41097176b9b")-->
    <!--script(src='https://unpkg.com/leaflet-sidebar')-->
    <script src="https://unpkg.com/leaflet-sidebar-v2@2.0.0"></script>
    <script src="/public/scripts/formDIV.js"></script>
    <script src="/public/scripts/featureStyles.js"></script>
    <script src="/public/scripts/styledLayerControl.js"></script>
    <!--link(href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css", rel="stylesheet")-->
    <!-- Latest compiled and minified CSS-->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css" integrity="sha384-BVYiiSIFeK1dGmJRAkycuHAHRg32OmUcww7on3RYdg4Va+PmSTsz/K68vbdEjh4u" crossorigin="anonymous">
    <!-- Optional theme-->
    <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap-theme.min.css" integrity="sha384-rHyoN1iRsVXV4nD0JutlnGaslCJuC7uwjduW9SVrLvRYooPp2bWYgmgJQIXwl/Sp" crossorigin="anonymous">
    <!-- Latest compiled and minified JavaScript-->
    <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js" integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa" crossorigin="anonymous"></script>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1">
    <style type="text/css">
      html, body {
        height: 100%;
        padding: 0;
        margin: 0;
      }
      .navbar {
        margin-bottom: 0;
      }
      .legend {
        color: black;
        background-color: white;
        padding: 5px;
        font-size: 0.7em;
      }
      #map {
        float: left;
        width: 100%;
        height: 93%;
      }
      #popUp_FormDIV {
        float: right;
        width: 20%;
        height: 90%;
        overflow: auto;
      }
      #popUpDIV {
        display: block;
        /* float: left; */
        width: 100%;
        height: 50%;
        overflow: auto;
        margin: 5%;
      }
      #formPopDIV {
        /* float: right; */
        width: 100%;
        bottom: 40%;
        height: 50%;
        /* position: absolute; */
        overflow: auto;
        margin: 5%;
      }
      #sidebar1 {
        color: black;
        font-size: 14px;
        padding: 0 !important;
      }
      #drawTools2 {
        display: block;
        clear:none !important;
        text-align: center;
      }
      #sidebar2 {
        display: inline-block;
        color: black;
        font-size: 14px;
        padding: 0;
      }
      .container {
          position: relative;
          width: 50px;
          padding-left: 0px;
          margin: 0 auto 40px auto;
          -webkit-perspective: 800px;
             -moz-perspective: 800px;
              -ms-perspective: 800px;
               -o-perspective: 800px;
                  perspective: 800px;
      }
      .container .card {
          height: 100%;
          -webkit-transition: -webkit-transform 1s;
             -moz-transition:    -moz-transform 1s;
              -ms-transition:     -ms-transform 1s;
               -o-transition:      -o-transform 1s;
                  transition:         transform 1s;
          -webkit-transform-style: preserve-3d;
             -moz-transform-style: preserve-3d;
              -ms-transform-style: preserve-3d;
               -o-transform-style: preserve-3d;
                  transform-style: preserve-3d;
      }
      .container .card .face {
          position: absolute;
          width: 100%;
          height: 100%;
          font-family: Arial, sans-serif;
          font-weight: bold;
          color: #fff;
          text-align: center;
          -webkit-backface-visibility: hidden;
             -moz-backface-visibility: hidden;
              -ms-backface-visibility: hidden;
               -o-backface-visibility: hidden;
                  backface-visibility: hidden;
      }
      .container .card.flipped,
      .container .card .face2 {
          -webkit-transform: rotateY(180deg);
             -moz-transform: rotateY(180deg);
              -ms-transform: rotateY(180deg);
               -o-transform: rotateY(180deg);
                  transform: rotateY(180deg);
      }
      .store {
          display: none;
      }
      .buttons {
          text-align: center;
      }
      .drawControl2 {
        width: 100%;
        color: black;
      }
      #editShapeB {
        display:none;
      }
      #delShapeB {
        display:none;
      }
      #step2 {
        display:none;
      }
      #step3 {
        display:none;
      }
      h1 {
        color: black;
        font-size: 1em;
      }
      #saved, #savedCount {
        color: black;
      }
      table, th, td {
            border: 1px solid black;
            border-collapse: collapse;
            text-align: center;
        }
    </style>
  </head>
    <body>
      <div id="header">
        <nav role="navigation" class="navbar navbar-default navbar-inverse">
          <div class="container-fluid">
            <!-- Brand and toggle get grouped for better mobile display-->
            <div class="navbar-header">
              <button type="button" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1" class="navbar-toggle collapsed"><span class="sr-only">Toggle navigation</span><span class="icon-bar"></span><span class="icon-bar"></span><span class="icon-bar"></span></button><a class="pull-left">
                <div class="container">
                  <div class="card">
                    <div class="face face1"></div>
                    <div class="face face2"></div>
                  </div>
                  <ul class="store">
                    <li>
                      <div class="content content1"><img src="/public/css/images/logos/blm.png" width="45px" height="45px" float="left"></div>
                    </li>
                    <li>
                      <div class="content content2"> <img src="/public/css/images/logos/fs.png" width="38px" height="45px" float="left"></div>
                    </li>
                    <li>
                      <div class="content content3"> <img src="/public/css/images/logos/fws.png" width="45px" height="45px" float="left"></div>
                    </li>
                    <li>
                      <div class="content content4">  <img src="/public/css/images/logos/nps.png" width="45px" height="45px" float="left"></div>
                    </li>
                  </ul>
                </div>
                <script>
                  var topLogo = 1;
                  var currLogo = 1;
                  var facingUp = true;
                  function flipLogo(n) {
                    if (topLogo === n) return;
                    // Replace the contents of the current back-face with the contents
                    // of the element that should rotate into view.
                    var curBackFace = $('.' + (facingUp ? 'face2' : 'face1'));
                    var nextContent = $('.store' + n).html();
                    var nextContent = $('.store li:nth-child(' + n + ')').html();
                    curBackFace.html(nextContent);
                    // Rotate the content
                    $('.card').toggleClass('flipped');
                    topLogo = n;
                    facingUp = !facingUp;
                  }
                  setInterval(function() {
                    flipLogo(currLogo);
                    if(currLogo > 3)
                      currLogo = 1;
                    else
                      currLogo++;
                  }, 5000);
                  $(document).ready(function(){
                    // Add the appropriate content to the initial "front side"
                    var frontFace = $('.face1');
                    var frontContent = $('.store li:first-child').html();
                    frontFace.html(frontContent);
                  });
                </script></a>
            </div>
            <!-- Collect the nav links, forms, and other content for toggling-->
            <div id="bs-example-navbar-collapse-1" class="collapse navbar-collapse">
              <ul class="nav navbar-nav">
                <li class="active"><a href="#">Home</a></li>
                <li><a href="/admin/Add.html">Admin</a></li>
              </ul>
              <ul class="nav navbar-nav navbar-right">
                <li>
                  <p class="navbar-text">Already have an account?</p>
                </li>
                <li class="dropdown"><a href="#" data-toggle="dropdown" class="dropdown-toggle"><b>Login</b><span class="caret"></span></a>
                  <ul id="login-dp" class="dropdown-menu">
                    <li>
                      <div class="row">
                        <div class="col-md-12">
                          <form id="login-nav" role="form" method="post" action="login" accept-charset="UTF-8" class="form">
                            <div class="form-group">
                              <label for="exampleInputEmail2" class="sr-only">Email address</label>
                              <input id="exampleInputEmail2" type="email" placeholder="Email address" required="" class="form-control" />
                            </div>
                            <div class="form-group">
                              <label for="exampleInputPassword2" class="sr-only">Password</label>
                              <input id="exampleInputPassword2" type="password" placeholder="Password" required="" class="form-control" />
                              <div class="help-block text-right"><a href="">Forget the password ?</a></div>
                            </div>
                            <div class="form-group">
                              <button type="submit" class="btn btn-primary btn-block">Sign in</button>
                            </div>
                            <div class="checkbox">
                              <label>
                                <input type="checkbox"> keep me logged-in </input>
                              </label>
                            </div>
                          </form>
                        </div>
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      </div>
      <div id="overlay"></div>
      <div id="map">
        <script src="/public/scripts/asyncAddLayersV2.js"></script>
        <script>
          //import "babel-polyfill";
          var map = L.map('map').setView([36.211303, -115.114929], 8);
          map.removeControl(map.zoomControl);
          // https://stackoverflow.com/questions/39767499/how-to-set-the-zindex-layer-order-for-geojson-layers
          // createPane was used in this thread to control the order of the layers
          map.createPane('Points').style.zIndex = 390;
          map.createPane('Lines').style.zIndex = 380;
          map.createPane('Polygons').style.zIndex = 370;
          map.createPane('Regions').style.zIndex = 360;
          map.createPane('Bounds_County').style.zIndex = 350;
          map.createPane('Misc').style.zIndex = 340;
          L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
            attribution: '<a href="http://mojavedata.gov/sitemap.html">Site Map</a>&nbsp;&nbsp;&nbsp;' +
            '<a href="http://mojavedata.gov/security.html">Privacy &amp; Security</a>&nbsp;&nbsp;&nbsp;' +
            '<a href="http://mojavedata.gov/foia.html">FOIA</a>&nbsp;&nbsp;&nbsp;' +
            '<a href="http://mojavedata.gov/nofear.html">No Fear Act</a>&nbsp;&nbsp;&nbsp;' +
            '<a href="http://mojavedata.gov/license.html">License</a>&nbsp;&nbsp;&nbsp;' +
            '<a href="http://dodcio.defense.gov/DoDSection508/Std_Stmt.aspx" target="_blank">Accessibility/Section 508</a>&nbsp;&nbsp;&nbsp;' +
            '<a href="http://www.usa.gov" target="_blank">USA.gov</a>',
            maxZoom: 18,
            id: 'rogerdodger617.2p4pk9co',
            accessToken: 'pk.eyJ1Ijoicm9nZXJkb2RnZXI2MTciLCJhIjoiY2l5aG83M3pzMDR3aDJ3cndobzdzOWFhMSJ9.b6ssRylqfIz40O7vKcDb2g'
          }).addTo(map);
          function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }
            _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
              return regeneratorRuntime.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.prev = 0;
                      _context.next = 3;
                      return getLayers();
                    case 3:
                      _context.next = 8;
                      break;
                    case 5:
                      _context.prev = 5;
                      _context.t0 = _context["catch"](0);
                      console.error(_context.t0);
                    case 8:
                    case "end":
                      return _context.stop();
                  }
                }
              }, _callee, this, [[0, 5]]);
            }))();
          //(async function () {
            //try {
             // await getLayers();
            //}
            //catch (err) {
             // console.error(err)
            //}
          //}());
          var controlOptions = {
            container_width: "350px",
            container_maxHeight: "500px",
            group_maxHeight: "170px",
            autoZIndex: false,
            exclusive: false,
            collapsed: false
          };
          var overLay = []
          var control = L.Control.styledLayerControl(null, overLay, controlOptions);
          map.addControl(control);
          // creates a temp layer so it can store the new features
          var editableLayers = new L.FeatureGroup();
          map.addLayer(editableLayers);
          var options = {
            position: 'bottomright',
            draw: {
              polyline: {
                allowIntersection: false,
                drawError: {
                  color: '#e10100', // Color the shape will turn when intersects
                  message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                },
                shapeOptions: {
                  color: '#e10100',
                  weight: 3
                }
              },
              polygon: {
                allowIntersection: false, // Restricts shapes to simple polygons
                drawError: {
                  color: '#e10100', // Color the shape will turn when intersects
                  message: '<strong>Oh snap!<strong> you can\'t draw that!' // Message that will show when intersect
                },
                shapeOptions: {
                  color: '#e10100'
                }
              },
              circle: false, // Turns off this drawing tool
              rectangle: false,
              marker: {
                icon: new L.Icon.Default()
              }
            },
            edit: {
              featureGroup: editableLayers, //REQUIRED!!
              edit: true,
              remove: true,
              selectedPathOptions: { // this property should be one level up
                color: '#000',
                fillColor: '#000'
              }
            }
          };
          var drawControl = new L.Control.Draw(options);
          //map.addControl(drawControl);
          var thisLayer
          map.on(L.Draw.Event.CREATED, function (event) {
            var layer = event.layer;
            editableLayers.addLayer(layer);
            thisLayer = layer.toGeoJSON();
            console.log(thisLayer);
            //toggleButtons();
            document.getElementById('step1').style.display = 'none';
            document.getElementById('step2').style.display = 'block';
            if (barrButton != null) {
              if (thisLayer.geometry.type == "LineString")
                barrButton.style.display = 'block';
              else
                barrButton.style.display = 'none';
            }
          });
        </script>
      </div>
      <div id="sidebar" class="sidebar collapsed">
        <!-- Nav tabs-->
        <div class="sidebar-tabs">
          <ul role="tablist">
            <!-- top aligned tabs-->
            <li><a href="#layers" role="tab"><span aria-hidden="true" class="glyphicon glyphicon-menu-hamburger"></span></a></li>
            <li><a href="#drawTools" role="tab"><span aria-hidden="true" class="glyphicon glyphicon-pencil"></span></a></li>
            <li><a href="#formTools" role="tab"><span aria-hidden="true" class="glyphicon glyphicon-info-sign"></span></a></li>
            <li><a href="#savedSubs" role="tab"><span aria-hidden="true" class="glyphicon glyphicon-list-alt"></span></a></li>
          </ul>
          <!--ul(role='tablist')
          // bottom aligned tabs
          li
            a(href='#settings', role='tab')
              span.glyphicon.glyphicon-cog(aria-hidden='true')
          -->
        </div>
        <!-- Tab panes-->
        <div class="sidebar-content">
          <div id="layers" class="sidebar-pane">
            <h1 class="sidebar-header">Layers
              <div class="sidebar-close"><span aria-hidden="true" class="glyphicon glyphicon-menu-left"></span></div>
            </h1>
            <p class="legend"><span class="legend-item"><img src="/public/css/images/greenSquare.png" width="8%" height="35%"> NPS <img src="/public/css/images/redSquare.png" width="8%" height="35%"> BLM </span><span class="legend-item"><img src="/public/css/images/orangeSquare.png" width="8%" height="35%"> FWS <img src="/public/css/images/purpleSquare.png" width="8%" height="35%"> FS </span></p>
            <div id="layerTools2"></div>
          </div>
          <div id="drawTools" class="sidebar-pane">
            <h1 class="sidebar-header">Draw Tools
              <div class="sidebar-close"><span aria-hidden="true" class="glyphicon glyphicon-menu-left"></span></div>
            </h1>
            <div id="step1">
              <h1>Select shape to draw:</h1>
              <button id="drawLineB" class="drawControl2">Line</button><br>
              <button id="drawPolygonB" class="drawControl2">Polygon</button><br>
              <button id="drawMarkerB" class="drawControl2">Marker</button><br>
              <button id="editShapeB" class="drawControl2">Edit</button><br>
              <button id="delShapeB" class="drawControl2">Delete</button><br>
            </div>
            <div id="step2">
              <h1>Select a feature type:</h1>
              <button id="restButton" class="drawControl2">Restoration</button><br>
              <button id="distButton" class="drawControl2">Disturbance</button><br>
              <button id="barrButton" class="drawControl2">Barrier</button><br>
            </div>
            <div id="step3">
              <div id="sidebar2"></div>
            </div>
          </div>
          <div id="formTools" class="sidebar-pane">
            <h1 class="sidebar-header">Marker Info
              <div class="sidebar-close"><span aria-hidden="true" class="glyphicon glyphicon-menu-left"></span></div>
            </h1>
            <div id="sidebar1"></div>
          </div>
          <div id="savedSubs" class="sidebar-pane">
            <h1 class="sidebar-header">Saved Submissions
              <div class="sidebar-close"><span aria-hidden="true" class="glyphicon glyphicon-menu-left"></span></div>
            </h1>
            <div id="editSaved"></div>
            <div id="savedContent">
              <div id="savedCount"></div>
              <table id="tableSubs">
                <div id="saved"></div>
              </table>
              <button id="sync" class="btn">Submit All Forms</button>
            </div>
          </div>
        </div>
      </div>
      <script>
          
        var lineButton = document.getElementById("drawLineB");
        var polygonButton = document.getElementById("drawPolygonB");
        var markerButton = document.getElementById("drawMarkerB");
        var editButton = document.getElementById("editShapeB");
        var deleteButton = document.getElementById("delShapeB");
        var restButton = document.getElementById("restButton");
        var distButton = document.getElementById("distButton");
        var barrButton = document.getElementById("barrButton");
        var drawLine = new L.Draw.Polyline(map, drawControl.options.polyline);
        var drawPoly = new L.Draw.Polygon(map, drawControl.options.polygon);
        var drawMark = new L.Draw.Marker(map, drawControl.options.marker);
        
        lineButton.addEventListener("click", function(){
            lineButton.style.borderStyle = "inset";
            polygonButton.style.borderStyle = "";
            markerButton.style.borderStyle = "";
            drawLine.enable();
            drawPoly.disable();
            drawMark.disable();
        });
        polygonButton.addEventListener("click", function(){
            lineButton.style.borderStyle = "";
            polygonButton.style.borderStyle = "inset";
            markerButton.style.borderStyle = "";
            drawLine.disable();
            drawPoly.enable();
            drawMark.disable();
        });
        markerButton.addEventListener("click", function(){
            lineButton.style.borderStyle = "";
            polygonButton.style.borderStyle = "";
            markerButton.style.borderStyle = "inset";
            drawLine.disable();
            drawPoly.disable();
            drawMark.enable();
        });
        editButton.addEventListener("click", function(){
            new L.EditToolbar.Edit(map, {
                featureGroup: drawControl.options.edit.featureGroup,
                selectedPathOptions: drawControl.options.edit.selectedPathOptions
            }).enable()
        });
        deleteButton.addEventListener("click", function(){
            new L.EditToolbar.Delete(map, {
                featureGroup: drawControl.options.edit.featureGroup
            }).enable()
        });
        restButton.addEventListener("click", function(){
          lineButton.style.borderStyle = "";
          polygonButton.style.borderStyle = "";
          markerButton.style.borderStyle = "";
          document.getElementById('step2').style.display = 'none';
          document.getElementById('step3').style.display = 'block';
          $('#restoPointForm').toggle(thisLayer.geometry.type === 'Point');
          $('#restoPolyForm').toggle(thisLayer.geometry.type === 'Polygon');
          $('#restoLineForm').toggle(thisLayer.geometry.type === 'LineString');
        });
        distButton.addEventListener("click", function(){
          lineButton.style.borderStyle = "";
          polygonButton.style.borderStyle = "";
          markerButton.style.borderStyle = "";
          document.getElementById('step2').style.display = 'none';
          document.getElementById('step3').style.display = 'block';
          $('#distPointForm').toggle(thisLayer.geometry.type === 'Point');
          $('#distPolyForm').toggle(thisLayer.geometry.type === 'Polygon');
          $('#distLineForm').toggle(thisLayer.geometry.type === 'LineString');
        });
        barrButton.addEventListener("click", function(){
          lineButton.style.borderStyle = "";
          polygonButton.style.borderStyle = "";
          markerButton.style.borderStyle = "";
          document.getElementById('step2').style.display = 'none';
          document.getElementById('step3').style.display = 'block';
          $('#barrierForm').toggle(thisLayer.geometry.type === 'LineString');
        });
        var sidebar = L.control.sidebar('sidebar').addTo(map);
        
        // Moves the layer controls into the sidebar
        var htmlObject = control.getContainer();
        // Get the desired parent node.
        var a = document.getElementById('layerTools2');
        
        // Finally append that node to the new parent, recursively searching out and re-parenting nodes.
        function setParent(el, newParent)
        {
          newParent.appendChild(el);
        }
        setParent(htmlObject, a);
      </script>
    </body>
</html>