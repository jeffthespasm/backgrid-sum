(function (window) {
  var SummationUtility = {
    columnsToSum: [],
    multiplier: null,

    getColumnsToSum: function () {
      var columns = this.columns.without(this.columns.findWhere({ name: this.multiplier }));
      if (_(this.columnsToSum).isEmpty() === false) {
        columns = columns.filter(function (column) {
          return this.columnsToSum.indexOf(column.get('name')) !== -1;
        }, this);
      }
      return columns;
    },

    getSum: function () {
      return _(this.getColumnsToSum()).reduce(_(this.addColumnValue).bind(this), 0);
    },

    addColumnValue: function (memo, column) {
      var value = this.model.get(column.get('name'));
      var multiplier = 1;

      if (this.multiplier) {
        if (isNaN(parseFloat(this.multiplier))) {
          multiplier = this.model.get(this.getColumnByName(this.multiplier).get('name'));
        } else {
          multiplier = parseFloat(this.multiplier);
        }
      }

      return memo + (parseFloat(value) * multiplier);
    }
  };

  var SummedRow = window.Backgrid.SummedRow = window.Backgrid.Row.extend({
    render: function () {
      this.$el.empty();

      var fragment = document.createDocumentFragment();
      _(this.cells).each(function (cell) {
        fragment.appendChild(cell.render().el);
      });
      fragment.appendChild(this.getSumCell().render().el);

      this.el.appendChild(fragment);
      this.delegateEvents();
      return this;
    },

    getColumnByName: function (name) {
      return this.columns.findWhere({ name: name });
    },

    getSumCell: function () {
      var _this = this;
      return new (
        Backgrid.Cell.extend({
          initialize: function () { },
          render: function () {
            this.$el.html(_this.getSum());
            return this;
          }
        })
      );
    }
  });

  var SummedColumnBody = window.Backgrid.SummedColumnBody = window.Backgrid.Body.extend({
    render: function () {
      window.Backgrid.Body.prototype.render.apply(this, arguments); 
      this.el.appendChild(this.getSumRow().render().el);
      return this;
    },

    getSumRow: function () {
      var _this = this;
      return new (
        Backbone.View.extend({
          tagName: 'tr',
          render: function () {
            _(_this.getColumnsToSum()).each(function (column) {
              var values = _this.collection.pluck(column.get('name'));
              var sum = _.reduce(values, function (memo, num) {
                return memo + parseFloat(num);
              }, 0);
              _this.$el.append('<td>' + sum + '</td>');
            });

            return this;
          }
        })
      );
    }
  });

  _(SummedRow.prototype).extend(SummationUtility);
  _(SummedColumnBody.prototype).extend(SummationUtility);
})(window);
