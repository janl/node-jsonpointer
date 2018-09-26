var assert = require('assert')
var jsonpointer = require('./jsonpointer')

var obj = {
  a: 1,
  b: {
    c: 2
  },
  d: {
    e: [{ a: 3 }, { b: 4 }, { c: 5 }]
  },
  k: null
}

assert.strictEqual(jsonpointer.get(obj, '/a'), 1)
assert.strictEqual(jsonpointer.get(obj, '/b/c'), 2)
assert.strictEqual(jsonpointer.get(obj, '/d/e/0/a'), 3)
assert.strictEqual(jsonpointer.get(obj, '/d/e/1/b'), 4)
assert.strictEqual(jsonpointer.get(obj, '/d/e/2/c'), 5)

// `null` and `undefined` cases when key is not what expected
assert.strictEqual(jsonpointer.get(obj, '/k/l/m'), null)
assert.strictEqual(jsonpointer.get(obj, '/m/l/k'), undefined)
assert.strictEqual(jsonpointer.get(obj, '/a/b/c'), undefined)

// set returns old value
assert.strictEqual(jsonpointer.set(obj, '/a', 2), 1)
assert.strictEqual(jsonpointer.set(obj, '/b/c', 3), 2)
assert.strictEqual(jsonpointer.set(obj, '/d/e/0/a', 4), 3)
assert.strictEqual(jsonpointer.set(obj, '/d/e/1/b', 5), 4)
assert.strictEqual(jsonpointer.set(obj, '/d/e/2/c', 6), 5)

// set nested properties
assert.strictEqual(jsonpointer.set(obj, '/f/g/h/i', 6), undefined)
assert.strictEqual(jsonpointer.get(obj, '/f/g/h/i'), 6)

// set an array
assert.strictEqual(jsonpointer.set(obj, '/f/g/h/foo/-', 'test'), undefined)
var arr = jsonpointer.get(obj, '/f/g/h/foo')
assert(Array.isArray(arr), 'set /- creates an array.')
assert.strictEqual(arr[0], 'test')

assert.strictEqual(jsonpointer.get(obj, '/a'), 2)
assert.strictEqual(jsonpointer.get(obj, '/b/c'), 3)
assert.strictEqual(jsonpointer.get(obj, '/d/e/0/a'), 4)
assert.strictEqual(jsonpointer.get(obj, '/d/e/1/b'), 5)
assert.strictEqual(jsonpointer.get(obj, '/d/e/2/c'), 6)

// can set `null` as a value
assert.strictEqual(jsonpointer.set(obj, '/f/g/h/foo/0', null), 'test')
assert.strictEqual(jsonpointer.get(obj, '/f/g/h/foo/0'), null)
assert.strictEqual(jsonpointer.set(obj, '/b/c', null), 3)
assert.strictEqual(jsonpointer.get(obj, '/b/c'), null)

assert.strictEqual(jsonpointer.get(obj, ''), obj)
assert.throws(function () { jsonpointer.get(obj, 'a') }, validateError)
assert.throws(function () { jsonpointer.get(obj, 'a/') }, validateError)

// can unset values with `undefined`
jsonpointer.set(obj, '/a', undefined)
assert.strictEqual(jsonpointer.get(obj, '/a'), undefined)
jsonpointer.set(obj, '/d/e/1', undefined)
assert.strictEqual(jsonpointer.get(obj, '/d/e/1'), undefined)

// returns `undefined` when path extends beyond any existing objects
assert.strictEqual(jsonpointer.get(obj, '/x/y/z'), undefined)

function validateError (err) {
  if ((err instanceof Error) && /Invalid JSON pointer/.test(err.message)) {
    return true
  }
}

var complexKeys = {
  'a/b': {
    c: 1
  },
  d: {
    'e/f': 2
  },
  '~1': 3,
  '01': 4
}

assert.strictEqual(jsonpointer.get(complexKeys, '/a~1b/c'), 1)
assert.strictEqual(jsonpointer.get(complexKeys, '/d/e~1f'), 2)
assert.strictEqual(jsonpointer.get(complexKeys, '/~01'), 3)
assert.strictEqual(jsonpointer.get(complexKeys, '/01'), 4)
assert.strictEqual(jsonpointer.get(complexKeys, '/a/b/c'), undefined)
assert.strictEqual(jsonpointer.get(complexKeys, '/~1'), undefined)

// draft-ietf-appsawg-json-pointer-08 has special array rules
var ary = [ 'zero', 'one', 'two' ]
assert.strictEqual(jsonpointer.get(ary, '/01'), undefined)

assert.strictEqual(jsonpointer.set(ary, '/-', 'three'), undefined)
assert.strictEqual(ary[3], 'three')

// Examples from the draft:
var example = {
  'foo': ['bar', 'baz'],
  '': 0,
  'a/b': 1,
  'c%d': 2,
  'e^f': 3,
  'g|h': 4,
  'i\\j': 5,
  'k\'l': 6,
  ' ': 7,
  'm~n': 8
}

assert.strictEqual(jsonpointer.get(example, ''), example)
var ans = jsonpointer.get(example, '/foo')
assert.strictEqual(ans.length, 2)
assert.strictEqual(ans[0], 'bar')
assert.strictEqual(ans[1], 'baz')
assert.strictEqual(jsonpointer.get(example, '/foo/0'), 'bar')
assert.strictEqual(jsonpointer.get(example, '/'), 0)
assert.strictEqual(jsonpointer.get(example, '/a~1b'), 1)
assert.strictEqual(jsonpointer.get(example, '/c%d'), 2)
assert.strictEqual(jsonpointer.get(example, '/e^f'), 3)
assert.strictEqual(jsonpointer.get(example, '/g|h'), 4)
assert.strictEqual(jsonpointer.get(example, '/i\\j'), 5)
assert.strictEqual(jsonpointer.get(example, '/k\'l'), 6)
assert.strictEqual(jsonpointer.get(example, '/ '), 7)
assert.strictEqual(jsonpointer.get(example, '/m~0n'), 8)

// jsonpointer.compile(path)
var a = { foo: 'bar' }
var pointer = jsonpointer.compile('/foo')
assert.strictEqual(pointer.get(a), 'bar')
assert.strictEqual(pointer.set(a, 'test'), 'bar')
assert.strictEqual(pointer.get(a), 'test')
assert.deepStrictEqual(a, { foo: 'test' })

console.log('All tests pass.')
