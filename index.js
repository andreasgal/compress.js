/* -*- Mode: Java; tab-width: 2; indent-tabs-mode: nil; c-basic-offset: 2 -*- */
/* vim: set shiftwidth=2 tabstop=2 autoindent cindent expandtab: */

'use strict';

var BitStream = require('bit-buffer').BitStream;

function uncompress(bb) {
  var bs = new BitStream(bb);
  if (bs.readBits(8) != 0x1f || bs.readBits(8) != 0x9d)
    throw new Error('invalid header');
  var header = bs.readBits(8);
  var maxbits = header & 0x1f;

  var dict = [];
  var bits = 9;
  while (dict.length < 256)
    dict.push(String.fromCharCode(dict.length));
  dict.push(null); // 256 is reserved

  var out = '';
  var prev = null;
  while (true) {
    try {
      var k = bs.readBits(bits);
    } catch (e) {
      break;
    }
    if (k === 256) {
      bits = 9;
    }
    if (prev !== null) {
      if (k === dict.length) {
        dict.push(dict[prev] + dict[prev][0]);
      } else {
        dict.push(dict[prev] + dict[k][0]);
      }
      if (dict.length === (1<<bits))
        ++bits;
    }
    out += dict[k];
    prev = k;
  }
  return out;
}

module.exports = uncompress;
