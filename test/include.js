/* global beforeEach, describe, context, it */
'use strict';
var Include = require('../lib/include');
var assert = require('assert');
var fs = require('fs');
var glob = require("multi-glob").glob;
var rimraf = require('rimraf');
var path = require('path');

describe('include', function () {

    var includeObj;

    beforeEach(function () {
        includeObj = new Include();
        rimraf.sync('./test/testdata/output');
    });

    it('compiles from text', function (done) {
        var compiled = includeObj.compileContent({
            content: "var me = include('./test/testdata/replacements/val5.js');"
        });
        assert.equal(compiled, "var me = 5;");
        done();
    });

    it('compiles from directory', function (done) {
        rimraf.sync('./test/testdata/output');
        includeObj.compile({
            cwd: './test/testdata/includes/',
            src: '@(t1|t2).js',
            dest: './test/testdata/output/',
            done: function () {
                glob('./test/testdata/output/@(t1|t2).js', function (err, files) {
                    var ctn = {};
                    files.forEach(function (file) {
                        ctn[path.basename(file)] = fs.readFileSync(file).toString();
                    });

                    assert.equal(ctn['t1.js'], "var data = 5;");
                    assert.equal(ctn['t2.js'], "var data1 = 5;\nvar data2 = 6;");

                    done();
                });
            }
        });
    });

    it('wraps valued compiled from text', function (done) {
        var compiled = includeObj.compileContent({
            content: "var me = include('./test/testdata/replacements/val5.js');",
            wrap: '"'
        });
        assert.equal(compiled, 'var me = "5";');
        done();
    });

    it('wraps valued compiled from directory', function (done) {
        includeObj.compile({
            wrap: "'",
            cwd: './test/testdata/includes/',
            src: '@(t1|t2).js',
            dest: './test/testdata/output/',
            done: function () {
                glob('./test/testdata/output/@(t1|t2).js', function (err, files) {
                    var ctn = {};
                    files.forEach(function (file) {
                        ctn[path.basename(file)] = fs.readFileSync(file).toString();
                    });

                    assert.equal(ctn['t1.js'], "var data = '5';");
                    assert.equal(ctn['t2.js'], "var data1 = '5';\nvar data2 = '6';");

                    done();
                });
            }
        });
    });

    it('minifies html from files', function (done) {
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
            cwd: './test/testdata/includes/',
            src: 't3.js',
            dest: './test/testdata/output/',
            done: function () {
                glob('./test/testdata/output/t3.js', function (err, files) {
                    var ctn = {};
                    files.forEach(function (file) {
                        ctn[path.basename(file)] = fs.readFileSync(file).toString();
                    });

                    assert.equal(ctn['t3.js'], 'var html = \'<ul><li class="some name">One</li><li class="">Two</li><li>Three</li><li class=something>Four</li><li class="x y z">Fix</li></ul>\';');

                    done();
                });
            }
        });
    });

    it('allows to redefine method name from text', function (done) {
        var compiled = includeObj.compileContent({
            content: "var me = __injectvalue('./test/testdata/replacements/val5.js');",
            name: '__injectvalue'
        });
        assert.equal(compiled, "var me = 5;");
        done();
    });

    it('allows to redefine method name from directory', function (done) {
        includeObj.compile({
            name: '__s',
            cwd: './test/testdata/includes/',
            src: '@(t4).js',
            dest: './test/testdata/output/',
            done: function () {
                glob('./test/testdata/output/@(t4).js', function (err, files) {
                    var ctn = {};
                    files.forEach(function (file) {
                        ctn[path.basename(file)] = fs.readFileSync(file).toString();
                    });

                    assert.equal(ctn['t4.js'], "var data = 5;");
                    done();
                });
            }
        });
    });

    it('allows to redefine root', function (done) {
        includeObj.compile({
            basePath: './test/testdata/replacements',
            cwd: './test/testdata/includes/',
            src: '@(t7|t8).js',
            dest: './test/testdata/output/',
            done: function () {
                glob('./test/testdata/output/@(t7|t8).js', function (err, files) {
                    var ctn = {};
                    files.forEach(function (file) {
                        ctn[path.basename(file)] = fs.readFileSync(file).toString();
                    });

                    assert.equal(ctn['t7.js'], "var data = 5;");
                    assert.equal(ctn['t8.js'], "var data1 = 5;\nvar data2 = 6;");

                    done();
                });
            }
        });
    });

    it('allows to redefine method name from directory and use html-minifier, and change root', function (done) {
        includeObj.compile({
            wrap: "'",
            basePath: './test/testdata/replacements',
            escapeWrap: true,
            name: '__injectTemplate',
            cwd: './test/testdata/includes/',
            src: '@(t5|t6).js',
            dest: './test/testdata/output/',
            minify: true,
            minifyOptions: {
                removeComments: true,
                collapseWhitespace: true,
                removeCommentsFromCDATA: true,
                removeCDATASectionsFromCDATA: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true
            },
            done: function () {
                glob('./test/testdata/output/@(t5|t6).js', function (err, files) {
                    var ctn = {};
                    files.forEach(function (file) {
                        ctn[path.basename(file)] = fs.readFileSync(file).toString();
                    });

                    assert.equal(ctn['t5.js'], 'var html = \'<ul><li class="some name">One</li><li class="">Two</li><li>Three</li><li class=something>Four</li><li class="x y z">Fix</li></ul>\';');
                    assert.equal(ctn['t6.js'], 'var html = \'<div id=main-body ui-view=app><div id=main-loading><span class=fa-browser-ok><span class=loader fa-display-fade=AppState.isLoading()></span><ul class="loader-anim lt-ie10"><li></li><li></li><li></li><li></li><li></li></ul></span><h1>FollowAnalytics</h1><h2><span class=fa-browser-error>Unfortunately, FollowAnalytics is not compatible with Internet Explorer 9 and lower. Please upgrade your browser or use another one.</span> <span class=fa-browser-ok ng-cloak>{{AppState.getText()}}</span></h2></div></div><script src=/bower_components/modernizr/modernizr.js></script><script>alert(\\\'123\\\');</script>\';');
                    done();
                });
            }
        });
    });

    it('compiles from directory with multiple src', function (done) {
        includeObj.compile({
            cwd: './test/testdata/includes/',
            src: ['t1.js', 't2.js'],
            dest: './test/testdata/output/',
            done: function () {
                glob('./test/testdata/output/@(t1|t2).js', function (err, files) {
                    var ctn = {};
                    files.forEach(function (file) {
                        ctn[path.basename(file)] = fs.readFileSync(file).toString();
                    });

                    assert.equal(ctn['t1.js'], "var data = 5;");
                    assert.equal(ctn['t2.js'], "var data1 = 5;\nvar data2 = 6;");

                    done();
                });
            }
        });
    });

    it('saves relative path to the file', function (done) {
        includeObj.compile({
            wrap: "'",
            cwd: './test/testdata/includes/',
            basePath: './test/testdata/replacements',
            src: '**/here.js',
            dest: './test/testdata/output/',
            minify: true,
            minifyOptions: {
                removeComments: true,
                collapseWhitespace: true,
                removeCommentsFromCDATA: true,
                removeCDATASectionsFromCDATA: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true
            },
            done: function () {
                assert.equal(fs.existsSync('./test/testdata/output/foo/bar/here.js'), true);
                done();
            }
        });
    });

    it('doesn\'t save file without method', function (done) {
        includeObj.compile({
            wrap: "'",
            cwd: './test/testdata/includes/',
            basePath: './test/testdata/replacements',
            src: '**/nomethod.js',
            dest: './test/testdata/output/',
            minify: true,
            minifyOptions: {
                removeComments: true,
                collapseWhitespace: true,
                removeCommentsFromCDATA: true,
                removeCDATASectionsFromCDATA: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true
            },
            done: function () {
                assert.equal(fs.existsSync('./test/testdata/output/nomethod.js'), false);
                done();
            }
        });
    });

    it('save without method if filterNoMethod set to false', function (done) {
        includeObj.compile({
            wrap: "'",
            cwd: './test/testdata/includes/',
            basePath: './test/testdata/replacements',
            src: '**/nomethod.js',
            dest: './test/testdata/output/',
            minify: true,
            filterNoMethod: false,
            minifyOptions: {
                removeComments: true,
                collapseWhitespace: true,
                removeCommentsFromCDATA: true,
                removeCDATASectionsFromCDATA: true,
                removeAttributeQuotes: true,
                removeRedundantAttributes: true
            },
            done: function () {
                assert.equal(fs.existsSync('./test/testdata/output/nomethod.js'), true);
                done();
            }
        });
    });

});