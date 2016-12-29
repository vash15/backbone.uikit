var _                 = require('underscore');
var Backbone          = require('backbone');

var PaginatedListView = require('./PaginatedListView');
var GroupListItemView = require('./GroupListItemView');


var GroupListView = module.exports = PaginatedListView.extend({

	className: function className() {
		return 'group-list ' + ( _.result(this, "addClass") || '' );
	},

	initialize: function initialize(options) {
		GroupListView.__super__.initialize.apply(this, arguments);
		this.groups = {};
		this.groupItemsCount = {};
		this.groupOffsets = {};
		this.itemsByGroup = {};
		this.currentStickedHeaderIndex = 0;

		if (options && options.stickyGroup) {
			this.options.stickyGroup = options.stickyGroup;
		}
	},

	getGroupItemViewWithOptions: function getGroupItemViewWithOptions(options) {
		return new GroupListItemView(options);
	},

	getGroupFromModel: function getGroupFromModel(model) {
		return model.cid;
	},

	onAddItem: function onAddItem(item) {
		GroupListView.__super__.onAddItem.apply(this, arguments);
		this.createGroupFromItem(item);
	},

	onRemove: function onRemove(item) {
		var group = this.getGroupFromModel(item.model);
		this.groupItemsCount[group]--;
		if (this.groupItemsCount[group] === 0) {
			this.groups[group].destroy();
		}
	},

	renderItems: function renderItems(collection) {
		this.removeGroups();
		GroupListView.__super__.renderItems.call(this, collection);
	},

	sortItems: function sortItems(collection) {
		var self = this;
		self.removeGroups();

		GroupListView.__super__.sortItems.call(this, collection);

		if (collection instanceof Backbone.Collection)
			collection.each(createGroup);
		else
			_.each(collection, createGroup);

		function createGroup(aModel) {
			item = self.items.findByModel(aModel);
			self.createGroupFromItem(item);
		}
	},

	removeGroups: function removeGroups() {
		var self = this;
		_.each(self.groups, function (aGroupView) {
			delete self.groups[aGroupView.group];
			delete self.groupItemsCount[aGroupView.group];
			aGroupView.destroy();
		});
	},

	createGroupFromItem: function createGroupFromItem(item) {
		if (!item) return;
		var model = item.model;
		var group = this.getGroupFromModel(model);
		if (!(group in this.groups) || this.groups[group] === 0) {
			var ctx = this.getContext();
			var groupView = this.getGroupItemViewWithOptions({
				context: ctx,
				model: model,
				parentList: this,
				group: group
			});
			this.groups[group] = groupView;
			this.groupItemsCount[group] = 0;
			item.$el.before(groupView.el);
			groupView.render();
			this.groupOffsets[group] = groupView.$el.position().top + groupView.$el.scrollTop();
		}
		this.groupItemsCount[group]++;
	},

	stickGroupFromName: function stickGroupFromName(group) {
		if (this.currentStickedGroupView && this.currentStickedGroupView.group == group)
			return;

		if (this.currentStickedGroupView) {
			this.currentStickedGroupView.destroy();
			this.currentStickedGroupView = null;
		}

		if (!group)
			return;

		var groupView = this.groups[group];
		var clonedGroupView = this.currentStickedGroupView = this.getGroupItemViewWithOptions({
			context: this.getContext(),
			model: groupView.model,
			parentList: this,
			group: group
		});

		var offset = this.$el.offset();
		clonedGroupView.$el
			.addClass('sticked')
			.css({
				top:  offset.top,
				left: offset.left,
				width: this.$el.width()
			});
		this.$el.append(clonedGroupView.el);
		clonedGroupView.render();
	},

	onScroll: function onScroll(e) {
		GroupListView.__super__.onScroll.call(this, e);
		if (this.options.stickyGroup) {
			var group = null;
			_.forEach(this.groups, function (aGroup, aGroupName) {
				if (aGroup.$el.position().top <= 0)
					group = aGroupName;
			});
			this.stickGroupFromName(group);
		}
	},

	onDestroy: function onDestroy() {
		_.each(this.groups, function (aGroupView) {
			aGroupView.destroy();
		});
		GroupListView.__super__.onDestroy.call(this);
	}

});
