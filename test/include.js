/* global beforeEach, describe, context, it */
'use strict';
var include = require('../lib/include');
var assert = require('assert');
var fs = require('fs');
var glob = require('glob');
var rimraf = require('rimraf');

describe('include', function () {

    var includeObj;

    beforeEach(function() {
        includeObj = new include;
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

    it('replacements values from file', function(done) {
        var compiled = includeObj.compileContent({
            content: "var me = include('./test/testdata/replacements/val5.js');"
        });
        assert.equal(compiled, "var me = 5;");
        done();
    });

    it('finds files includes method usage in directory', function(done) {
        rimraf.sync('./test/testdata/output');
        includeObj.compile({
            src: './test/testdata/includes/*.js',
            dest: './test/testdata/output'
        });
        done();
    });

    it('creates files in output directory', function(done) {
        rimraf.sync('./test/testdata/output');
        includeObj.compile({
            src: './test/testdata/includes/*.js',
            dest: './test/testdata/output',
            done: function() {
                done();
            }
        });
    });

    //it('replacements include method includes given value', function(done) {
    //
    //});
    //
    //it('replacements multiple include method includes given values', function(done) {
    //
    //});
    //
    //it('wraps value', function(done) {
    //
    //});
    //
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