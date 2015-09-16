const toxy = require('toxy')
const ip = require('.')

const proxy = toxy()

proxy.forward('http://httpbin.org')

proxy
  .all('/headers')
  .poison(toxy.poisons.abort())
  .withRule(ip({ loopback: true }))

proxy
  .all('/ip')
  .poison(toxy.poisons.abort())
  .withRule(ip('10.0.0.0/16'))

proxy.all('/*')

proxy.listen(3000)
console.log('Proxy server listening on port:', 3000)
