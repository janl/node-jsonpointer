var assert = require('assert')
var jsonpointer = require('./jsonpointer')

var obj = {
  a: 1,
  b: {
    c: 2
  },
  d: {
    e: [{ a: 3 }, { b: 4 }, { c: 5 }]
  }
}

assert.equal(jsonpointer.get(obj, '/a'), 1)
assert.equal(jsonpointer.get(obj, '/b/c'), 2)
assert.equal(jsonpointer.get(obj, '/d/e/0/a'), 3)
assert.equal(jsonpointer.get(obj, '/d/e/1/b'), 4)
assert.equal(jsonpointer.get(obj, '/d/e/2/c'), 5)

// set returns old value
assert.equal(jsonpointer.set(obj, '/a', 2), 1)
assert.equal(jsonpointer.set(obj, '/b/c', 3), 2)
assert.equal(jsonpointer.set(obj, '/d/e/0/a', 4), 3)
assert.equal(jsonpointer.set(obj, '/d/e/1/b', 5), 4)
assert.equal(jsonpointer.set(obj, '/d/e/2/c', 6), 5)

// set nested properties
assert.equal(jsonpointer.set(obj, '/f/g/h/i', 6), undefined)
assert.equal(jsonpointer.get(obj, '/f/g/h/i'), 6)

// set an array
assert.equal(jsonpointer.set(obj, '/f/g/h/foo/-', 'test'), undefined)
var arr = jsonpointer.get(obj, '/f/g/h/foo')
assert(Array.isArray(arr), 'set /- creates an array.')
assert.equal(arr[0], 'test')

assert.equal(jsonpointer.get(obj, '/a'), 2)
assert.equal(jsonpointer.get(obj, '/b/c'), 3)
assert.equal(jsonpointer.get(obj, '/d/e/0/a'), 4)
assert.equal(jsonpointer.get(obj, '/d/e/1/b'), 5)
assert.equal(jsonpointer.get(obj, '/d/e/2/c'), 6)

// can set `null` as a value
assert.equal(jsonpointer.set(obj, '/f/g/h/foo/0', null), 'test')
assert.strictEqual(jsonpointer.get(obj, '/f/g/h/foo/0'), null)
assert.equal(jsonpointer.set(obj, '/b/c', null), 3)
assert.strictEqual(jsonpointer.get(obj, '/b/c'), null)

assert.equal(jsonpointer.get(obj, ''), obj)
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

assert.equal(jsonpointer.get(complexKeys, '/a~1b/c'), 1)
assert.equal(jsonpointer.get(complexKeys, '/d/e~1f'), 2)
assert.equal(jsonpointer.get(complexKeys, '/~01'), 3)
assert.equal(jsonpointer.get(complexKeys, '/01'), 4)
assert.equal(jsonpointer.get(complexKeys, '/a/b/c'), null)
assert.equal(jsonpointer.get(complexKeys, '/~1'), null)

// draft-ietf-appsawg-json-pointer-08 has special array rules
var ary = ['zero', 'one', 'two']
assert.equal(jsonpointer.get(ary, '/01'), null)

assert.equal(jsonpointer.set(ary, '/-', 'three'), null)
assert.equal(ary[3], 'three')

// Examples from the draft:
var example = {
  foo: ['bar', 'baz'],
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

assert.equal(jsonpointer.get(example, ''), example)
var ans = jsonpointer.get(example, '/foo')
assert.equal(ans.length, 2)
assert.equal(ans[0], 'bar')
assert.equal(ans[1], 'baz')
assert.equal(jsonpointer.get(example, '/foo/0'), 'bar')
assert.equal(jsonpointer.get(example, '/'), 0)
assert.equal(jsonpointer.get(example, '/a~1b'), 1)
assert.equal(jsonpointer.get(example, '/c%d'), 2)
assert.equal(jsonpointer.get(example, '/e^f'), 3)
assert.equal(jsonpointer.get(example, '/g|h'), 4)
assert.equal(jsonpointer.get(example, '/i\\j'), 5)
assert.equal(jsonpointer.get(example, '/k\'l'), 6)
assert.equal(jsonpointer.get(example, '/ '), 7)
assert.equal(jsonpointer.get(example, '/m~0n'), 8)

// jsonpointer.compile(path)
var a = { foo: 'bar' }
var pointer = jsonpointer.compile('/foo')
assert.equal(pointer.get(a), 'bar')
assert.equal(pointer.set(a, 'test'), 'bar')
assert.equal(pointer.get(a), 'test')
assert.deepEqual(a, { foo: 'test' })

var b = {}
jsonpointer.set({}, '/constructor/prototype/boo', 'polluted')
assert(!b.boo, 'should not boo')

var c = {}
jsonpointer.set({}, '/__proto__/boo', 'polluted')
assert(!c.boo, 'should not boo')

var d = {}
jsonpointer.set({}, '/foo/__proto__/boo', 'polluted')
assert(!d.boo, 'should not boo')

jsonpointer.set({}, '/foo/__proto__/__proto__/boo', 'polluted')
assert(!d.boo, 'should not boo')

var e = {}
jsonpointer.set({}, '/foo/constructor/prototype/boo', 'polluted')
assert(!e.boo, 'should not boo')

jsonpointer.set({}, '/foo/constructor/constructor/prototype/boo', 'polluted')
assert(!e.boo, 'should not boo')

assert.throws(function () { jsonpointer.set({}, [['__proto__'], 'boo'], 'polluted')}, validateError)
assert.throws(function () { jsonpointer.set({}, [[['__proto__']], 'boo'], 'polluted')}, validateError)
assert.throws(function () { jsonpointer.set({}, [['__proto__'], ['__proto__'], 'boo'], 'polluted')}, validateError)
assert.throws(function () { jsonpointer.set({}, [[['__proto__']], [['__proto__']], 'boo'], 'polluted')}, validateError)
assert.throws(function () { jsonpointer.set({}, [['__proto__'], ['__proto__'], ['__proto__'], 'boo'], 'polluted')}, validateError)
assert.throws(function () { jsonpointer.set({}, [['foo'], ['__proto__'], 'boo'], 'polluted')}, validateError)
assert.throws(function () { jsonpointer.set({}, [['foo'], ['__proto__'], ['__proto__'], 'boo'], 'polluted')}, validateError)
assert.throws(function () { jsonpointer.set({}, [['constructor'], ['prototype'], 'boo'], 'polluted')}, validateError)
assert.throws(function () { jsonpointer.set({}, [['constructor'], ['constructor'], ['prototype'], 'boo'], 'polluted')}, validateError)

console.log('All tests pass.')
