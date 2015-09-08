# toxy-ip [![Build Status](https://api.travis-ci.org/h2non/toxy-ip.svg?branch=master&style=flat)](https://travis-ci.org/h2non/toxy-ip) [![NPM](https://img.shields.io/npm/v/toxy-ip.svg)](https://www.npmjs.org/package/toxy-ip)

[`toxy`](https://github.com/h2non/toxy) rule to filter by IP `v4`/`v6` addresses, supporting [CIDR](https://en.wikipedia.org/wiki/Classless_Inter-Domain_Routing), subnets and custom/public/reserved IP ranges.

<table>
<tr>
<td><b>toxy</b></td><td>+0.3</td>
</tr>
<tr>
<td><b>Name</b></td><td>ip</td>
</tr>
<tr>
<td><b>Poison Phase</b></td><td>incoming / outgoing</td>
</tr>
</table>

## Installation

```bash
npm install toxy-ip [--save]
```

## Usage

```js
const toxy = require('toxy')
const ip = require('toxy-ip')

const proxy = toxy()

proxy
  .all('/')
  .poison(toxy.poisons.slowRead({ delay: 1000 }))
  .withRule(ip('192.168.0.0/24'))

proxy
  .all('/download')
  .poison(toxy.poisons.bandwidth({ bps: 1024 }))
  .withRule(ip('10.0.0.0/20'))

proxy
  .all('/intranet')
  .poison(toxy.poisons.bandwidth({ bps: 1024 }))
  .withRule(ip([ '192.168.0.0/24', '172.12.0.0/22', '10.0.0.0/12' ]))

proxy
  .all('/custom-range')
  .poison(toxy.poisons.bandwidth({ bps: 1024 }))
  .withRule(ip({ range: [ '192.168.0.10', '192.168.0.25' ] }))

proxy
  .all('/private')
  .poison(toxy.poisons.bandwidth({ bps: 1024 }))
  .withRule(ip({ privateAddress: true }))

proxy
  .all('/local')
  .poison(toxy.poisons.inject({ code: 500 }))
  .withRule(ip({ loopback: true }))

proxy.listen(3000)
```

## API

```js
const ip = require('toxy-ip')
```

### ip(opts) => `function (req, res, next)`

**Available options**:

- **address** `string` - Matches an IP address using a equality comparison. Supports CIDR expressions for ranges.
- **network** `string|array` - List of CIDR addresses to filter. Array can contain multiple CIDR addresses.
- **range** `array` - Pair of IP range to match.
- **privateAddress** `boolean` - Matches if the client address is a [reserved private range](https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces). Default `false`
- **publicAddress** `boolean` - Matches if the client address is a [non-reserved IP range](https://en.wikipedia.org/wiki/Private_network#Private_IPv4_address_spaces). Default `false`
- **loopback** `boolean` - Matches if the client address is a [loopback valid address](https://en.wikipedia.org/wiki/Localhost). Default `false`

### ip.evalRange(range, ip) => `boolean`

Evaluates if the IP is inside the given range.
`range` must be an `array` with two items representing the IP range.

### ip.evalNetwork(networks, ip) => `boolean`

Evaluates if the IP is inside a

### ip.evalType(opts, ip) => `boolean`

Evaluates if the IP is public, private or loopback IP address.

### ip.ip

Exposes [`node-ip`](https://github.com/indutny/node-ip) module API.

## License

MIT - Tomas Aparicio
