'ust strict';

var PENDING = 'pending';
var DONE = 'resolve';
var FAIL = 'reject';

function Thenable() {
  this._records = [];
  this._param = null;
  this._state = PENDING;
}

Thenable.prototype = {
  _exe: function(param) {
    var state = this._state;
    var list = this._records;
    var item;
    while (item = list.shift()) {
      if (state === DONE) {
        if (item.done) {
          param = item.done.call(this, param);
        }
      } else {
        if (item.fail) {
          param = item.fail.call(this, param);
        }
      }
      this._param = param;
    }
    return this;
  },

  _changeState: function(state, param) {
    if (this._state === PENDING) {
      this._state = state;
      this._param = param;
      return this._exe(param);
    }
    return this;
  },

  resolve: function(param) {
    return this._changeState(DONE, param);
  },

  reject: function(param) {
    return this._changeState(FAIL, param);
  },

  then: function(resolve, reject) {
    this._records.push({ done: resolve, fail: reject });
    if (this._state !== PENDING) {
      return this._exe(this._param);
    }
    return this;
  },

  always: function(fn) {
    return this.then(fn, fn);
  },

  fail: function(fn) {
    return this.then(null, fn);
  }
};

Thenable.all = function(args) {
  var thenable = new Thenable();
  var wait = args.length;
  
  var check = function() {
    wait <= 0 && thenable.resolve();
  };
  check();

  forEach(args, function(item) {
    if (isInstanceOf(item, Thenable)) {
      item.then(
        function() { wait--; check(); },
        function(err) { thenable.reject(err); }
      );
    } else {
      wait--;
      check();
    }
  });

  return thenable;
}
