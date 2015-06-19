var _ = require('lodash');
var fs = require('fs');
var glob = require("glob");
var path = require('path');
var async = require('async');
var minify = require('html-minifier').minify;

module.exports = include = function() {
    return this;
};

include.prototype = _.create(include.prototype, {
    compileOne: function(popt) {
        var self = this;

        fs.readFile(popt.from, function(err, content) {
            var options = self._createOptions(popt, {
                content: content.toString()
            });
            var compiled = self.compileContent(options);
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
    compileContent: function(popt) {
        var self = this;
        var options = this._createOptions(popt);

        return options.content.replace(this._getPattern(options.name), function(match, p1) {
            var includeFilePath = self._getIncludePath(options.basePath, p1);
            var value = fs.readFileSync(includeFilePath).toString();

            if(options.minify) {
                value = minify(value, options.minifyOptions);
            }

            if(options.escapeWrap && options.wrap) {
                var wrapPattern = new RegExp('', 'ig');
                value = value.replace(new RegExp(options.wrap, 'ig'), '\\' + options.wrap);
            }

            return options.wrap + value + options.wrap;
        });
    },
    compile: function(popt) {
        var self = this;
        var options = this._createOptions(popt);

        var dirSrc = path.dirname(options.src);
        glob(options.src, function(err, files) {

            async.each(files, function(file, callback) {
                var relativeName = file.replace(dirSrc, '');
                self.compileOne(self._createOptions(options, {
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
    _getPattern: function(name) {
        return new RegExp(name + '\\([\'"]?([^\'\"\\(\\)]+)[\'"]?\\)', 'ig');
    },
    _createOptions: function() {
        var args = [].concat([{
            wrap: '',
            minify: false,
            minifyOptions: {},
            name: 'include',
            basePath: ''
        }], _.map(arguments, function(val) {
            return val;
        }));

        return _.extend.apply(this, args);
    },
    _getIncludePath: function(basePath, path) {
        return basePath + path;
    }
});