const i18n = require('./i18n')

const fnKey = '__'

// const trans = quasis => {
//   // Only process TemplateElement
//   const templateStrings = quasis.filter(str => str.type === 'TemplateElement')
//   // Translate
//   ;['raw', 'cooked'].forEach(type => {
//     templateStrings.forEach((node, i) => {
//       node.value[type] = i18n[fnKey](node.value[type])
//     })
//   })
// }

const trans2 = quasi => {
  const quasis = quasi.quasis
  const exps = [].concat(quasi.expressions)
  const exps_new = []

  // get keys for translate
  const todos = []
  quasis.forEach((ele, i) => {
    todos.push(ele.value.cooked)
    if (exps[i]) todos.push(i18n.format(i))
  })
  // Translate
  const todo = todos.join('')
  const translated = i18n[fnKey](todo)
  // split back
  const newKeys = translated.split(/\{\d+\}/)
  // make new order for expressions
  if (!exps_new.length) {
    translated.replace(/([\s\S]*?)\{(\d)\}/g, (m, k, i) => exps_new.push(exps[+i]))
    quasi.expressions = exps_new
  }
  // write back
  quasis.forEach((ele, i) => ele.value.cooked = newKeys[i])
}

module.exports = babel => {
  const t = babel.types
  return {
    visitor: {
      // CallExpression (path) {
      //   const node = path.node
      //   if (!t.isIdentifier(node.callee, { name: fnKey })) return
      //   let quasis
      //   if (t.isTemplateLiteral(node.arguments[0]))
      //     quasis = node.arguments[0].quasis
      //   if (t.isTaggedTemplateExpression(node.arguments[0]))
      //     quasis = node.arguments[0].quasi.quasis
      //   if (quasis) {
      //     trans(quasis)
      //     return path.replaceWith(node.arguments[0])
      //   }
      // },
      TaggedTemplateExpression (path) {
        const node = path.node
        if (t.isIdentifier(node.tag, { name: fnKey })) {
          // trans(node.quasi.quasis)
          trans2(node.quasi)
          return path.replaceWith(node.quasi)
        }
      }
    }
  }
}
