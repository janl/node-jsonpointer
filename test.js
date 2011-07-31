var assert = require("assert");
var console = require("console");
var jsonpointer = require("./jsonpointer");

var obj = {
  a: 1,
  b: {
    c: 2
  },
  d: {
    e: [{a:3}, {b:4}, {c:5}]
  }
};

assert.equal(jsonpointer.get(obj, "/a"), 1);
assert.equal(jsonpointer.get(obj, "/b/c"), 2);
assert.equal(jsonpointer.get(obj, "/d/e/0/a"), 3);
assert.equal(jsonpointer.get(obj, "/d/e/1/b"), 4);
assert.equal(jsonpointer.get(obj, "/d/e/2/c"), 5);

// set returns old value
assert.equal(jsonpointer.set(obj, "/a", 2), 1);
assert.equal(jsonpointer.set(obj, "/b/c", 3), 2);
assert.equal(jsonpointer.set(obj, "/d/e/0/a", 4), 3);
assert.equal(jsonpointer.set(obj, "/d/e/1/b", 5), 4);
assert.equal(jsonpointer.set(obj, "/d/e/2/c", 6), 5);

assert.equal(jsonpointer.get(obj, "/a"), 2);
assert.equal(jsonpointer.get(obj, "/b/c"), 3);
assert.equal(jsonpointer.get(obj, "/d/e/0/a"), 4);
assert.equal(jsonpointer.get(obj, "/d/e/1/b"), 5);
assert.equal(jsonpointer.get(obj, "/d/e/2/c"), 6);

var complexKeys = {
  "a/b": {
    c: 1
  },
  d: {
    "e/f": 2
  }
}

assert.equal(jsonpointer.get(complexKeys, "/a%2Fb/c"), 1);
assert.equal(jsonpointer.get(complexKeys, "/d/e%2Ff"), 2);
assert.throws(function() {
  assert.equal(jsonpointer.get(complexKeys, "/a/b/c"), 1);
});

console.log("All tests pass.");
