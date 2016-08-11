'use strict';

var LOADED = 0, LOADING = 1, UN_LOAD = 2, NOT_EXECUTE = 3, EXECUTED = 4;

function require(modules, callback) {
  var args = arguments;

  if (isString(modules)) {
    modules = toArray(args);
    callback = modules.pop();
  }

  if (!isFunction(callback)) {
    if (isString(callback)) {
      modules.push(callback);
    }
    callback = EMPTY;
  }

  if (callback) {
    var dependences = analysisDependences(callback);
    modules.push.apply(modules, dependences);
  }

  return require_execute(modules, callback);
}

// 分析函数的依赖
var REQUIRE_REGEXP = /[^.]\s*require\s*\(\s*["']([^'"\s]+)["']\s*\)/g;
function analysisDependences(fn) {
  var dependences = [];
  removeComment(fn.toString())
    .replace(REQUIRE_REGEXP, function(str, moduleName) {
      dependences.push(moduleName);
    });
  return dependences;
}

// 执行
function require_execute(modules, callback) {
  var firstResult = EMPTY;
  var thenables = [];
  var rModules = [];

  forEach(modules, function(uri, index) {
    var module = require_get_module(uri);

    if (index === 0) {
      firstResult = module.module.exports;
    }

    rModules.push(module);
    thenables.push(module.thenable);

    require_load_module(module, uri);
  });

  Thenable.all(thenables).then(function() {
    // TODO 如果不是预加模式，则应该是 Thenable 
    var args = [];
    forEach(rModules, function(module) {
      if (module.state === NOT_EXECUTE) {
        require_execute_define_fn(module.module, module.moduleFn);
        var result = module.module.exports;
        module.thenable.resolve(result);
        module.state = EXECUTED;
        args.push(result);
      } else {
        args.push(module.module.exports);
      }
    });
    callback && callback.apply(EMPTY, args);
  });

  return firstResult;
}

function require_get_module(uri) {
  var modulePath = require_get_absolute_path(uri);
  var module = requireModules[modulePath];
  if (!module) {
    var thenable = new Thenable;
    module = requireModules[modulePath] = {
      dir: requireBasePath,
      module: { exports: {} },
      moduleFn: noop,
      state: UN_LOAD,
      thenable: thenable
    };
    thenable.then(function(value) {
      if (isFunction(value)) {
        module.moduleFn = value;
      } else {
        module.module.exports = value;
      }
    })
    .always(function(value) {
      if (isFunction(value)) {
        module.state = NOT_EXECUTE;
      } else {
        module.state = LOADED;
      }
    });
  }
  return module;
}

// 获取 require 板块的绝对路径
function require_get_absolute_path(uri, dirPath) {
  uri = template(path_remove_extra(uri), requireTemplateData);
  return path_is_absolute(uri)
    ? uri
    : path_join(dirPath || requireBasePath, uri);
}

// 根据地址，加载板块
function require_load_module(module, uri) {
  var state = module.state;
  if (state !== UN_LOAD) {
    return;
  }

  var ext = path_ext(uri);
  var url = require_get_absolute_path(uri);
  var loader = requireLoader[ext] || js_loader;

  loader(url, function(error, value) {
    var thenable = module.thenable;
    if (error) {
      thenable.reject();
    } else {
      thenable.resolve(value);
    }
  });
}

function require_execute_define_fn(module, fn) {
  fn(function(moduleName) {
    return require_execute([moduleName]);
  }, module.exports, module);
}
