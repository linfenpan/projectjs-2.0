'use strict';

function require_config(options) {
  options = options || {};
  extend(requireTemplateData, options.template || {});

  require_init_alias(options.alias);
  require_init_base_path(options.base);
}

function require_init_alias(alias) {
  keys(alias, function(key, value) {
    requireModules[key] = Thenable.resolve(value);
  });
}

// 修正引入路径
// 1、默认为当前 location.href
// 2、有id=seedNode，则相对当前script引入路径
// 3、有设置的，使用设置
function require_init_base_path(basePath) {
  var pageURL = window.location.href;
  var scriptNode = winDocument.getElementById('seedNode');

  // 如果有 seedNode，则基于 seedNode 进行寻址
  if (scriptNode) {
    // see http://msdn.microsoft.com/en-us/library/ms536429(VS.85).aspx
    var scriptSrc = path_dir(scriptNode.hasAttribute ? scriptNode.src : scriptNode.getAttribute('src', 4));
    pageURL = path.dir(scriptSrc);
  }
  scriptNode = EMPTY;

  if (!basePath) {
    requireBasePath = path_dir(pageURL);
  } else {
    requireBasePath = path_is_absolute(basePath)
      ? basePath
      : path_join(pageURL, basePath);
  }
}
