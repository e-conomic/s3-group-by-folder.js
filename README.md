# s3-group-by-folder.js
[![Build Status](https://travis-ci.org/e-conomic/s3-group-by-folder.js.svg?branch=master)](https://travis-ci.org/e-conomic/s3-group-by-folder.js)
[![Coverage Status](https://coveralls.io/repos/github/e-conomic/s3-group-by-folder.js/badge.svg?branch=master)](https://coveralls.io/github/e-conomic/s3-group-by-folder.js?branch=master)
[![Dependency Status](https://david-dm.org/e-conomic/s3-group-by-folder.js.svg)](https://david-dm.org/e-conomic/s3-group-by-folder.js)

Grab all elements from an S3 bucket
and group them according to which folder they reside in.

## Install
    npm install e-conomic/s3-group-by-folder.js

## Usage

Given bucket `bucket` with content:

    foo/
      bar/file.txt
      baz/file.txt
    ham/
      spam/file.txt
      eggs/file.txt

This can be parsed like so:

    var GroupBy = require("./")
    var groupBy = new GroupBy({key: "***", secret: "***"})
    groupBy.get("bucket")
            .then(function (result) {
                console.log(result)
            })
    // {foo: ["bar", "baz"], ham: ["spam", "eggs"]}
