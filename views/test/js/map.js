'use strict';

var map = L.map('map', {
	center: [36.4, -116],
	zoom: 8,
	// renderer: L.canvas(),
	preferCanvas: true,
	zoomControl: false,
	attributionControl: false
});

var canvasRenderer = L.canvas();

var polygonsPane = map.createPane('polygons');
var linesPane = map.createPane('lines');

// var attribution = L.control.attribution().addTo(map);
// attribution.addAttribution('<a href="privacy-security.html" target="_blank">Privacy & Security</a>');
// attribution.addAttribution('<a href="foia.html" target="_blank">FOIA</a>');
// attribution.addAttribution('<a href="nofear.html" target="_blank">No Fear Act</a>');
// attribution.addAttribution('<a href="license.html" target="_blank">License</a>');
// attribution.addAttribution('<a href="http://dodcio.defense.gov/DoDSection508/Std_Stmt.aspx" target="_blank">Accessibility/Section 508 </a>');
// attribution.addAttribution('<a href="https://www.usa.gov/" target="_blank">USA.gov</a>');

var mapOpenStreet = L.tileLayer('//{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	name: "OpenStreetMap",
	zIndex: 1,
	minZoom: 7,
	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var mapGRoad = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
	name: "Google Roadmap",
	zIndex: 1,
	minZoom: 7,
	maxZoom: 20,
	subdomains:['mt0','mt1','mt2','mt3']
});

var mapGSatellite = L.tileLayer('http://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',{
	name: "Google Satellite",
	zIndex: 1,
	maxZoom: 20,
	subdomains:['mt0','mt1','mt2','mt3']
});

var mapGHyb = L.tileLayer('http://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}',{
	name: "Google Hybrid",
	zIndex: 1,
	maxZoom: 20,
	subdomains:['mt0','mt1','mt2','mt3']
});

var mapGTerrain = L.tileLayer('http://{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}',{
	name: "Google Terrain",
	zIndex: 1,
	maxZoom: 20,
	subdomains:['mt0','mt1','mt2','mt3']
});

var distLine = L.mbTiles("data/dist_line/{z}/{x}/{y}.pbf", {
	name: "Disturbance Lines",
	storage: "Disturbance Lines",
	mbtileLayerName: "dist_line",
	pane: 'lines',
	maxNativeZoom: 10,
	minNativeZoom: 10,
	minZoom: 6,
	bounds: L.latLngBounds([36.9,-116.2],[35.0,-113.9]),
	interactive: true,
	legendIcon: drawLine,	
	style: function(feature) {
		return {
			weight: 1,
			color: '#993333',
			opacity: 0.4			
		}
	}
})
.addTo(map)

var distPoint = L.mbTiles("data/dist_point/{z}/{x}/{y}.pbf", {
	name: "Disturbance Points",
	storage: "Disturbance Points",
	mbtileLayerName: "dist_point",
	maxNativeZoom: 10,
	minNativeZoom: 10,
	minZoom: 6,
	bounds: L.latLngBounds([36.9,-116.2],[35.0,-113.9]),
	interactive: true,
	legendIcon: drawCircle,	
	style: function (feature) {
		return {
			radius: 4,
			color: '#555',
			weight: 0.2,
			fillOpacity: 1,
			fillColor: '#009900'			
		}	
	},
	pointToLayer: function (feature, latlng, style) {
		return L.circleMarker(latlng, this.style());
	}
})
.addTo(map)

var distPolygon = L.mbTiles("data/dist_polygon/{z}/{x}/{y}.pbf", {
	name: "Disturbance Polygon",
	storage: "Disturbance Polygon",
	mbtileLayerName: "dist_polygon",
	maxNativeZoom: 10,
	minNativeZoom: 10,
	minZoom: 6,
	bounds: L.latLngBounds([36.9,-116.2],[35.0,-113.9]),
	legendIcon: drawRect,	
	style: function(feature) {
		return {
			interactive: true,
			pane: 'polygons',
			renderer: canvasRenderer,
			weight: 0.5,
			color: '#f00',
			opacity: 1,
			// dashArray: '5, 3',
			// fillColor: '#e39e1c',
			// fillOpacity: 0.4,
			fill: false
		}
	}
})
.addTo(map)

var blmRegions = L.mbTiles("data/blmRegions/{z}/{x}/{y}.pbf", {
	name: "BLM Regions",
	storage: "BLM Regions",
	mbtileLayerName: "blmRegions",
	maxNativeZoom: 10,
	minNativeZoom: 10,
	minZoom: 6,
	bounds: L.latLngBounds([36.9,-116.2],[35.0,-113.9]),
	legendIcon: drawRect,	
	style: function(feature) {
		return {
			interactive: true,
			pane: 'polygons',
			renderer: canvasRenderer,
			weight: 0.5,
			color: '#0f0',
			opacity: 1,
			// dashArray: '5, 3',
			fillColor: '#e39e1c',
			fillOpacity: 0.4,
			// fill: false
		}
	}
})

var fsRegions = L.mbTiles("data/fsRegions/{z}/{x}/{y}.pbf", {
	name: "FS Regions",
	storage: "FS Regions",
	mbtileLayerName: "fsRegions",
	maxNativeZoom: 10,
	minNativeZoom: 10,
	minZoom: 6,
	bounds: L.latLngBounds([36.9,-116.2],[35.0,-113.9]),
	legendIcon: drawRect,	
	style: function(feature) {
		return {
			interactive: true,
			pane: 'polygons',
			renderer: canvasRenderer,
			weight: 0.5,
			color: '#0f0',
			opacity: 1,
			// dashArray: '5, 3',
			fillColor: '#e39e1c',
			fillOpacity: 0.4,
			// fill: false
		}
	}
})


var nvCounties = L.mbTiles("data/nvCounties/{z}/{x}/{y}.pbf", {
	name: "NV Counties",
	storage: "NV Counties",
	mbtileLayerName: "nvCounties",
	maxNativeZoom: 10,
	minNativeZoom: 10,
	minZoom: 6,
	bounds: L.latLngBounds([36.9,-116.2],[35.0,-113.9]),
	legendIcon: drawRect,	
	style: function(feature) {
		return {
			interactive: true,
			pane: 'polygons',
			renderer: canvasRenderer,
			weight: 0.5,
			color: '#0f0',
			opacity: 1,
			// dashArray: '5, 3',
			fillColor: '#e39e1c',
			fillOpacity: 0.4,
			// fill: false
		}
	}
})

var snapExtents = L.mbTiles("data/snapExtents/{z}/{x}/{y}.pbf", {
	name: "SNAP Extents",
	storage: "SNAP Extents",
	mbtileLayerName: "snapExtents",
	maxNativeZoom: 10,
	minNativeZoom: 10,
	minZoom: 6,
	bounds: L.latLngBounds([36.9,-116.2],[35.0,-113.9]),
	legendIcon: drawRect,	
	style: function(feature) {
		return {
			interactive: true,
			pane: 'polygons',
			renderer: canvasRenderer,
			weight: 0.5,
			color: '#0f0',
			opacity: 1,
			// dashArray: '5, 3',
			fillColor: '#e39e1c',
			fillOpacity: 0.4,
			// fill: false
		}
	}
})

var mdepBoundry = L.mbTiles("data/mdepBoundry/{z}/{x}/{y}.pbf", {
	name: "MDEP Boundry",
	storage: "MDEP Boundry",
	mbtileLayerName: "mdepBoundry",
	maxNativeZoom: 10,
	minNativeZoom: 10,
	minZoom: 6,
	bounds: L.latLngBounds([36.9,-116.2],[35.0,-113.9]),
	legendIcon: drawRect,	
	style: function(feature) {
		return {
			interactive: true,
			pane: 'polygons',
			renderer: canvasRenderer,
			weight: 0.5,
			color: '#0f0',
			opacity: 1,
			// dashArray: '5, 3',
			fillColor: '#e39e1c',
			fillOpacity: 0.4,
			// fill: false
		}
	}
})



var mdiBoundry = L.mbTiles("data/mdiBoundry/{z}/{x}/{y}.pbf", {
	name: "MDI Boundry",
	storage: "MDI Boundry",
	mbtileLayerName: "mdiBoundry",
	maxNativeZoom: 10,
	minNativeZoom: 10,
	minZoom: 6,
	bounds: L.latLngBounds([36.9,-116.2],[35.0,-113.9]),
	legendIcon: drawRect,	
	style: function(feature) {
		return {
			interactive: true,
			pane: 'polygons',
			renderer: canvasRenderer,
			weight: 0.5,
			color: '#0f0',
			opacity: 1,
			// dashArray: '5, 3',
			fillColor: '#e39e1c',
			fillOpacity: 0.4,
			// fill: false
		}
	}
})

var roads = L.mbTiles("data/roads/{z}/{x}/{y}.pbf", {
	name: "Roads",
	storage: "Roads",
	mbtileLayerName: "roads",
	maxNativeZoom: 10,
	minNativeZoom: 10,
	minZoom: 6,
	bounds: L.latLngBounds([36.9,-116.2],[35.0,-113.9]),
	legendIcon: drawRect,	
	style: function(feature) {
		return {
			interactive: true,
			pane: 'polygons',
			renderer: canvasRenderer,
			weight: 0.5,
			color: '#0f0',
			opacity: 1,
			// dashArray: '5, 3',
			fillColor: '#e39e1c',
			fillOpacity: 0.4,
			// fill: false
		}
	}
})

var soil = L.mbTiles("data/soil/{z}/{x}/{y}.pbf", {
	name: "Soil Vulnerability",
	storage: "Soil Vulnerability",
	mbtileLayerName: "soil",
	maxNativeZoom: 10,
	minNativeZoom: 10,
	minZoom: 6,
	bounds: L.latLngBounds([36.9,-116.2],[35.0,-113.9]),
	legendIcon: drawRect,	
	style: function(feature) {
		return {
			interactive: true,
			pane: 'polygons',
			renderer: canvasRenderer,
			weight: 0.5,
			color: '#0f0',
			opacity: 1,
			// dashArray: '5, 3',
			fillColor: '#e39e1c',
			fillOpacity: 0.4,
			// fill: false
		}
	}
})
// .addTo(map)


var layerGroups = [
	{ 
		"name": 'Disturbance Data',
		"expanded": false,
		"layers": [
			distPoint,
			distLine,
			distPolygon
		]
	},
	{
		"name": 'Misc',
		"expanded": false,
		"layers": [
			roads,
			soil,
			blmRegions,
			fsRegions,
			nvCounties,
			snapExtents,
			mdepBoundry,
			mdiBoundry
		]
	},
	{
		"name": "Basemaps",
		"expanded": false,
		layers: [
			mapOpenStreet,
			mapGRoad,
			mapGSatellite,
			mapGHyb,
			mapGTerrain
		]
	}
];

var layerStorage = [
	'Disturbance Lines',
	'Disturbance Points',
	'Disturbance Polygon',
	'Roads',
	'Soil Vulnerability',
	'BLM Regions',
	'FS Regions',
	'NV Counties',
	'SNAP Extents',
	'MDEP Boundry',
	'MDI Boundry'
];

//L.control.layers(baseLayers, overlays, {
var layerControl = L.control.layers(layerGroups, {
	position: 'topleft',
	collapsed: true,
	autoZIndex: false
}).addTo(map);

L.control.zoom({
	position: 'topleft'
}).addTo(map);

// var oldZoom = map.getZoom();

// map.on('zoom', function(e) {
// 	if (oldZoom === 9 && map.getZoom() === 10) {
// 		layerControl.replaceItem(ne_river_raster, ne_river_vector);
// 		layerControl.replaceItem(nw_river_raster, nw_river_vector);
// 		layerControl.replaceItem(se_river_raster, se_river_vector);
// 		layerControl.replaceItem(sw_river_raster, sw_river_vector);
// 	} 

// 	if (oldZoom === 10 && map.getZoom() === 9) {
// 		layerControl.replaceItem(ne_river_vector, ne_river_raster);
// 		layerControl.replaceItem(nw_river_vector, nw_river_raster);
// 		layerControl.replaceItem(se_river_vector, se_river_raster);
// 		layerControl.replaceItem(sw_river_vector, sw_river_raster);
// 	}

// 	oldZoom = map.getZoom();
// })

function drawCircle(context, style) {
	context.beginPath();
	context.arc(10,6,4.5,0,2 * Math.PI, false);
	context.fillStyle = style.fillColor;
	context.fill();
	context.stroke();	
}

function drawLine(context, style) {
	context.beginPath();
	context.moveTo(0,6);
	context.lineTo(20,6)
	context.strokeStyle = style.color;
	context.lineWidth = 3;
	context.stroke();	
}

function drawRect(context, style) {
	context.strokeStyle = style.color;
	if (style.dashArray) {
		context.setLineDash(style.dashArray.split(','))
	}
	context.lineWidth = 3;
	context.strokeRect(0, 0, 20, 12);
}

L.Canvas.include({
	_updatePoly: function (layer, closed) {
		if (!this._drawing) { return; }

		var i, j, len2, p,
		    parts = layer._parts,
		    len = parts.length,
		    ctx = this._ctx;

		if (!len) { return; }

		// this._drawnLayers[layer._leaflet_id] = layer;

		ctx.beginPath();

		for (i = 0; i < len; i++) {
			for (j = 0, len2 = parts[i].length; j < len2; j++) {
				p = parts[i][j];
				ctx[j ? 'lineTo' : 'moveTo'](p.x, p.y);
			}
			if (closed) {
				ctx.closePath();
			}
		}

		this._fillStroke(ctx, layer);

		// TODO optimization: 1 fill/stroke for all features with equal style instead of 1 for each feature
	},

	_updateCircle: function (layer) {

		if (!this._drawing || layer._empty()) { return; }

		var p = layer._point,
		    ctx = this._ctx,
		    r = Math.max(Math.round(layer._radius), 1),
		    s = (Math.max(Math.round(layer._radiusY), 1) || r) / r;

		// this._drawnLayers[layer._leaflet_id] = layer;

		if (s !== 1) {
			ctx.save();
			ctx.scale(1, s);
		}

		ctx.beginPath();
		ctx.arc(p.x, p.y / s, r, 0, Math.PI * 2, false);

		if (s !== 1) {
			ctx.restore();
		}

		this._fillStroke(ctx, layer);
	},

})
