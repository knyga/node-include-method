var _ = require('lodash');
var fs = require('fs');
var glob = require("multi-glob").glob;
var path = require('path');
var async = require('async');
var minify = require('html-minifier').minify;
var mkdirp = require('mkdirp');
var crypto = require('crypto');

module.exports = include = function () {
    return this;
};

include.prototype = _.create(include.prototype, {
    compileOne: function (popt) {
        var self = this;


        fs.readFile(popt.from, function (err, content) {
            var options = self._createOptions(popt, {
                content: content.toString()
            });
            var compiled = self.compileContent(options);
            var dir = path.dirname(options.to);

            if (options.filterNoMethod &&
                crypto.createHash('sha256').update(compiled).digest('base64') ===
                crypto.createHash('sha256').update(content).digest('base64')) {
                options.done("No method");
                return;
            }

            //TODO: make async
            if (!fs.existsSync(dir)) {
                mkdirp.sync(dir);
            }

            fs.writeFile(options.to, compiled, function (err) {
                if (_.isFunction(options.done)) {
                    options.done(err);
                }

                log(options.log, 'File "' + options.to + '" created."');
            });
        });
    },
    //TODO: make async
    compileContent: function (popt) {
        var self = this;
        var options = this._createOptions(popt);


        return options.content.replace(this._getPattern(options.name), function (match, p1) {
            var includeFilePath = self._getIncludePath(options.basePath, p1);

            var value = fs.readFileSync(includeFilePath).toString();

            if(options.replaceRules && options.replaceRules.length > 0) {

                for(var i = 0; i < options.replaceRules.length; i++) {
                    value = value.replace(new RegExp(options.replaceRules[i].pattern, "gi"), options.replaceRules[i].replacement);
                }
            }

            if (options.minify) {
                value = minify(value, options.minifyOptions);
                value = value.replace(/\n/g, '');
            }

            if (options.escapeWrap && options.wrap) {
                var wrapPattern = new RegExp('', 'ig');
                value = value.replace(new RegExp(options.wrap, 'ig'), '\\' + options.wrap);
                value = value.replace(/\\\\/g, '\\\\\\');
            }

            if(options.isBase64) {
                value = new Buffer(value).toString('base64');
            }

            return options.wrap + value + options.wrap;
        });
    },
    compile: function (popt) {
        var globPath;
        var self = this;
        var options = this._createOptions(popt);

        if (_.isString(options.src)) {
            globPath = options.cwd + options.src;
        } else {
            globPath = options.src.map(function (el) {
                return options.cwd + el;
            });
        }

        glob(globPath, function (err, files) {
            async.each(files, function (file, callback) {
                var destinationPath = file.replace(options.cwd, options.dest);

                self.compileOne(self._createOptions(options, {
                    from: file,
                    to: destinationPath,
                    done: function (err) {
                        callback(err);
                    }
                }));
            }, function (err) {
                if (_.isFunction(options.done)) {
                    options.done(err);
                }
            });
        });
    },
    _getPattern: function (name) {
        return new RegExp(name + '\\([\'"]?([^\'\"\\(\\)]+)[\'"]?\\)', 'ig');
    },
    _createOptions: function () {
        var args = [].concat([{
            wrap: '',
            minify: false,
            minifyOptions: {},
            name: 'include',
            basePath: '',
            filterNoMethod: true,
            log: false
        }], _.map(arguments, function (val) {
            return val;
        }));

        return _.extend.apply(this, args);
    },
    _getIncludePath: function (basePath, path) {
        if ((/^\//).test(path)) {
            return basePath + path;
        }

        return path;
    }
});


function log(isLog, message) {
    if(isLog) {
        console.log(message);
    }
}