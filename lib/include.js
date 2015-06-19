var _ = require('lodash');
var fs = require('fs');
var glob = require("glob");
var path = require('path');
var async = require('async');
var minify = require('html-minifier').minify;

module.exports = include = function(options) {
    this.options = _.extend({
        name: 'include'
    }, options);

    return this;
};

include.prototype = _.create(include.prototype, {
    compileOne: function(options) {
        var self = this;
        fs.readFile(options.from, function(err, content) {
            var compiled = self.compileContent(_.extend({}, options, {
                content: content.toString()
            }));
            var dir = path.dirname(options.to);

            //TODO: make async
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }

            fs.writeFile(options.to, compiled, function(err) {
                if(_.isFunction(options.done)) {
                    options.done(err);
                }
            });
        });
    },
    //TODO: make async
    compileContent: function(options) {
        options = _.extend({
            wrap: '',
            minify: false,
            minifyOptions: {}
        }, options);

        return options.content.replace(this._getPattern(), function(match, p1) {
            var value = fs.readFileSync(p1).toString();

            if(options.minify) {
                value = minify(value, options.minifyOptions);
            }

            return options.wrap + value + options.wrap;
        });
    },
    compile: function(options) {
        var self = this;

        if(!options) {
            options = {};
        }

        options = _.extend({}, this.options, options);

        var dirSrc = path.dirname(options.src);
        glob(options.src, function(err, files) {
            async.each(files, function(file, callback) {
                var relativeName = file.replace(dirSrc, '');
                self.compileOne(_.extend({}, options, {
                    from: file,
                    to: options.dest + relativeName,
                    done: function(err) {
                        callback(err);
                    }
                }));
            }, function(err) {
                if(_.isFunction(options.done)) {
                    options.done(err);
                }
            });
        });
    },
    _getPattern: function() {
        return new RegExp(this.options.name + '\\([\'"]?([^\'\"\\(\\)]+)[\'"]?\\)', 'ig');
    },
    _replace: function(text, value) {
        return text.replace(this._getPattern(), value);
    }
});