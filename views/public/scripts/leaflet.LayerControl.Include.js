'use strict';

L.Control.Layers.include({
	initialize: function (layerGroups, options) {
		L.Util.setOptions(this, options);

		this._layerControlInputs = [];
		this._layers = [];
		this._lastZIndex = 0;
		this._handlingClick = false;
		this._groups = layerGroups;
		this._basemaps = [];

		for (var i in this._groups) {
			var group = this._groups[i];
			for (var j in group.layers) {
				this._addLayer(group.layers[j], group.layers[j].options.name, true);
				if (group.name === 'Basemaps') {
					this._basemaps.push({
						layer: group.layers[j],
						name: group.layers[j].options.name
					})
				}
			}
		}
	},

	_addLayer: function (layer, name, overlay) {
		this._layers.push({
			layer: layer,
			name: name,
		});

		if (this.options.autoZIndex && layer.setZIndex) {
			this._lastZIndex++;
			layer.setZIndex(this._lastZIndex);
		}

		this._expandIfNotCollapsed();
	},

	_update: function () {
		if (!this._container) { return this; }

		// L.DomUtil.empty(this._baseLayersList);
		L.DomUtil.empty(this._overlaysList);

		for (var i in this._groups) {
			var tab = L.DomUtil.create('div', 'leaflet-control-layers-group', this._overlaysList);
			var input = L.DomUtil.create('input', 'leaflet-control-layers-input', tab);
			input.setAttribute('type','checkbox');
			input.setAttribute('id','group-' + i);
			input.groupId = i;
			input.checked = this._groups[i].expanded ? true : false;
			// if (this._groups[i].expanded) {
			// 	input.checked = 
			// }
			L.DomEvent.on(input, 'change', this._onTabChange, this);
			var title = L.DomUtil.create('label', 'leaflet-control-layers-title', tab);
			title.innerHTML = this._groups[i].name;
			title.setAttribute('for','group-' + i);
			this._groups[i].container = L.DomUtil.create('div', 'leaflet-control-layers-div', tab);
		}

		this._layerControlInputs = [];
		this._groups.forEach(function(group, i) {
			group.layers.forEach(function(layer, i) {
				this._addItem(layer, group.container, group.name);
			}, this)
		}, this)

		var tab = L.DomUtil.create('div', 'leaflet-control-layers-group', this._overlaysList);
		var title = L.DomUtil.create('label', 'leaflet-control-layers-title', tab);
		title.innerHTML = 'Mobile Form';
		this._groups[i].container = L.DomUtil.create('div', 'leaflet-control-layers-div', tab);

		return this;
	},

	_onTabChange: function(e) {
		if (e.target.checked) {
			this._groups[e.target.groupId].expanded = true;
		} else {
			this._groups[e.target.groupId].expanded = false;
		}
	},

	_addItem: function (layer, container, groupName) {
		//var	checked = this._map.hasLayer(layer),
		var	input, label;

		input = document.createElement('input');
		if (groupName === 'Basemaps') {
			input.type = 'radio';
			input.setAttribute('name', 'leaflet-base-layers');
			L.DomEvent.on(input, 'click', this._onRadioClick, this);
		} else {
			input.type = 'checkbox';
			L.DomEvent.on(input, 'click', this._onCheckboxClick, this);
			var uz = this.drawUZ(layer);
		}

		input.className = 'leaflet-control-layers-input';
		input.setAttribute('id', L.Util.stamp(layer));
		input.checked = this._map.hasLayer(layer);
		label = document.createElement('label');
		label.setAttribute('for',  L.Util.stamp(layer));
		label.innerHTML = 'ON';
		label.className = 'leaflet-control-layers-name'

		this._layerControlInputs.push(input);
		input.layerId = L.Util.stamp(layer);

		var name = document.createElement('span');
		name.innerHTML = ' ' + layer.options.name;

		var tocItem = document.createElement('div');
		tocItem.className = 'leaflet-control-layers-layer'

		tocItem.appendChild(input);
		tocItem.appendChild(label);
		if (uz) tocItem.appendChild(uz);
		tocItem.appendChild(name);

		container.appendChild(tocItem);

		this._checkDisabledLayers();
		return tocItem;
	},

	drawUZ: function(layer) {
		var uz = document.createElement('div');
		var canvasPattern = document.createElement("canvas");
		canvasPattern.width = 20;
		canvasPattern.height = 12;

		layer.options.legendIcon(canvasPattern.getContext("2d"), layer.options.style());
		uz.appendChild(canvasPattern);	

		return uz;
	},

	replaceItem: function(old_layer, new_layer) {
		old_layer.off('add remove', this._onLayerChange, this);

		for (var i = 0; this._groups.length > i; i++) {
			for (var j = 0; this._groups[i].layers.length > j; j++) {
				if (L.Util.stamp(this._groups[i].layers[j]) === L.Util.stamp(old_layer)) {
					this._groups[i].layers[j] = new_layer;
				}
			}
		}

		if (map.hasLayer(old_layer)) {
			old_layer.removeFrom(map);
			new_layer.addTo(map);
		}

		for (var i = 0; this._layers.length > i; i++) {
			if (L.Util.stamp(this._layers[i].layer) === L.Util.stamp(old_layer)) {
				this._layers[i].layer = new_layer;
			}
		}

		this._update();
	},

	_onRadioClick: function (e) {
		this._handlingClick = true;

		for (var i = 0; this._basemaps.length > i; i++) {
			if (L.Util.stamp(this._basemaps[i].layer) === e.target.layerId) {
				this._basemaps[i].layer.addTo(this._map)
			} else {
				this._basemaps[i].layer.removeFrom(this._map);
			}
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},

	_onCheckboxClick: function (e) {
		this._handlingClick = true;

		var layer = this._getLayer(e.target.layerId).layer;
		if (e.target.checked) {
			layer.needRefresh = true;
			layer.addTo(this._map);
		} else if (!e.target.checked) {
			layer.removeFrom(this._map);
		}

		this._handlingClick = false;

		this._refocusOnMap();
	},


	_initLayout: function () {
		var className = 'leaflet-control-layers',
		    container = this._container = L.DomUtil.create('div', className),
		    collapsed = this.options.collapsed;

		// makes this work on IE touch devices by stopping it from firing a mouseout event when the touch is released
		container.setAttribute('aria-haspopup', true);

		L.DomEvent.disableClickPropagation(container);
		L.DomEvent.disableScrollPropagation(container);

		var form = this._form = L.DomUtil.create('form', className + '-list');

		if (collapsed) {
			this._map.on('click', this.collapse, this);

			// if (!L.Browser.android) {
			// 	L.DomEvent.on(container, {
			// 		mouseenter: this.expand,
			// 		mouseleave: this.collapse
			// 	}, this);
			// }
		}

		var link = this._layersLink = L.DomUtil.create('a', className + '-toggle', container);
		link.href = '#';
		link.title = 'Layers';

		// if (L.Browser.touch) {
			L.DomEvent.on(link, 'click', L.DomEvent.stop);
			L.DomEvent.on(link, 'click', this.expand, this);
		// } else {
		// 	L.DomEvent.on(link, 'focus', this.expand, this);
		// }

		if (!collapsed) {
			this.expand();
		}

		var closeBtn = L.DomUtil.create('div', className + '-close-btn', form);
		closeBtn.innerHTML = '&lsaquo;';
		L.DomEvent.on(closeBtn, 'click', this.collapse, this);

		// this._separator = L.DomUtil.create('div', className + '-separator', form);
		this._overlaysList = L.DomUtil.create('div', className + '-overlays', form);
		//this._baseLayersList = L.DomUtil.create('div', className + '-base', form);

		container.appendChild(form);
	}
});