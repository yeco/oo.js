(function() {
  function extend(dst, src) {
    if (src) for (var k in src) dst[k] = src[k];
    return dst;
  }

  var Test = function(options) {
    this._options = options;
  };

  extend(Test.prototype, {
    passed: 0,
    failed: 0,
    total: 0,

    _run: function() {
        var opts = this._options;
        if (opts.setup) {
          try {
            opts.setup.call(this);
          } catch (e) {
            throw ootest.logException(e);
          }
        }
        for (var k in opts) {
          if (/^test/.test(k)) {
            ootest.log('&raquo; ' + k, 'info');
            this._runTest(k);
          }
        }
        if (opts.teardown) {
          try {
            opts.teardown.call(this);
          } catch (e) {
            throw ootest.logException(e);
          }
        }
      ootest.log('Finished ' + this.total + ' tests.', 'info');
      if (this.failed) ootest.log(this.failed + ' test(s) failed!', 'error');
    },

    _runTest: function(testName) {
      if (!this._options[testName]) throw Error(testName + ' test not defined');
      try {
        this._options[testName].call(this);
      } catch (e) {
        throw ootest.logException(e);
      }
    },

    _assert: function(pass, msg) {
      this.total++;
      this.passed += pass ? 1 : 0;
      this.failed += pass ? 0 : 1;
      if (pass) return ootest.log('Passed: ' + msg, 'pass');
      ootest.log('Failed: ' + msg, 'fail');
      return this;
    },

    include: function(testName) {
      this._runTest(testName);
    },

    isTrue: function(val, msg) {
      msg = msg || 'isTrue';
      return this._assert(val, msg);
    },

    isFalse: function(val, msg) {
      msg = msg || 'isFalse';
      return this._assert(!val, msg);
    },

    isUndefined: function(val, msg) {
      msg = msg || 'isUndefined';
      return this._assert(val === undefined, msg);
    },

    isEqual: function(expected, actual, msg) {
      msg = msg || 'isEqual';
      var pass = expected == actual;
      msg += pass ? '' : ' (' + expected + ' != ' + actual + ')';
      return this._assert(pass, msg);
    },

    isEqualArray: function(expected, actual, msg) {
      msg = msg || 'isEqualArray';
      var pass = true;
      if (!expected
        || !actual
        || !('length' in expected)
        || !('length' in actual)
        || expected.length != actual.length) {
        pass = false;
      } else {
        for (var i = 0; i < expected.length; i++) {
          if (expected[i] != actual[i]) {
            pass = false;
            break;
          }
        }
      }

      return this._assert(pass, msg);
    }
  });

  var tests = [], logEl;

  var ootest = self.ootest = {
    run: function() {
      ootest.info(new Date());
      ootest.info(navigator.userAgent);
      for (var i = 0; i < tests.length; i++) tests[i]._run();
    },

    logTo: function(el) {
      logEl = el.nodeName ? el : document.getElementById(el);
    },

    log: function(msg, cssname) {
      if (self.console && console.log) console.log(msg);
      var nel = document.createElement('div');
      nel.innerHTML = msg;
      nel.className = 'log_message ' + cssname;
      (logEl || document.body).appendChild(nel);
    },

    info: function(msg) {ootest.log(msg, 'info');},
    warn: function(msg) {ootest.log(msg, 'warn');},
    error: function(msg) {ootest.log(msg, 'error');},

    logException: function(e) {
      if (!e.logged) {
        ootest.error('Exception: ' + e.message);
        ootest.logObject(e, 'error');
        e.logged = true;
      }
      if (/oodebug/i.test(location)) debugger;
      return e;
    },

    logObject: function(o, cssname) {
      var keys = [], txt = [];
      for (var k in o) keys.push(k);
      keys.sort();
      while (keys.length) {
        var key = keys.shift();
        txt.push('<strong>' + key + '</strong>: ' + o[key]);
      }
      ootest.log('<pre>' + txt.join('\n') + '</pre>', cssname);
    },

    test: function(options) {
      tests.push(new Test(options));
    }
  };

  document.write('<style> \
    .info  {color: #007} \
    .pass  {color: #070} \
    .fail  {color: #700} \
    .warn  {color: #840} \
    .error {color: #a00, font-weight: bold} \
    </style>');
})();
