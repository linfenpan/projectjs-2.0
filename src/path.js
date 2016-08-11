'use strict';

var SUFFIX_EXTRA_REG = /![^!]*?($|\?|#)/;

// 删除 search 和 hash
function path_remove_search_and_hash(uri) {
  return uri.replace(/(\?|#).*$/, '');
}

// 路径格式化
function path_normal(uri) {
  // 1. ./a/./b//c/d/../e/ ==> ./a//b//c/d/../e/
  // 2. ./a//b/c/d/../e/ ==> ./a/b/c/d/../e/
  // 3. ./a/b/c/d/../e/ ==> ./a/b/c/e/
  return uri.replace(/\/\.\//g, '\/\/')
    .replace(/([^:])\/{2,}/g, '$1\/')
    .replace(/[^/]+\/\.\.\/([^/]*)/g, '$1');
}

// 是否绝对路径
function path_is_absolute(uri) {
  return /(https?|ftp):\/\//.test(uri);
}

// 路径合并
function path_join() {
  var paths = toArray(arguments);
  var res = paths.shift();

  forEach(paths, function(path) {
    if (path.indexOf('/') === 0) {
      res = path_root(res) + '\/' + path;
    } else {
      res += '\/' + path;
    }
  });

  return path_normal(res);
}

// 路径目录
function path_dir(uri) {
  return path_remove_search_and_hash(uri)
    .replace(/(.*\/).*$/, '$1');
}

// 路径跟目录
function path_root(uri) {
  // http://www.baidu.com/xxx/index.html --> http://www.baidu.com/
  var res = uri.match(/.*:\/{2,}.*?(\/|$)/g);
  return res ? res[0] : '';
}

// 文件后缀名
function path_ext(uri) {
  // test.txt!js  --> "!js"
  // test.json --> "json"
  var ext = uri.match(SUFFIX_EXTRA_REG);
  if (ext) {
    return ext[0].slice(1);
  } else {
    uri = path_remove_search_and_hash(uri);
    return uri.match(/\.([^.]*)$/)[1];
  }
}

// 删除 extra 信息
function path_remove_extra(uri) {
  return uri.replace(SUFFIX_EXTRA_REG, '$1');
}
