L.TileLayer.Canvas = L.TileLayer.extend({
            options: {
                async: !1
            },
            initialize: function(t) {
                L.setOptions(this, t)
            },
            redraw: function() {
                this._map && (this._reset({
                    hard: !0
                }), this._update());
                for (var t in this._tiles) this._redrawTile(this._tiles[t]);
                return this
            },
            _redrawTile: function(t) {
                this.drawTile(t, t._tilePoint, this._map._zoom)
            },
            _createTile: function() {
                var t = L.DomUtil.create("canvas", "leaflet-tile");
                return t.width = t.height = this.options.tileSize, t.onselectstart = t.onmousemove = L.Util.falseFn, t
            },
            _loadTile: function(t, e) {
                t._layer = this, t._tilePoint = e, this._redrawTile(t), this.options.async || this.tileDrawn(t)
            },
            drawTile: function() {},
            tileDrawn: function(t) {
                this._tileOnLoad.call(t)
            }
        }), L.tileLayer.canvas = function(t) {
            return new L.TileLayer.Canvas(t)}