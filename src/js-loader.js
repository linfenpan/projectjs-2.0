'use strict';
var currentLoadedScriptURL, currentAddingScript, interactiveScript;
var defineModules = [];

function js_loader(uri, next) {
  js_create_script_node(uri, next);
}

function js_create_script_node(src, next) {
  var script = winDocument.createElement('script');
  var onload = function(error) {
    // @bug ie9下，须先 removeChild，再callback
    // 以防在 require相互嵌套时 getCurrentScriptUrl() 方法，获取到错误的脚本链接
    eHead.removeChild(script);
    script.onload = script.onerror = script.onreadystatechange = EMPTY;

    // 如果模块没有指定连接，则使用当前的地址
    forEach(defineModules, function(module) {
      if (!module.url) {
        module.url = src;
      }
    });
    js_add_require_module();

    next(error);
  };

  script.async = true;
  script.type= 'text/javascript';

  if ("onload" in script) {
    script.onload = function(){
      onload.call(script);
    };
    script.onerror = function(){
      onload.call(script, true);
    };
  } else {
    script.onreadystatechange = function(){
      if (/loaded|complete/.test(script.readyState)) {
        onload.call(script);
      }
    }
  };
  script.src = src;

  // 在 ie6-9 下，脚本，如果脚本有缓存，则会在插入的时候，立刻运行
  // 用 interactiveScript 暂时记录下当前的链接，可以有效的传递当前运行脚本地址
  currentAddingScript = script;
  // ref: http://dev.jquery.com/ticket/2709
  eBase ?
      eHead.insertBefore(script, eBase) :
      eHead.appendChild(script);
  currentAddingScript = EMPTY;
}

function js_get_current_script_src() {
  // 获取当前加载的脚本 URL
  if (currentAddingScript) {
    return getAttribute(currentAddingScript, 'src');
  }

  // IE6 - 9 的浏览器，script.onload 之后，脚本可能还没执行完成
  // 判断当前 interactive[未执行完毕] 状态的节点，可知道当前运行的脚本
  var interactiveState = "interactive";
  if (interactiveScript && interactiveScript.readyState == interactiveState) {
    return getAttribute(interactiveScript, 'src');
  }

  var scripts = eHead.getElementsByTagName('script');
  for (var i = scripts.length - 1; i >= 0; i--) {
    var script = scripts[i]
    if (script.readyState == interactiveState) {
      interactiveScript = script;
      return getAttribute(interactiveScript, 'src');
    }
  }
}

function js_add_require_module() {
  var module;
  while (module = defineModules.shift()) {
    require_get_module(module.url)
      .thenable.resolve(module.data);
  }
}

// TODO 如果遇到了两个 define，该咋整呢?
function define(moduleName, dependences, callback) {
  if (isFunction(moduleName)) {
    callback = moduleName;
    moduleName = dependences = EMPTY;
  } else if (isString(moduleName)) {
    if (!isArray(dependences)) {
      callback = dependences;
      dependences = EMPTY;
    }
  }

  defineModules.push({
    url: moduleName || js_get_current_script_src(),
    data: callback,
    dependences: dependences || []
  });

  if (isScriptExecuteDelayMode) {
    js_add_require_module();
  }
}
