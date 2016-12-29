var _        = require('underscore');
var fs       = require('fs');
var Backbone = require('backbone');
var BaseView = require('../BaseView');
var L        = require('leaflet');

window.L = L;
require('leaflet.markercluster');

var MapView = module.exports = BaseView.extend({

	popupTemplate: _.template('<b>ID: <%= id %></b><br /><%= lat %>, <%= lng %>'),

	initialize: function initialize(options) {
		MapView.__super__.initialize.apply(this, arguments);

		var ctx = this.getContext();

		this.L = L;

		this.options = {};
		this.markers = {};
		this.icons = {};
		this.cursor = null;
		this.rendered = false;

		this.options.popup  = options.popup  || options.popup === undefined ? true : false;
		this.options.cursor = options.cursor || options.popup === undefined ? true : false;

		// Map
		var lat  = options.lat  !== undefined ? options.lat  : ctx.settings.get('settings:mapview:center:lat') || 46.135;
		var lng  = options.lng  !== undefined ? options.lng  : ctx.settings.get('settings:mapview:center:lng') || 8.47;
		var zoom = options.zoom !== undefined ? options.zoom : ctx.settings.get('settings:mapview:zoom') || 13;

		var map = this.map = L.map(this.el, {
			center: [lat, lng],
			zoom: zoom,
			scrollWheelZoom: true,
			zoomControl:false
		});

		// TODO: aggiungere qui il controllo per l'off-line
		var url = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		// url = '/assets/maps/{z}/{x}/{y}.jpg'; // Offline
		var mapLayer = new L.tileLayer(url, { 
			minZoom: 3, 
			maxZoom: 15, 
			attributes: 'Lol', 
			detectRetina: true 
		});
		map.addLayer(mapLayer);

		// Se non ho impostato di default la posizione della mappa
		// salvo le coordinate ogni volta che la mappa viene mossa
		// o ingrandita
		if (!options.lat && !options.lng && !options.zoom) {
			this.listenTo(map, 'moveend', this.saveState);
			this.listenTo(map, 'zoomend', this.saveState);
		}

		// Markers
		L.Icon.Default.imagePath = 'assets/img/';

		this.icons.defaultIcon = L.icon({
			iconUrl:      'assets/img/marker-icon-2x.png',
			shadowUrl:    'assets/img/marker-shadow.png',
			iconSize:     [47, 67], // size of the icon
			shadowSize:   [50, 64], // size of the shadow
			iconAnchor:   [24, 67], // point of the icon which will correspond to marker's location
			shadowAnchor: [15, 62], // the same for the shadow
			popupAnchor:  [-2, -70] // point from which the popup should open relative to the iconAnchor
		});

		/*
		this.icons.defaultIcon = L.divIcon({
			className:  'defaultMarker',
			iconSize:   [60, 60],
			iconAnchor: [30, 30],
			html: '<i class="icon-marker"></i>'
		});
		*/

		this.icons.cursorIcon = L.divIcon({
			className:  'cursorMarker',
			iconSize:   [60, 60],
			iconAnchor: [30, 30],
			html: false
		});


		// Cluster
		this.cluster = new L.MarkerClusterGroup({
			showCoverageOnHover: false,
			iconCreateFunction: _.bind(this.getGroupIcon, this)
		});
		map.addLayer(this.cluster);


		// Collection
		this.listenTo(this.collection, 'add',    this.addMarker);
		// Per motivi di performance non aggiorno i marker quando cambia un model
		// this.listenTo(this.collection, 'change', this.changeMarker);
		this.listenTo(this.collection, 'remove', this.removeMarker);
		this.listenTo(this.collection, 'reset',  this.resetMarkers);


		// Geolocation
		if (this.options.cursor) {
			var lastKnownPosition = ctx.geolocation.getLastKnownPosition();
			var latLng = [lastKnownPosition.latitude || 0, lastKnownPosition.longitude || 0];
			this.cursor = L.marker(latLng, {
				icon: this.icons.cursorIcon,
				clickable: false,
				keyboard: false
			});
			this.cursor.addTo(map);

			this.listenTo(ctx.geolocation, 'change', this.onPositionChange);
			// TODO: this.listenTo(ctx.geolocation, 'error', this.onPositionChangeError);
			// ctx.geolocation.watchPosition();
		}
	},

	getCollection: function getCollection() {
		return this.collection;
	},

	render: function render() {
		this.map.invalidateSize();

		if (!this.rendered)
			this.renderMarkers(this.getCollection());

		this.rendered = true;

		return this;
	},

	renderMarkers: function renderMarkers(collection) {
		var self = this;
		var map = self.map;

		// console.log('Render markers %s', collection.length);

		clearTimeout(this._renderMarkerTimeoutHandler);
		this._renderMarkerTimeoutHandler = setTimeout(function() {
			self.markers = {};
			self.cluster.clearLayers();

			if (collection.length > 0) {
				var markers = [];
				collection.forEach(function (aModel) {
					markers.push(self.addMarker(aModel, { silent: true, addToMap: false }));
				});
				self.cluster.addLayers(markers);
			}
		}, 300);

		return this;
	},

	saveState: function saveState() {
		var center = this.map.getCenter();
		var zoom = this.map.getZoom();
		var ctx = this.getContext();
		ctx.settings.set('settings:mapview:center:lat', center.lat);
		ctx.settings.set('settings:mapview:center:lng', center.lng);
		ctx.settings.set('settings:mapview:zoom', zoom);
		return this;
	},

	addMarker: function addMarker(model, options) {
		if (!options)
			options = {};

		_.defaults(options, {
			silent: false,
			addToMap: true
		});

		var latLng = model.getLatLng();
		var icon = this.getIconFromModel(model);
		var newMarker = L.marker(latLng, { icon: icon });
		newMarker.model = model;

		this.markers[model.cid] = newMarker;

		// Popup
		if (this.options.popup) {
			newMarker.bindPopup(this.getPopupContentFromModel(model));
		}

		if (options.addToMap) {
			this.cluster.addLayer(newMarker);
		}

		if (typeof this.onAddMarker === 'function')
			this.onAddMarker(newMarker);

		return newMarker;
	},

	changeMarker: function changeMarker(model) {
		var marker = this.markers[model.cid];
		if (marker) {
			this.cluster.removeLayers([marker]);
			marker.setPopupContent(this.getPopupContentFromModel(model));
			marker.setIcon(this.getIconFromModel(model));
			if (model.changed[model.latAttribute] || model.changed[model.lngAttribute]) {
				var latLng = model.getLatLng();
				marker.setLatLng(new L.LatLng(latLng[0], latLng[1]));
			}
			this.cluster.addLayer(marker);
		}
		return this;
	},

	removeMarker: function removeMarker(model) {
		var marker = this.markers[model.cid];
		if (marker) {
			this.cluster.removeLayers([marker]);
			delete this.markers[model.cid];
		}
		return this;
	},

	resetMarkers: function resetMarkers() {
		var map = this.map;
		this.markers = {};
		this.cluster.clearLayers();
		this.render();
		return this;
	},

	panTo: function panTo(latLng) {
		this.map.panTo(latLng);
		return this;
	},

	getIconFromModel: function getIconFromModel(model) {
		return this.icons.defaultIcon;
	},

	getGroupIcon: function getGroupIcon(cluster) {
		return this.cluster._defaultIconCreateFunction(cluster);
	},

	getPopupContentFromModel: function getPopupContentFromModel(model) {
		var latLng = model.getLatLng();
		return this.popupTemplate({
			id: model.cid,
			model: model.toJSON(),
			lat: latLng[0],
			lng: latLng[1]
		});
	},

	onPositionChange: function onPositionChange(position) {
		var latLng = [position.latitude, position.longitude];
		this.cursor.setLatLng(latLng);
	},

	onDestroy: function onDestroy() {
		this.map.remove();
		MapView.__super__.onDestroy.call(this);
	}

});

