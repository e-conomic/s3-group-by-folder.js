"use strict";
var aws = require("aws-sdk-promise"),
    _   = require("lodash"),
    s   = require("util").format
var getSettings = require("./lib/settings")

var Lister = function (opts) {
  this.settings = getSettings(opts)
  this.s3 = new aws.S3({
    accessKeyId: this.settings.key,
    secretAccessKey: this.settings.secret,
    region: this.settings.region
  })
}

Lister.prototype.get = function (bucket) {
  return listAllObjects(this.s3, bucket || this.settings.bucket)
    .then(function (objects) {
      var map = {}
      objects.forEach(function (x) {
        var splitted = x.Key.split("/")
        var group = splitted[0]
        var folder = splitted[1]
        if (!map[group]) map[group] = []
        map[group].push(folder)
      })
      return map
    })
    .then(function (mapped) {
      for (var key in mapped) {
        var value = mapped[key]
        mapped[key] = _.uniq(value)
      }
      return mapped
    })
}

var listAllObjects = function (s3, bucket, marker) {
  var contents = []
  var times = 0
  var _retrier = function (bucket, marker, retries) {
    return s3.listObjects({Bucket: bucket, Marker: marker}).promise()
      .then(function (res) {
        var data = res.data
        contents.push.apply(contents, data.Contents)
        if (data.IsTruncated) {
          if (retries > 1) console.warn(s(
            "s3.listObjects: Performance warning, " +
            "too many objects in bucket '%s'", bucket))
          var nextMarker = data.Contents[data.Contents.length - 1].Key
          return _retrier(bucket, nextMarker, retries + 1)
        }
      })
  }

  return _retrier(bucket, marker, times)
    .then(function () {
      return contents
    })
}

module.exports = Lister
