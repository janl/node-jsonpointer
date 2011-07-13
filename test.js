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

assert.equal(jsonpointer.set(obj, "/a"), 1);
assert.equal(jsonpointer.set(obj, "/b/c"), 2);
assert.equal(jsonpointer.set(obj, "/d/e/0/a"), 3);
assert.equal(jsonpointer.set(obj, "/d/e/1/b"), 4);
assert.equal(jsonpointer.set(obj, "/d/e/2/c"), 5);

assert.equal(jsonpointer.get(obj, "/a"), 1);
assert.equal(jsonpointer.get(obj, "/b/c"), 2);
assert.equal(jsonpointer.get(obj, "/d/e/0/a"), 3);
assert.equal(jsonpointer.get(obj, "/d/e/1/b"), 4);
assert.equal(jsonpointer.get(obj, "/d/e/2/c"), 5);

console.log("All tests pass.");
