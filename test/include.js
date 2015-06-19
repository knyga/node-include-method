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

    it('finds method usage in text', function(done) {
        var compiled = includeObj._replace("var me = include('./test/testdata/replacements/val5.js');", "5");
        assert.equal(compiled, "var me = 5;");
        done();
    });

    it('doesn\'t find method usage in text without method', function(done) {
        var compiled = includeObj._replace("var me = in_cl_ude('./test/testdata/replacements/val5.js');", "5");
        assert.notEqual(compiled, "var me = 5;");
        done();
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
            src: './test/testdata/includes/*.js',
            dest: './test/testdata/output',
            done: function() {
                glob('./test/testdata/output/*.js', function(err, files) {
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

    //it('minifies html', function(done) {
    //
    //});
    //
    //it('allows to redefine method name', function(done) {
    //
    //});
    //
    //it('allows to redefine value path', function(done) {
    //
    //});
});