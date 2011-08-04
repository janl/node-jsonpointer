var console = require("console");

var traverse = function(obj, pointer, value) {
  // assert(isArray(pointer))
  var part = unescape(pointer.shift());
  if(typeof obj[part] === "undefined") {
    throw("Value for pointer '" + pointer + "' not found.");
    return;
  }
  if(pointer.length != 0) { // keep traversin!
    return traverse(obj[part], pointer, value);
  }
  // we're done
  if(typeof value !== "undefined") { // set new value, return old value
    var old_value = obj[part];
    if(value === null) {
      delete obj[part];
    } else {
      obj[part] = value;
    }
    return old_value;
  } else { // just reading
    return obj[part];
  }
}

var validate_input = function(obj, pointer) {
  if(typeof obj !== "object") {
    throw("Invalid input object.");
  }

  if(!pointer) {
    throw("Invalid JSON pointer.");
  }
}

var get = function(obj, pointer) {
  validate_input(obj, pointer);
  if (pointer === "/") {
    return obj;
  } else {
    pointer = pointer.split("/").slice(1);
    return traverse(obj, pointer);
  }
}

var set = function(obj, pointer, value) {
  validate_input(obj, pointer);
  if (pointer === "/") {
    return obj;
  } else {
    pointer = pointer.split("/").slice(1);
    return traverse(obj, pointer, value);
  }
}

exports.get = get
exports.set = set
