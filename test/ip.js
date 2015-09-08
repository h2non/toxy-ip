const expect = require('chai').expect
const ip = require('..')

suite('ip', function () {
  test('address', function () {
    var req = requestStub('127.0.0.1')
    ip({ address: '127.0.0.1' })(req, null, assert(false))
  })

  test('cannot match address', function () {
    var req = requestStub('1.1.1.1')
    ip({ address: '127.0.0.1' })(req, null, assert(true))
  })

  test('cidr address', function () {
    var req = requestStub('127.0.0.1')
    ip({ address: '127.0.0.1' })(req, null, assert(false))
  })

  test('public address', function () {
    var req = requestStub('8.8.8.8')
    ip({ publicAddress: true })(req, null, assert(false))
  })

  test('private address', function () {
    var req = requestStub('192.168.0.100')
    ip({ privateAddress: true })(req, null, assert(false))
  })

  test('loopback', function () {
    var req = requestStub('127.0.0.1')
    ip({ loopback: true })(req, null, assert(false))

    var req = requestStub('::1')
    ip({ loopback: true })(req, null, assert(false))
  })

  test('network', function () {
    var req = requestStub('192.168.0.100')
    ip('192.168.0.0/24')(req, null, assert(false))
  })

  test('multiple networks', function () {
    var req = requestStub('172.12.1.10')
    ip([ '192.168.0.0/24', '172.12.0.0/20' ])(req, null, assert(false))
  })

  test('outside of the subnet', function () {
    var req = requestStub('172.12.0.100')
    ip([ '172.12.0.0/27' ])(req, null, assert(true))
  })

  test('range', function () {
    var req = requestStub('192.168.0.19')
    ip({ range: [ '192.168.0.10', '192.168.0.20' ] })(req, null, assert(false))

    var req = requestStub('192.168.0.21')
    ip({ range: [ '192.168.0.10', '192.168.0.20' ] })(req, null, assert(true))

    var req = requestStub('192.168.1.10')
    ip({ range: [ '192.168.0.10', '192.168.0.20' ] })(req, null, assert(true))
  })
})

function assert(value) {
  return function (err, ignore) {
    expect(err).to.be.null
    expect(ignore).to.be.equal(value)
  }
}

function requestStub(addr, headers) {
  return {
    headers: headers || {},
    connection: { remoteAddress: addr }
  }
}
