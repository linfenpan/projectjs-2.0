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

function isString(str) {
  return type(str) === 'string';
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

function extend(obj) {
  var arr = toArray(arguments);
  arr.unshift();

  forEach(arr, function(source) {
    keys(source, function(key, value) {
      obj[key] = value;
    });
  });

  return obj;
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

// @NOTICES: 考虑到代码压缩之后，eval里的"o."就没效了..
var template = Function("s", "o", "return s.replace(/{([^}]*)}/g,function(a,k){return eval('o.'+k)})");

// 删除注释
var COMMENT_REGEXP = /(\/\*([\s\S]*?)\*\/|([^:]|^)\/\/(.*)$)/mg;
function removeComment(str) {
  return str.replace(COMMENT_REGEXP, '');
}

function getAttribute(node, attr) {
  return node.getAttribute(attr);
}
