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

    it('convert content to base64 is isBase64 is set to true', function(done) {
        var content = "<img src=\"data:image/svg+xml;base64,include('./test/testdata/replacements/kiwi.svg')\">";
        var base64content = "<img src=\"data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIGlkPSJMYXllcl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIgd2lkdGg9IjYxMnB4IiBoZWlnaHQ9IjUwMi4xNzRweCIgdmlld0JveD0iMCA2NS4zMjYgNjEyIDUwMi4xNzQiIGVuYWJsZS1iYWNrZ3JvdW5kPSJuZXcgMCA2NS4zMjYgNjEyIDUwMi4xNzQiIHhtbDpzcGFjZT0icHJlc2VydmUiIGNsYXNzPSJsb2dvIj4KPGVsbGlwc2UgY2xhc3M9Imdyb3VuZCIgY3g9IjI4My41IiBjeT0iNDg3LjUiIHJ4PSIyNTkiIHJ5PSI4MCI+PC9lbGxpcHNlPgo8cGF0aCBjbGFzcz0ia2l3aSIgZD0iTTIxMC4zMzMsNjUuMzMxQzEwNC4zNjcsNjYuMTA1LTEyLjM0OSwxNTAuNjM3LDEuMDU2LDI3Ni40NDljNC4zMDMsNDAuMzkzLDE4LjUzMyw2My43MDQsNTIuMTcxLDc5LjAzCiAgYzM2LjMwNywxNi41NDQsNTcuMDIyLDU0LjU1Niw1MC40MDYsMTEyLjk1NGMtOS45MzUsNC44OC0xNy40MDUsMTEuMDMxLTE5LjEzMiwyMC4wMTVjNy41MzEtMC4xNywxNC45NDMtMC4zMTIsMjIuNTksNC4zNDEKICBjMjAuMzMzLDEyLjM3NSwzMS4yOTYsMjcuMzYzLDQyLjk3OSw1MS43MmMxLjcxNCwzLjU3Miw4LjE5MiwyLjg0OSw4LjMxMi0zLjA3OGMwLjE3LTguNDY3LTEuODU2LTE3LjQ1NC01LjIyNi0yNi45MzMKICBjLTIuOTU1LTguMzEzLDMuMDU5LTcuOTg1LDYuOTE3LTYuMTA2YzYuMzk5LDMuMTE1LDE2LjMzNCw5LjQzLDMwLjM5LDEzLjA5OGM1LjM5MiwxLjQwNyw1Ljk5NS0zLjg3Nyw1LjIyNC02Ljk5MQogIGMtMS44NjQtNy41MjItMTEuMDA5LTEwLjg2Mi0yNC41MTktMTkuMjI5Yy00LjgyLTIuOTg0LTAuOTI3LTkuNzM2LDUuMTY4LTguMzUxbDIwLjIzNCwyLjQxNWMzLjM1OSwwLjc2Myw0LjU1NS02LjExNCwwLjg4Mi03Ljg3NQogIGMtMTQuMTk4LTYuODA0LTI4Ljg5Ny0xMC4wOTgtNTMuODY0LTcuNzk5Yy0xMS42MTctMjkuMjY1LTI5LjgxMS02MS42MTctMTUuNjc0LTgxLjY4MWMxMi42MzktMTcuOTM4LDMxLjIxNi0yMC43NCwzOS4xNDcsNDMuNDg5CiAgYy01LjAwMiwzLjEwNy0xMS4yMTUsNS4wMzEtMTEuMzMyLDEzLjAyNGM3LjIwMS0yLjg0NSwxMS4yMDctMS4zOTksMTQuNzkxLDBjMTcuOTEyLDYuOTk4LDM1LjQ2MiwyMS44MjYsNTIuOTgyLDM3LjMwOQogIGMzLjczOSwzLjMwMyw4LjQxMy0xLjcxOCw2Ljk5MS02LjAzNGMtMi4xMzgtNi40OTQtOC4wNTMtMTAuNjU5LTE0Ljc5MS0yMC4wMTZjLTMuMjM5LTQuNDk1LDUuMDMtNy4wNDUsMTAuODg2LTYuODc2CiAgYzEzLjg0OSwwLjM5NiwyMi44ODYsOC4yNjgsMzUuMTc3LDExLjIxOGM0LjQ4MywxLjA3Niw5Ljc0MS0xLjk2NCw2LjkxNy02LjkxN2MtMy40NzItNi4wODUtMTMuMDE1LTkuMTI0LTE5LjE4LTEzLjQxMwogIGMtNC4zNTctMy4wMjktMy4wMjUtNy4xMzIsMi42OTctNi42MDJjMy45MDUsMC4zNjEsOC40NzgsMi4yNzEsMTMuOTA4LDEuNzY3YzkuOTQ2LTAuOTI1LDcuNzE3LTcuMTY5LTAuODgzLTkuNTY2CiAgYy0xOS4wMzYtNS4zMDQtMzkuODkxLTYuMzExLTYxLjY2NS01LjIyNWMtNDMuODM3LTguMzU4LTMxLjU1NC04NC44ODcsMC05MC4zNjNjMjkuNTcxLTUuMTMyLDYyLjk2Ni0xMy4zMzksOTkuOTI4LTMyLjE1NgogIGMzMi42NjgtNS40MjksNjQuODM1LTEyLjQ0Niw5Mi45MzktMzMuODVjNDguMTA2LTE0LjQ2OSwxMTEuOTAzLDE2LjExMywyMDQuMjQxLDE0OS42OTVjMy45MjYsNS42ODEsMTUuODE5LDkuOTQsOS41MjQtNi4zNTEKICBjLTE1Ljg5My00MS4xMjUtNjguMTc2LTkzLjMyOC05Mi4xMy0xMzIuMDg1Yy0yNC41ODEtMzkuNzc0LTE0LjM0LTYxLjI0My0zOS45NTctOTEuMjQ3CiAgYy0yMS4zMjYtMjQuOTc4LTQ3LjUwMi0yNS44MDMtNzcuMzM5LTE3LjM2NWMtMjMuNDYxLDYuNjM0LTM5LjIzNC03LjExNy01Mi45OC0zMS4yNzNDMzE4LjQyLDg3LjUyNSwyNjUuODM4LDY0LjkyNywyMTAuMzMzLDY1LjMzMQogIHogTTQ0NS43MzEsMjAzLjAxYzYuMTIsMCwxMS4xMTIsNC45MTksMTEuMTEyLDExLjAzOGMwLDYuMTE5LTQuOTk0LDExLjExMS0xMS4xMTIsMTEuMTExcy0xMS4wMzgtNC45OTQtMTEuMDM4LTExLjExMQogIEM0MzQuNjkzLDIwNy45MjksNDM5LjYxMywyMDMuMDEsNDQ1LjczMSwyMDMuMDF6Ij48L3BhdGg+CjxmaWx0ZXIgaWQ9InBpY3R1cmVGaWx0ZXIiPgogIDxmZUdhdXNzaWFuQmx1ciBzdGREZXZpYXRpb249IjE1Ij48L2ZlR2F1c3NpYW5CbHVyPgo8L2ZpbHRlcj4KPC9zdmc+\">";

        var compiled = includeObj.compileContent({
            isBase64: true,
            content: content
        });

        assert.equal(compiled, base64content);

        done();
    });

});