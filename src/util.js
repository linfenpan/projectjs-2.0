'use strict';

function noop() {
  // nothing
}

function type(obj) {
  return Object.prototype.toString
    .call(obj)
    .split(' ')[1]
    .slice(0, -1)
    .toLowerCase();
}

function isFunction(fn) {
  return type(fn) === 'function';
}

function isObject(obj) {
  return type(obj) === 'object';
}

function isArray(arr) {
  return type(arr) === 'array';
}

function isInstanceOf(obj, instance) {
  return obj instanceof instance;
}

function isEmptyObject(obj) {
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      return false;
    }
  }
  return true;
}

function trim(str) {
  return str.trim
    ? str.trim()
    : str.replace(/^\s*|\s*$/, '');
}

function toArray(obj) {
  return [].slice.call(obj, 0);
}

function extend(obj1, obj2) {
  keys(obj2, function(key, value) {
    obj1[key] = value;
  });
}

function keys(obj, callback) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key)) {
      callback.call(obj, key, obj[key]);
    }
  }
}

function forEach(arr, callback) {
  for (var i = 0, max = arr.length; i < max; i++) {
    callback.call(arr, arr[i], i);
  }
}
