# Template String I18n

I18n using template strings with auto save/load translate documents.
Inspired by [jaysoo.ca](https://jaysoo.ca/2014/03/20/i18n-with-es2015-template-literals/).

## Installation

```bash
yarn add template-string-i18n --dev
# or
npm i template-string-i18n --save-dev
```

## Example

__myproject/locales/en_US.json__

```json
{ "Hi {0}": "Hello {0}" }
```

__myproject/app.js__

```javascript
let foo = 'bar'
__`Hi ${foo}`
// >> Hello bar
```

__myproject/tmpl.pug__

```pug
h1= __`Hi ${foo}`
//- >> <h1>Hello bar</h1>
```

## Usage

### for Babel & Eslint

__.babelrc__
```
{
  ...
  "plugins": ["transform-runtime", "template-string-i18n"]
}
```

__.eslintrc.js__
```javascript
module.exports = {
  ...
  globals: { __: false }
}
```

### for Pug

```javascript
const pug = require('pug')
console.log(pug.renderFile('tmpl.pug', { __: i18n.__ }))
```

### for vue-loader

```javascript
var i18n = require('template-string-i18n/lib/i18n')
...
module.exports = {
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: {
          loaders: ...,
          // for pugjs
          template: {
            __: i18n.__
          }
        }
      }
    ]
  }
}
```
