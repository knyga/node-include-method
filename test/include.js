/* global beforeEach, describe, context, it */
'use strict';
var include = require('../lib/include');
var assert = require('assert');

describe('include', function () {

    var includeObj;

    beforeEach(function() {
        includeObj = new include;
    });

    it('finds method usage in text', function(done) {
        var compiled = includeObj._replace("var me5 = include('./testdata/finds-method-usage-in-file/val5');", "5");
        assert.equal(compiled, "var me5 = 5;");
        done();
    });

    //it('doesn\'t find method usage in text without method', function(done) {
    //
    //});
    //
    //it('finds files with method usage in directory', function(done) {
    //
    //});
    //
    //it('replaces include method with given value', function(done) {
    //
    //});
    //
    //it('replaces multiple include method with given values', function(done) {
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