angular.module('ng-token-auth', ['ipCookie']).provider('$auth', function() {
  var configs, defaultConfigName;
  configs = {
    "default": {
      apiUrl: '/api',
      signOutUrl: '/auth/sign_out',
      emailSignInPath: '/auth/sign_in',
      emailRegistrationPath: '/auth',
      accountUpdatePath: '/auth',
      accountDeletePath: '/auth',
      confirmationSuccessUrl: function() {
        return window.location.href;
      },
      passwordResetPath: '/auth/password',
      passwordUpdatePath: '/auth/password',
      passwordResetSuccessUrl: function() {
        return window.location.href;
      },
      tokenValidationPath: '/auth/validate_token',
      proxyIf: function() {
        return false;
      },
      proxyUrl: '/proxy',
      validateOnPageLoad: true,
      forceHardRedirect: false,
      storage: 'cookies',
      tokenFormat: {
        "access-token": "{{ token }}",
        "token-type": "Bearer",
        client: "{{ clientId }}",
        expiry: "{{ expiry }}",
        uid: "{{ uid }}"
      },
      parseExpiry: function(headers) {
        return (parseInt(headers['expiry'], 10) * 1000) || null;
      },
      handleLoginResponse: function(resp) {
        return resp.data;
      },
      handleAccountUpdateResponse: function(resp) {
        return resp.data;
      },
      handleTokenValidationResponse: function(resp) {
        return resp.data;
      },
      authProviderPaths: {
        github: '/auth/github',
        facebook: '/auth/facebook',
        google: '/auth/google_oauth2'
      }
    }
  };
  defaultConfigName = "default";
  return {
    configure: function(params) {
      var conf, defaults, fullConfig, i, k, label, v, _i, _len;
      if (params instanceof Array && params.length) {
        for (i = _i = 0, _len = params.length; _i < _len; i = ++_i) {
          conf = params[i];
          label = null;
          for (k in conf) {
            v = conf[k];
            label = k;
            if (i === 0) {
              defaultConfigName = label;
            }
          }
          defaults = angular.copy(configs["default"]);
          fullConfig = {};
          fullConfig[label] = angular.extend(defaults, conf[label]);
          angular.extend(configs, fullConfig);
        }
        if (defaultConfigName !== "default") {
          delete configs["default"];
        }
      } else if (params instanceof Object) {
        angular.extend(configs["default"], params);
      } else {
        throw "Invalid argument: ng-token-auth config should be an Array or Object.";
      }
      return configs;
    },
    $get: [
      '$http', '$q', '$location', 'ipCookie', '$window', '$timeout', '$rootScope', '$interpolate', (function(_this) {
        return function($http, $q, $location, ipCookie, $window, $timeout, $rootScope, $interpolate) {
          return {
            header: null,
            dfd: null,
            user: {},
            mustResetPassword: false,
            listener: null,
            initialize: function() {
              this.initializeListeners();
              return this.addScopeMethods();
            },
            initializeListeners: function() {
              this.listener = angular.bind(this, this.handlePostMessage);
              if ($window.addEventListener) {
                return $window.addEventListener("message", this.listener, false);
              }
            },
            cancel: function(reason) {
              if (this.t != null) {
                $timeout.cancel(this.t);
              }
              if (this.dfd != null) {
                this.rejectDfd(reason);
              }
              return $timeout(((function(_this) {
                return function() {
                  return _this.t = null;
                };
              })(this)), 0);
            },
            destroy: function() {
              this.cancel();
              if ($window.removeEventListener) {
                return $window.removeEventListener("message", this.listener, false);
              }
            },
            handlePostMessage: function(ev) {
              var error;
              if (ev.data.message === 'deliverCredentials') {
                delete ev.data.message;
                this.handleValidAuth(ev.data, true);
                $rootScope.$broadcast('auth:login-success', ev.data);
              }
              if (ev.data.message === 'authFailure') {
                error = {
                  reason: 'unauthorized',
                  errors: [ev.data.error]
                };
                this.cancel(error);
                return $rootScope.$broadcast('auth:login-error', error);
              }
            },
            addScopeMethods: function() {
              $rootScope.user = this.user;
              $rootScope.authenticate = angular.bind(this, this.authenticate);
              $rootScope.signOut = angular.bind(this, this.signOut);
              $rootScope.destroyAccount = angular.bind(this, this.destroyAccount);
              $rootScope.submitRegistration = angular.bind(this, this.submitRegistration);
              $rootScope.submitLogin = angular.bind(this, this.submitLogin);
              $rootScope.requestPasswordReset = angular.bind(this, this.requestPasswordReset);
              $rootScope.updatePassword = angular.bind(this, this.updatePassword);
              $rootScope.updateAccount = angular.bind(this, this.updateAccount);
              if (this.getConfig().validateOnPageLoad) {
                return this.validateUser({
                  config: this.getSavedConfig()
                });
              }
            },
            submitRegistration: function(params, opts) {
              var successUrl;
              if (opts == null) {
                opts = {};
              }
              successUrl = this.getResultOrValue(this.getConfig(opts.config).confirmationSuccessUrl);
              angular.extend(params, {
                confirm_success_url: successUrl,
                config_name: this.getCurrentConfigName(opts.config)
              });
              return $http.post(this.apiUrl(opts.config) + this.getConfig(opts.config).emailRegistrationPath, params).success(function(resp) {
                return $rootScope.$broadcast('auth:registration-email-success', params);
              }).error(function(resp) {
                return $rootScope.$broadcast('auth:registration-email-error', resp);
              });
            },
            submitLogin: function(params, opts) {
              if (opts == null) {
                opts = {};
              }
              this.initDfd();
              $http.post(this.apiUrl(opts.config) + this.getConfig(opts.config).emailSignInPath, params).success((function(_this) {
                return function(resp) {
                  var authData;
                  _this.setConfigName(opts.config);
                  authData = _this.getConfig(opts.config).handleLoginResponse(resp, _this);
                  _this.handleValidAuth(authData);
                  return $rootScope.$broadcast('auth:login-success', _this.user);
                };
              })(this)).error((function(_this) {
                return function(resp) {
                  _this.rejectDfd({
                    reason: 'unauthorized',
                    errors: ['Invalid credentials']
                  });
                  return $rootScope.$broadcast('auth:login-error', resp);
                };
              })(this));
              return this.dfd.promise;
            },
            userIsAuthenticated: function() {
              return this.retrieveData('auth_headers') && this.user.signedIn && !this.tokenHasExpired();
            },
            requestPasswordReset: function(params, opts) {
              var successUrl;
              if (opts == null) {
                opts = {};
              }
              successUrl = this.getResultOrValue(this.getConfig(opts.config).passwordResetSuccessUrl);
              params.redirect_url = successUrl;
              if (opts.config != null) {
                params.config_name = opts.config;
              }
              return $http.post(this.apiUrl(opts.config) + this.getConfig(opts.config).passwordResetPath, params).success(function(resp) {
                return $rootScope.$broadcast('auth:password-reset-request-success', params);
              }).error(function(resp) {
                return $rootScope.$broadcast('auth:password-reset-request-error', resp);
              });
            },
            updatePassword: function(params) {
              return $http.put(this.apiUrl() + this.getConfig().passwordUpdatePath, params).success((function(_this) {
                return function(resp) {
                  $rootScope.$broadcast('auth:password-change-success', resp);
                  return _this.mustResetPassword = false;
                };
              })(this)).error(function(resp) {
                return $rootScope.$broadcast('auth:password-change-error', resp);
              });
            },
            updateAccount: function(params) {
              return $http.put(this.apiUrl() + this.getConfig().accountUpdatePath, params).success((function(_this) {
                return function(resp) {
                  var curHeaders, key, newHeaders, updateResponse, val, _ref;
                  updateResponse = _this.getConfig().handleAccountUpdateResponse(resp);
                  curHeaders = _this.retrieveData('auth_headers');
                  angular.extend(_this.user, updateResponse);
                  if (curHeaders) {
                    newHeaders = {};
                    _ref = _this.getConfig().tokenFormat;
                    for (key in _ref) {
                      val = _ref[key];
                      if (curHeaders[key] && updateResponse[key]) {
                        newHeaders[key] = updateResponse[key];
                      }
                    }
                    _this.setAuthHeaders(newHeaders);
                  }
                  return $rootScope.$broadcast('auth:account-update-success', resp);
                };
              })(this)).error(function(resp) {
                return $rootScope.$broadcast('auth:account-update-error', resp);
              });
            },
            destroyAccount: function(params) {
              return $http["delete"](this.apiUrl() + this.getConfig().accountUpdatePath, params).success((function(_this) {
                return function(resp) {
                  _this.invalidateTokens();
                  return $rootScope.$broadcast('auth:account-destroy-success', resp);
                };
              })(this)).error(function(resp) {
                return $rootScope.$broadcast('auth:account-destroy-error', resp);
              });
            },
            authenticate: function(provider, opts) {
              if (opts == null) {
                opts = {};
              }
              if (this.dfd == null) {
                this.setConfigName(opts.config);
                this.initDfd();
                this.openAuthWindow(provider, opts);
              }
              return this.dfd.promise;
            },
            setConfigName: function(configName) {
              if (configName == null) {
                configName = defaultConfigName;
              }
              return this.persistData('currentConfigName', configName, configName);
            },
            openAuthWindow: function(provider, opts) {
              var authUrl;
              authUrl = this.buildAuthUrl(provider, opts);
              if (this.useExternalWindow()) {
                return this.requestCredentials(this.createPopup(authUrl));
              } else {
                return this.visitUrl(authUrl);
              }
            },
            visitUrl: function(url) {
              return $window.location.replace(url);
            },
            buildAuthUrl: function(provider, opts) {
              var authUrl, key, val, _ref;
              if (opts == null) {
                opts = {};
              }
              authUrl = this.getConfig(opts.config).apiUrl;
              authUrl += this.getConfig(opts.config).authProviderPaths[provider];
              authUrl += '?auth_origin_url=' + encodeURIComponent($window.location.href);
              if (opts.params != null) {
                _ref = opts.params;
                for (key in _ref) {
                  val = _ref[key];
                  authUrl += '&';
                  authUrl += encodeURIComponent(key);
                  authUrl += '=';
                  authUrl += encodeURIComponent(val);
                }
              }
              return authUrl;
            },
            requestCredentials: function(authWindow) {
              if (authWindow.closed) {
                this.cancel({
                  reason: 'unauthorized',
                  errors: ['User canceled login']
                });
                return $rootScope.$broadcast('auth:window-closed');
              } else {
                authWindow.postMessage("requestCredentials", "*");
                return this.t = $timeout(((function(_this) {
                  return function() {
                    return _this.requestCredentials(authWindow);
                  };
                })(this)), 500);
              }
            },
            createPopup: function(url) {
              return $window.open(url);
            },
            resolveDfd: function() {
              this.dfd.resolve(this.user);
              return $timeout(((function(_this) {
                return function() {
                  _this.dfd = null;
                  if (!$rootScope.$$phase) {
                    return $rootScope.$digest();
                  }
                };
              })(this)), 0);
            },
            validateUser: function(opts) {
              var clientId, configName, expiry, token, uid;
              if (opts == null) {
                opts = {};
              }
              configName = opts.config;
              if (this.dfd == null) {
                this.initDfd();
                if (this.userIsAuthenticated()) {
                  this.resolveDfd();
                } else {
                  if ($location.search().token !== void 0) {
                    token = $location.search().token;
                    clientId = $location.search().client_id;
                    uid = $location.search().uid;
                    expiry = $location.search().expiry;
                    configName = $location.search().config;
                    this.setConfigName(configName);
                    this.mustResetPassword = $location.search().reset_password;
                    this.firstTimeLogin = $location.search().account_confirmation_success;
                    this.setAuthHeaders(this.buildAuthHeaders({
                      token: token,
                      clientId: clientId,
                      uid: uid,
                      expiry: expiry
                    }));
                    $location.url($location.path() || '/');
                  } else if (this.retrieveData('currentConfigName')) {
                    configName = this.retrieveData('currentConfigName');
                  }
                  if (!isEmpty(this.retrieveData('auth_headers'))) {
                    if (this.tokenHasExpired()) {
                      $rootScope.$broadcast('auth:session-expired');
                      this.rejectDfd({
                        reason: 'unauthorized',
                        errors: ['Session expired.']
                      });
                    } else {
                      this.validateToken({
                        config: configName
                      });
                    }
                  } else {
                    this.rejectDfd({
                      reason: 'unauthorized',
                      errors: ['No credentials']
                    });
                    $rootScope.$broadcast('auth:invalid');
                  }
                }
              }
              return this.dfd.promise;
            },
            validateToken: function(opts) {
              if (opts == null) {
                opts = {};
              }
              if (!this.tokenHasExpired()) {
                return $http.get(this.apiUrl(opts.config) + this.getConfig(opts.config).tokenValidationPath, {async: true}).success((function(_this) {
                  return function(resp) {
                    var authData;
                    authData = _this.getConfig(opts.config).handleTokenValidationResponse(resp);
                    _this.handleValidAuth(authData);
                    if (_this.firstTimeLogin) {
                      $rootScope.$broadcast('auth:email-confirmation-success', _this.user);
                    }
                    if (_this.mustResetPassword) {
                      $rootScope.$broadcast('auth:password-reset-confirm-success', _this.user);
                    }
                    return $rootScope.$broadcast('auth:validation-success', _this.user);
                  };
                })(this)).error((function(_this) {
                  return function(data) {
                    if (_this.firstTimeLogin) {
                      $rootScope.$broadcast('auth:email-confirmation-error', data);
                    }
                    if (_this.mustResetPassword) {
                      $rootScope.$broadcast('auth:password-reset-confirm-error', data);
                    }
                    $rootScope.$broadcast('auth:validation-error', data);
                    return _this.rejectDfd({
                      reason: 'unauthorized',
                      errors: data.errors
                    });
                  };
                })(this));
              } else {
                return this.rejectDfd({
                  reason: 'unauthorized',
                  errors: ['Expired credentials']
                });
              }
            },
            tokenHasExpired: function() {
              var expiry, now;
              expiry = this.getExpiry();
              now = new Date().getTime();
              return expiry && expiry < now;
            },
            getExpiry: function() {
              return this.getConfig().parseExpiry(this.retrieveData('auth_headers') || {});
            },
            invalidateTokens: function() {
              var key, val, _ref;
              _ref = this.user;
              for (key in _ref) {
                val = _ref[key];
                delete this.user[key];
              }
              this.deleteData('currentConfigName');
              return this.deleteData('auth_headers');
            },
            signOut: function() {
              return $http["delete"](this.apiUrl() + this.getConfig().signOutUrl).success((function(_this) {
                return function(resp) {
                  _this.invalidateTokens();
                  return $rootScope.$broadcast('auth:logout-success');
                };
              })(this)).error((function(_this) {
                return function(resp) {
                  _this.invalidateTokens();
                  return $rootScope.$broadcast('auth:logout-error', resp);
                };
              })(this));
            },
            handleValidAuth: function(user, setHeader) {
              if (setHeader == null) {
                setHeader = false;
              }
              if (this.t != null) {
                $timeout.cancel(this.t);
              }
              angular.extend(this.user, user);
              this.user.signedIn = true;
              this.user.configName = this.getCurrentConfigName();
              if (setHeader) {
                this.setAuthHeaders(this.buildAuthHeaders({
                  token: this.user.auth_token,
                  clientId: this.user.client_id,
                  uid: this.user.uid,
                  expiry: this.user.expiry
                }));
              }
              return this.resolveDfd();
            },
            buildAuthHeaders: function(ctx) {
              var headers, key, val, _ref;
              headers = {};
              _ref = this.getConfig().tokenFormat;
              for (key in _ref) {
                val = _ref[key];
                headers[key] = $interpolate(val)(ctx);
              }
              return headers;
            },
            persistData: function(key, val, configName) {
              switch (this.getConfig(configName).storage) {
                case 'localStorage':
                  return $window.localStorage.setItem(key, JSON.stringify(val));
                default:
                  return ipCookie(key, val, {
                    path: '/'
                  });
              }
            },
            retrieveData: function(key) {
              switch (this.getConfig().storage) {
                case 'localStorage':
                  return JSON.parse($window.localStorage.getItem(key));
                default:
                  return ipCookie(key);
              }
            },
            deleteData: function(key) {
              switch (this.getConfig().storage) {
                case 'localStorage':
                  return $window.localStorage.removeItem(key);
                default:
                  return ipCookie.remove(key, {
                    path: '/'
                  });
              }
            },
            setAuthHeaders: function(h) {
              var newHeaders;
              newHeaders = angular.extend(this.retrieveData('auth_headers') || {}, h);
              return this.persistData('auth_headers', newHeaders);
            },
            useExternalWindow: function() {
              return !(this.getConfig().forceHardRedirect || $window.isIE());
            },
            initDfd: function() {
              return this.dfd = $q.defer();
            },
            rejectDfd: function(reason) {
              this.invalidateTokens();
              if (this.dfd != null) {
                this.dfd.reject(reason);
                return $timeout(((function(_this) {
                  return function() {
                    return _this.dfd = null;
                  };
                })(this)), 0);
              }
            },
            apiUrl: function(configName) {
              if (this.getConfig(configName).proxyIf()) {
                return this.getConfig(configName).proxyUrl;
              } else {
                return this.getConfig(configName).apiUrl;
              }
            },
            getConfig: function(name) {
              return configs[this.getCurrentConfigName(name)];
            },
            getResultOrValue: function(arg) {
              if (typeof arg === 'function') {
                return arg();
              } else {
                return arg;
              }
            },
            getCurrentConfigName: function(name) {
              return name || this.getSavedConfig();
            },
            getSavedConfig: function() {
              var c, key;
              c = void 0;
              key = 'currentConfigName';
              if ($window.localStorage) {
                if (c == null) {
                  c = JSON.parse($window.localStorage.getItem(key));
                }
              }
              if (c == null) {
                c = ipCookie(key);
              }
              return c || defaultConfigName;
            }
          };
        };
      })(this)
    ]
  };
}).config([
  '$httpProvider', function($httpProvider) {
    var httpMethods, tokenIsCurrent, updateHeadersFromResponse;
    tokenIsCurrent = function($auth, headers) {
      var newTokenExpiry, oldTokenExpiry;
      oldTokenExpiry = Number($auth.getExpiry());
      newTokenExpiry = Number($auth.getConfig().parseExpiry(headers || {}));
      return newTokenExpiry >= oldTokenExpiry;
    };
    updateHeadersFromResponse = function($auth, resp) {
      var key, newHeaders, val, _ref;
      newHeaders = {};
      _ref = $auth.getConfig().tokenFormat;
      for (key in _ref) {
        val = _ref[key];
        if (resp.headers(key)) {
          newHeaders[key] = resp.headers(key);
        }
      }
      if (tokenIsCurrent($auth, newHeaders)) {
        return $auth.setAuthHeaders(newHeaders);
      }
    };
    $httpProvider.interceptors.push([
      '$injector', function($injector) {
        return {
          request: function(req) {
            $injector.invoke([
              '$http', '$auth', function($http, $auth) {
                var key, val, _ref, _results;
                if (req.url.match($auth.apiUrl())) {
                  _ref = $auth.retrieveData('auth_headers');
                  _results = [];
                  for (key in _ref) {
                    val = _ref[key];
                    _results.push(req.headers[key] = val);
                  }
                  return _results;
                }
              }
            ]);
            return req;
          },
          response: function(resp) {
            $injector.invoke([
              '$http', '$auth', function($http, $auth) {
                if (resp.config.url.match($auth.apiUrl())) {
                  return updateHeadersFromResponse($auth, resp);
                }
              }
            ]);
            return resp;
          },
          responseError: function(resp) {
            $injector.invoke([
              '$http', '$auth', function($http, $auth) {
                if (resp.config.url.match($auth.apiUrl())) {
                  return updateHeadersFromResponse($auth, resp);
                }
              }
            ]);
            return $injector.get('$q').reject(resp);
          }
        };
      }
    ]);
    httpMethods = ['get', 'post', 'put', 'patch', 'delete'];
    return angular.forEach(httpMethods, function(method) {
      var _base;
      if ((_base = $httpProvider.defaults.headers)[method] == null) {
        _base[method] = {};
      }
      return $httpProvider.defaults.headers[method]['If-Modified-Since'] = '0';
    });
  }
]).run([
  '$auth', '$window', '$rootScope', function($auth, $window, $rootScope) {
    return $auth.initialize();
  }
]);

window.isOldIE = function() {
  var nav, out, version;
  out = false;
  nav = navigator.userAgent.toLowerCase();
  if (nav && nav.indexOf('msie') !== -1) {
    version = parseInt(nav.split('msie')[1]);
    if (version < 10) {
      out = true;
    }
  }
  return out;
};

window.isIE = function() {
  var nav;
  nav = navigator.userAgent.toLowerCase();
  return (nav && nav.indexOf('msie') !== -1) || !!navigator.userAgent.match(/Trident.*rv\:11\./);
};

window.isEmpty = function(obj) {
  var key, val;
  if (!obj) {
    return true;
  }
  if (obj.length > 0) {
    return false;
  }
  if (obj.length === 0) {
    return true;
  }
  for (key in obj) {
    val = obj[key];
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      return false;
    }
  }
  return true;
};
