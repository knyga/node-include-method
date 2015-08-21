# Node include method

Configurable tool to include your dependencies in the place they needed on the compilation step.

## Known use cases
1. With node include method you can split your html templates on multiple parts and build them during the compilation step.
2. You can include all html templates to your js files in the simple way. Just write ```includeTemplate(PATH_TO_FILE)``` and tool will add it.
3. Include SVG files inside html templates, css...
4. Include images inside templates, css...
5. Build js files.
6. Move JSX templates to separate files and add them on the compilation step.

## How to use

### Examples

#### Tests
See our tests to get more use cases.

#### Simple example of files processing from directory and maping compiled versions of them to new directory

Example of input file:

```js
var data = include('./test/testdata/replacements/val5.js');
```

And val5.js
```
5
```

Code:
```javascript
var Include = require('../lib/include');
var includeObj = new Include();

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
```

Output for example file:
```
var data = 5;
```

#### Examples from grunt-include-method
See examples from [grunt-include-method](https://github.com/knyga/grunt-include-method/tree/master/examples/html).

### Options

#### cwd
Type: `String`

Path to the sources.

#### src
Type: `Array`

Patterns for sources. See [node-glob](https://github.com/isaacs/node-glob).

#### dest
Type: `String`

Path to destination.

#### done
Type: `Function`

Will be called when compilation is finished.

#### wrap
Type: `String`

Wrapper for including value. May be used to add brakets when inject html template in js file.

#### minify
Type: `Boolean`

If true then content will be minified.

#### minifyOptions
Type: `Object`

Parameters for minification. See [html-minifier](https://github.com/kangax/html-minifier).

#### basePath
Type: `String`

Path for required files.

#### escapeWrap
Type: `Boolean`

Default: `false`

If true then wrapper characher will be escaped in included string.

#### filterNoMethod
Type: `Boolean`

Default: `false`

If true then files without include method will be ignored.

#### isBase64
Type: `Boolean`

Default: `false`

If true then output will be converted to base64. May be used to include images and svg files.

#### name
Type: `String`

Default: `include`

Name of inclusion method. May be redifined to avoid conflicts with existing methods.

###Licence
node include method

Copyright (C) 2015  Oleksandr Knyga, oleksandrknyga@gmail.com

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
