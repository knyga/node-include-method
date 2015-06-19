/* global beforeEach, describe, context, it */
'use strict';
var Include = require('../lib/include');
var assert = require('assert');
var fs = require('fs');
var glob = require('glob');
var rimraf = require('rimraf');
var path = require('path');

describe('include', function () {

    var includeObj;

    beforeEach(function() {
        includeObj = new Include();
    });

    it('compiles from text', function(done) {
        var compiled = includeObj.compileContent({
            content: "var me = include('./test/testdata/replacements/val5.js');"
        });
        assert.equal(compiled, "var me = 5;");
        done();
    });

    it('compiles from directory', function(done) {
        rimraf.sync('./test/testdata/output');
        includeObj.compile({
            src: './test/testdata/includes/@(t1|t2).js',
            dest: './test/testdata/output',
            done: function() {
                glob('./test/testdata/output/@(t1|t2).js', function(err, files) {
                    var ctn = {};
                    files.forEach(function(file) {
                        ctn[path.basename(file)] = fs.readFileSync(file).toString();
                    });

                    assert.equal(ctn['t1.js'], "var data = 5;");
                    assert.equal(ctn['t2.js'], "var data1 = 5;\nvar data2 = 6;");

                    done();
                });
            }
        });
    });

    it('wraps valued compiled from text', function(done) {
        var compiled = includeObj.compileContent({
            content: "var me = include('./test/testdata/replacements/val5.js');",
            wrap: '"'
        });
        assert.equal(compiled, 'var me = "5";');
        done();
    });

    it('wraps valued compiled from directory', function(done) {
        rimraf.sync('./test/testdata/output');
        includeObj.compile({
            wrap: "'",
            src: './test/testdata/includes/@(t1|t2).js',
            dest: './test/testdata/output',
            done: function() {
                glob('./test/testdata/output/@(t1|t2).js', function(err, files) {
                    var ctn = {};
                    files.forEach(function(file) {
                        ctn[path.basename(file)] = fs.readFileSync(file).toString();
                    });

                    assert.equal(ctn['t1.js'], "var data = '5';");
                    assert.equal(ctn['t2.js'], "var data1 = '5';\nvar data2 = '6';");

                    done();
                });
            }
        });
    });

    it('minifies html from files', function(done) {
        rimraf.sync('./test/testdata/output');
        includeObj.compile({
            wrap: "'",
            minify: true,
            minifyOptions: {
                removeComments: true,
                collapseWhitespace: true,
                removeCommentsFromCDATA: true,
                removeCDATASectionsFromCDATA: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true
            },
            src: './test/testdata/includes/t3.js',
            dest: './test/testdata/output',
            done: function() {
                glob('./test/testdata/output/t3.js', function(err, files) {
                    var ctn = {};
                    files.forEach(function(file) {
                        ctn[path.basename(file)] = fs.readFileSync(file).toString();
                    });

                    assert.equal(ctn['t3.js'], 'var html = \'<ul><li class="some name">One</li><li class="">Two</li><li>Three</li><li class=something>Four</li><li class="x y z">Fix</li></ul>\';');

                    done();
                });
            }
        });
    });

    it('allows to redefine method name from text', function(done) {
        var compiled = includeObj.compileContent({
            content: "var me = __injectvalue('./test/testdata/replacements/val5.js');",
            name: '__injectvalue'
        });
        assert.equal(compiled, "var me = 5;");
        done();
    });

    //it('allows to redefine value path', function(done) {
    //
    //});
});