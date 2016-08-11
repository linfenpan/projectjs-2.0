'use strict';

var requireLoader = {};

function require_add_loader(key, fn) {
  requireLoader[key] = fn;
}

function emptyLoader(uri, next) {
  js_loader(uri, next);
}
