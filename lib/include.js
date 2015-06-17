var _ = require('lodash');

module.exports = include = function(options) {
    this.options = _.extend({
        name: 'include'
    }, options);

    return this.compile();
};

include.prototype = _.create(include.prototype, {
    compile: function() {
        var pattern = new RegExp(this.options.name , 'ig');
    },
    _getPattern: function() {
        return new RegExp(this.options.name + '\\([\'"]?([^\\(\\)]+)[\'"]?\\)', 'ig');
    },
    _replace: function(text, value) {
        return text.replace(this._getPattern(), value);
    }
});