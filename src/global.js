'use strict';

var winDocument = window.document;
var eHead = winDocument.head || winDocument.getElementsByTagName('head')[0] || winDocument.documentElement;
var eBase = eHead.getElementsByTagName("base")[0];
var EMPTY = null;
var EMPTY_STRING = '';

var windowRequire = EMPTY;
var requireBasePath = EMPTY_STRING;
var requireTemplateData = {};
var requireModules = {};

// 怪异的 define 模式，在此模式下，js加载完成后，并不会立刻运行
var isScriptExecuteDelayMode = !!winDocument.attachEvent;
