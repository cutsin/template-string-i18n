const i18n = require('./i18n')

const fnKey = '__'

const trans = quasis => {
  // Only process TemplateElement
  const templateStrings = quasis.filter(str => str.type === 'TemplateElement')
  // Translate
  ;['raw', 'cooked'].forEach(type => {
    templateStrings.forEach(str => {
      str.value[type] = i18n[fnKey](str.value[type])
    })
  })
}

module.exports = babel => {
  const t = babel.types
  return {
    visitor: {
      CallExpression (path) {
        const node = path.node
        if (!t.isIdentifier(node.callee, { name: fnKey })) return
        let quasis
        if (t.isTemplateLiteral(node.arguments[0]))
          quasis = node.arguments[0].quasis
        if (t.isTaggedTemplateExpression(node.arguments[0]))
          quasis = node.arguments[0].quasi.quasis
        if (quasis) {
          trans(quasis)
          return path.replaceWith(node.arguments[0])
        }
      },
      TaggedTemplateExpression (path) {
        const node = path.node
        if (t.isIdentifier(node.tag, { name: fnKey })) {
          trans(node.quasi.quasis)
          return path.replaceWith(node.quasi)
        }
      }
    }
  }
}
