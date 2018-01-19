'use strict';
function myAgency(agen) {
    switch (agen) {
        case 0:
            return 'BLM';
            break;
        case 1:
            return 'NPS';
            break;
        case 2:
            return 'FS';
            break;
        case 3:
            return 'FWS';
            break;
        default:
            return 'null';
            break;
    }
}

L.MBTiles = L.Layer.extend({

	options: {
		subdomains: 'abc',
		active: false
	},

	initialize: function(url, options) {
		L.setOptions(this, options);
		this._layers = [];
		this._url = url;
		this.tileCache = new iDB('mojavedataTileDB');
		this.needRefresh = true;
		// L.Layer.prototype.initialize.call(this, null);
	},

	beforeAdd: function (map) {
		this._map = map;
	},

	addLayer: function (layer) {
		this._layers.push(layer);
		
		//console.log(layer)
		if (layer.options.popup != null && layer.options.popup) {
			layer.on('click', function showPopup(e) {
				// var attr = '';
				// for (var p in e.target.feature.properties) {
				// 	attr += p + ': ' + e.target.feature.properties[p] + '<br>'
				// }
				// map.openPopup(attr, e.latlng);
				var popUpContent = [];
		        // iterating through the "properties" so it can be displayed in the pop-ups
		        for (var prop in layer.feature.properties) {
		            if (prop == 'agency') {
		                popUpContent.push('<B>' + prop + '</B>' + ' : ' + myAgency(layer.feature.properties[prop]));
		            } else popUpContent.push('<B>' + prop + '</B>' + ' : ' + layer.feature.properties[prop]);
		        }
		        // opens the marker info tab on sidebar when clicked
		        sidebar.open('formTools');
		        //map.panTo(this.getLatLng());
		        $('#sidebar1').empty();
		        $("<B><U>Soil Vulnerability</U></B><br />").appendTo('#sidebar1');
		        for (var ii = 0; ii < popUpContent.length; ii++) {
		            $('<p>' + popUpContent[ii] + '</p>').appendTo('#sidebar1');
		        }
			});
		}

		if (this._map) {
			this._map.addLayer(layer);
		}
	},

	clearLayers: function () {
		// console.log(this._layers.length);

		for (var i = 0; this._layers.length > i; i++) {
			this._map.removeLayer(this._layers[i]);
			//delete this._map._renderer._drawnLayers[this._layers[i]._leaflet_id];
			//this._layers[i] = {}
		}
		this._layers.length = 0;
	},

	onAdd: function (map) {
		this._map = map;
		if (this.needRefresh) {
			this.refreshOnZoom();
			this.needRefresh = false;
		}
	},

	onRemove: function (map) {
		this.clearLayers();
	},

	getEvents: function () {
		var events = {
			// viewprereset: this._invalidateAll,
			// viewreset: this.refresh,
			//zoom: this.refreshOnZoom,
			moveend: this.refreshOnZoom
		};

		return events;
	},

	refreshOnZoom: function() {
		if (this._map && this._map.hasLayer(this)) {
			var zoom = this._map.getZoom();
			if (!this.options.maxZoom && !this.options.minZoom) {
				this.refresh();
			} else if ((this.options.maxZoom && (zoom > this.options.maxZoom )) ||
				(this.options.minZoom && (zoom < this.options.minZoom))) {
				this.clearLayers();
			} else {
				this.refresh();
			}
		}
	},

	refresh: function (url) {
	    this.clearLayers();
	    this.update();
	},


	update: function (center) {
		var zoom = this._clampZoom(map.getZoom());
		this._tileZoom = zoom;

		if (center === undefined) { center = map.getCenter(); }

		var pixelBounds = this._getTiledPixelBounds(center),
		    tileRange = this._pxBoundsToTileRange(pixelBounds),
		    tileCenter = tileRange.getCenter(),
		    queue = []

		// Sanity check: panic if the tile range contains Infinity somewhere.
		if (!(isFinite(tileRange.min.x) && isFinite(tileRange.min.y) &&
		      isFinite(tileRange.max.x) && isFinite(tileRange.max.y))) { 
			throw new Error('Attempted to load an infinite number of tiles'); 
		}

		// create a queue of coordinates to load tiles from
		for (var j = tileRange.min.y; j <= tileRange.max.y; j++) {
			for (var i = tileRange.min.x; i <= tileRange.max.x; i++) {
				var coords = new L.Point(i, j);
				coords.z = this._tileZoom;
				if (this._isValidTile(coords)) {
					queue.push(coords);
				}
			}
		}

		if (queue.length !== 0) {
			for (i = 0; i < queue.length; i++) {
				this._addTile(queue[i]);
			}
		}
	},

    _addTile: function(coords) {
		var vectorTilePromise = this._getVectorTilePromise(coords);

		vectorTilePromise.then( function renderTile(purePBF) {

			var bufArray = new Uint8Array(purePBF);
			var pbf = new Pbf(bufArray);
			//console.log(pbf);
			var vectorTile = new VectorTile(pbf);
			  //= this._pbfTile2VectorTile(purePBF);

			var layerName = this.options.mbtileLayerName;
			if (vectorTile.layers[layerName]) {
			 	for (var i = 0; i < vectorTile.layers[layerName].length; i++) {
			 		// var feat = vectorTile.layers[layerName].feature(i);
					var geojson = vectorTile.layers[layerName].feature(i).toGeoJSON(coords.x, coords.y, coords.z);
					var feature;
					var latlngs = [];

					if (geojson.geometry.type === 'LineString') {
						for (var j = 0; geojson.geometry.coordinates.length > j; j++) {
							latlngs.push([geojson.geometry.coordinates[j][1], geojson.geometry.coordinates[j][0]]);
						}

						feature = L.polyline(latlngs,this.options.style(geojson));
					}

					if (geojson.geometry.type === 'MultiLineString') {
						for (var j = 0; geojson.geometry.coordinates.length > j; j++) {
							latlngs[j] = [];
							for (var k = 0; k < geojson.geometry.coordinates[j].length; k++) {
								latlngs[j].push([geojson.geometry.coordinates[j][k][1], geojson.geometry.coordinates[j][k][0]]);
							}
						}							

						feature = L.polyline(latlngs,this.options.style(geojson));
					}

					if (geojson.geometry.type === 'Point') {
						var latlng = [geojson.geometry.coordinates[1], geojson.geometry.coordinates[0]];
						feature = this.options.pointToLayer(geojson, latlng);
					}

					if (geojson.geometry.type === 'Polygon') {
						for (var j = 0; geojson.geometry.coordinates.length > j; j++) {
							latlngs[j] = [];
							for (var k = 0; k < geojson.geometry.coordinates[j].length; k++) {
								latlngs[j].push([geojson.geometry.coordinates[j][k][1], geojson.geometry.coordinates[j][k][0]]);
							}
						}							
						feature = L.polygon(latlngs,this.options.style(geojson));
					}

					if (geojson.geometry.type === 'MultiPolygon') {
						for (var j = 0; geojson.geometry.coordinates.length > j; j++) {
							latlngs[j] = [];
							for (var k = 0; k < geojson.geometry.coordinates[j].length; k++) {
								latlngs[j][k] = [];
								for (var m = 0; m < geojson.geometry.coordinates[j][k].length; m++) {
									latlngs[j][k].push([geojson.geometry.coordinates[j][k][m][1], geojson.geometry.coordinates[j][k][m][0]]);
								}
							}
						}							

						feature = L.polygon(latlngs,this.options.style(geojson));

					}

					// if (!feature) {
					// 	console.log(geojson)
					// }

					//console.log(geojson.geometry.type);
					feature.feature = geojson;
					this.addLayer(feature);

					// feat = null;
					// geojson = null;
				}
			}
			vectorTile = null;
			pbf = null;
			bufArray = null;
			purePBF = null;
		}.bind(this));
	},

	_getVectorTilePromise: function(coords) {
		var tileCoordsKey = this._tileCoordsToKey(coords)
		var self = this;

		// console.log(tileCoordsKey)

		var tile = this.tileCache.readTile(tileCoordsKey, this.options.storage);
		
		return tile
		.then(function(pureTile) {
			if (pureTile.purePBF !== null) {
				//console.log(pureTile);
				return pureTile.purePBF//self._pbfTile2VectorTile(pureTile.purePBF);
			} else {
				return {layers: []}
			}
		}).catch(function(e) {
			console.log('catch: ' + e);

			var tileUrl = L.Util.template(self._url, coords);

			return fetch(tileUrl, self.options.fetchOptions).then(function(response) {
				if (response.ok) {
					return response.blob().then( function (blob) {
						var reader = new FileReader();
						return new Promise(function(resolve) {
							reader.addEventListener("loadend", function() {

								var pureTile = {
									coord:  tileCoordsKey,
									purePBF: reader.result
								}
								self.tileCache.writeTile(self.options.storage, pureTile);
								//var vectorTile = self._pbfTile2VectorTile(reader.result);

								return resolve(reader.result);
							});
							reader.readAsArrayBuffer(blob);
						});
					});
				} else {
					throw new Error('Network response was not ok:' + response.status);
					console.log(response.status);
					//return {layers:[]};
				}
			})
			.catch(function(reason) {
				console.log('ERROR on download tile: ' + reason);
				self.tileCache.writeTile(self.options.storage, {
					coord: tileCoordsKey,
					purePBF: null					
				});
				return {layers:[]};
			});

		});
	},

	_pbfTile2VectorTile: function (pbf) {
		var bufArray = new Uint8Array(pbf);
		if (bufArray[0] === 31) {
			return new VectorTile(new Pbf(pako.inflate(bufArray)));
		} else {
			return new VectorTile(new Pbf(bufArray));
		}
		pbf = null;	
		//bufArray = null;
	},

	_clampZoom: function (zoom) {
		var options = this.options;

		if (undefined !== options.minNativeZoom && zoom < options.minNativeZoom) {
			return options.minNativeZoom;
		}

		if (undefined !== options.maxNativeZoom && options.maxNativeZoom < zoom) {
			return options.maxNativeZoom;
		}

		return zoom;
	},

	_getTiledPixelBounds: function (center) {
		var map = this._map,
		    mapZoom = map._animatingZoom ? Math.max(map._animateToZoom, map.getZoom()) : map.getZoom(),
		    scale = map.getZoomScale(mapZoom, this._tileZoom),
		    pixelCenter = map.project(center, this._tileZoom).floor(),
		    halfSize = map.getSize().divideBy(scale * 2);

		return new L.Bounds(pixelCenter.subtract(halfSize), pixelCenter.add(halfSize));
	},	    

	_pxBoundsToTileRange: function (bounds) {
		var tileSize = {x:256, y:256};
		return new L.Bounds(
			bounds.min.unscaleBy(tileSize).floor(),
			bounds.max.unscaleBy(tileSize).ceil().subtract([1, 1]));
	},

	_tileCoordsToKey: function (coords) {
		return coords.x + ':' + coords.y + ':' + coords.z;
	},

	_isValidTile: function (coords) {
		if (!this.options.bounds) { return true; }

		// don't load tile if it doesn't intersect the bounds in options
		var tileBounds = this._tileCoordsToBounds(coords);
		return L.latLngBounds(this.options.bounds).overlaps(tileBounds);
	},

	_tileCoordsToBounds: function (coords) {
		var bp = this._tileCoordsToNwSe(coords),
		    bounds = new L.LatLngBounds(bp[0], bp[1]);

		if (!this.options.noWrap) {
			bounds = this._map.wrapLatLngBounds(bounds);
		}
		return bounds;
	},

	_tileCoordsToNwSe: function (coords) {
		var map = this._map,
		    tileSize = {x:256, y:256},
		    nwPoint = coords.scaleBy(tileSize),
		    sePoint = nwPoint.add(tileSize),
		    nw = map.unproject(nwPoint, coords.z),
		    se = map.unproject(sePoint, coords.z);
		return [nw, se];
	},
});

L.mbTiles = function (url, options) {
	return new L.MBTiles(url, options);
};

var iDB = idb;

function idb(dbName) {
	this.dbName = dbName;
}

idb.prototype = {
	connectDB: function(storage, f) {
		var thisDB = this;
		var request = indexedDB.open(this.dbName, 1);

		request.onerror = function (e){
			console.log(e.target.error);
		}
		request.onsuccess = function(){
			f(request.result, storage);
			//console.log(this);
		}
		request.onupgradeneeded = function(e){
			for (var i in layerStorage) {
				var storage = layerStorage[i];
				var objectStore = e.currentTarget.result.createObjectStore(storage, { keyPath: "coord" });
				objectStore.createIndex(storage + "_idx", "coord", { unique: true });
			}

			thisDB.connectDB(storage, f);
		}
	},

	readTile: function (coord, storage) {
		var thisDB = this;
		return new Promise (function(resolve, reject) {
			thisDB.connectDB(storage, function(db, storage) {
				if (db.objectStoreNames.contains(storage)) {
					//db.createObjectStore(storage, { keyPath: "coord" });
					var request = db.transaction([storage], "readonly").objectStore(storage).index(storage + "_idx").get(coord);
				}

				request.onerror = function (e) {
					console.log(e.target.error);
				}
				request.onsuccess = function() {
					resolve(request.result ? request.result : null);
				}
			});
		})
	},

	writeTile: function(storage,tile) {
		this.connectDB(storage, function(db, storage) {
			if (db.objectStoreNames.contains(storage)) {
				//db.createObjectStore(storage, { keyPath: "coord" });
				var objStore = db.transaction([storage], "readwrite").objectStore(storage);
			}
			// console.log(storage);
			var request = objStore.add(tile);
			request.onerror = function (e){
				console.log(e.target.error);
			}
			request.onsuccess = function(){
				return request.result;
			}
		});
	}

	// logerr: function (err){
	// 	console.log(err);
	// }
};