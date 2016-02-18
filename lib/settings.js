"use strict";
var _ = require("lodash")

module.exports = function (opts) {
  var data = {
    bucket: null,
    key: null,
    region: null,
    secret: null
  }
  _.merge(data, opts || {})
  return data
}
