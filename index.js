const ip = require('ip')

exports = module.exports = function ip(opts) {
  opts = normalizeOpts(opts)

  var range = opts.range
  var network = opts.network
  var address = opts.address

  return function ip(req, res, next) {
    var clientIP = getIP(req)

    if (!clientIP) {
      return next(null)
    }

    if (address) {
      return next(null, !isEqual(address, clientIP))
    }

    if (Array.isArray(range)) {
      return next(null, !evalRange(range, clientIP))
    }

    if (Array.isArray(network)) {
      return next(null, !evalNetwork(network, clientIP))
    }

    next(null, !evalType(opts, clientIP))
  }
}

function evalRange(range, clientIP) {
  var head = ip.toLong(range[0])
  var tail = ip.toLong(range[1])
  var curr = ip.toLong(clientIP)

  return curr >= head
      && curr <= tail
}

function evalNetwork(network, clientIP) {
  return network
  .map(function (addr) {
    return ~addr.indexOf('/') ? addr : addr + '/32'
  })
  .map(ip.cidrSubnet)
  .map(function (addr) {
    return [
      addr.firstAddress,
      addr.lastAddress
    ]
  })
  .some(function (pair) {
    return evalRange(pair, clientIP)
  })
}

function evalType(opts, clientIP) {
  if (opts.privateAddress) {
    return ip.isPrivate(clientIP)
  }
  if (opts.publicAddress) {
    return ip.isPublic(clientIP)
  }
  if (opts.loopback) {
    return ip.isLoopback(clientIP)
  }
  return false
}

function isEqual(addr, clientIP) {
  if (~addr.indexOf('/')) {
    return evalNetwork([ addr ], clientIP)
  }
  return ip.isEqual(addr, clientIP)
}

function getIP(req) {
  return req.headers['x-forwarded-for']
      || req.connection.remoteAddress
}

function normalizeOpts(opts) {
  if (!opts) {
    throw new TypeError('Invalid middleware options')
  }

  if (typeof opts === 'string') {
    opts = { network: [ opts ] }
  }
  else if (typeof opts.network === 'string') {
    opts.network = [ opts.network ]
  }
  else if (Array.isArray(opts)) {
    opts = { network: opts }
  }

  return opts
}

/**
 * Export additional API methods
 */

exports.ip = ip
exports.evalRange = evalRange
exports.evalNetwork = evalNetwork
exports.evalType = evalType
exports.isEqual = isEqual
