"use strict";
var aws    = require("aws-sdk-promise"),
    _      = require("lodash"),
    expect = require("must"),
    sinon  = require("sinon")
var Revisions = require("../")
var awsStub = require("./aws-stub")

describe("Revisions", function () {
  var box
  beforeEach(function () {
    box = sinon.sandbox.create()
  })

  afterEach(function () {
    box.restore()
  })

  it("should be a constructor", function () {
    expect(Revisions).to.be.a.constructor()
  })

  it("should expose get", function () {
    expect(new Revisions().get).to.be.a.function()
  })

  describe("#get", function () {
    var R, stub
    beforeEach(function () {
      stub = box.stub()
      R = new Revisions({bucket: "bucket"})
      R.s3 = {listObjects: stub}
    })

    it("should be empty if there are no objects", function () {
      awsStub(stub, listObjects([]))
      return R.get()
        .must.resolve.to.eql({})
    })

    it("should support calling with bucket name", function () {
      awsStub(stub, [])
      return R.get("foo")
        .then(function () {
          sinon.assert.calledWith(stub, {Bucket: "foo", Marker: undefined})
        })
    })

    it("should fall back on settings bucket name", function () {
      awsStub(stub, [])
      return R.get()
        .then(function () {
          sinon.assert.calledWith(stub, {Bucket: "bucket", Marker: undefined})
        })
    })

    it("should group interesting folder", function () {
      awsStub(stub, listObjects(contents(keys.ham1)))
      var ideal = {"ham": ["spam"]}
      return R.get()
        .must.resolve.to.eql(ideal)
    })

    describe("with truncated result", function () {
      beforeEach(function () {
        awsStub(
          stub,
          listObjects(contents(keys.ham1), {IsTruncated: true}),
          listObjects(contents(keys.ham2), {IsTruncated: false}))
      })

      it("should concatenate results across truncated returns", function () {
        return R.get()
          .then(function (result) {
            result["ham"].must.have.length(2)
          })
      })

      it("should keep trying until not truncated", function () {
        return R.get()
          .then(function () {
            sinon.assert.calledTwice(stub)
          })
      })
    })
  })
})

var keys = {
  "foo": "foo/bar/",
  "ham1": "ham/spam/",
  "ham2": "ham/bacon/"
}

var listObjects = function (contents, overrides) {
  var d = {
    IsTruncated: false,
    Marker: "",
    Contents: contents,
    Name: "e-conomic-deployment",
    Prefix: "",
    MaxKeys: 1000,
    CommonPrefixes: []
  }
  return _.merge(d, overrides || {})
}

var contents = function (/*key...*/) {
  var keys = Array.prototype.slice.call(arguments)
  var contents = []
  keys.forEach(function (key) {
    contents.push.apply(contents, [{
      Key: key + "fujitsu_PatchingTools.zip",
      LastModified: "Fri Jan 08 2016 11:24:42 GMT+0200 (EET)",
      ETag: "a9aee5b26901134c2f1b5f6606b6302f",
      Size: 1194676,
      StorageClass: "STANDARD",
      Owner: {}
    }, {
      Key: key + "fujitsu_econ-chef.zip",
      LastModified: "Fri Jan 08 2016 11:24:42 GMT+0200 (EET)",
      ETag: "a9aee5b26901134c2f1b5f6606b6302f",
      Size: 1194676,
      StorageClass: "STANDARD",
      Owner: {}
    }])
  })
  return contents
}
