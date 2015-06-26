
app.config(function($stateProvider, $urlRouterProvider, $authProvider, $locationProvider, $sceDelegateProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from outer templates domain.
    assetsUrl + '**'
  ]);

  $stateProvider

    // route to show our landing page (/welcome)
    .state('welcome', {
      url: '/welcome',
      templateUrl: assetsUrl + 'partials/welcome.html',
      controller: function($scope, $localStorage, WishlistItems, Meta){
        if ($localStorage.gender){
          $scope.msg = "Welcome back!";
        } else {
          $scope.msg = "All The Best Stores - One Basket";
        };
        $scope.wishlist = $localStorage.wishlistItems;
        var animationDelay = 2500;

        animateHeadline($('.cd-headline'));

        function animateHeadline($headlines) {
          $headlines.each(function(){
            var headline = $(this);
            //trigger animation
            setTimeout(function(){ hideWord( headline.find('.is-visible') ) }, animationDelay);
            //other checks here ...
          });
        }

        function hideWord($word) {
          var nextWord = takeNext($word);
          switchWord($word, nextWord);
          setTimeout(function(){ hideWord(nextWord) }, animationDelay);
        }

        function takeNext($word) {
          return (!$word.is(':last-child')) ? $word.next() : $word.parent().children().eq(0);
        }

        function switchWord($oldWord, $newWord) {
          $oldWord.removeClass('is-visible').addClass('is-hidden');
          $newWord.removeClass('is-hidden').addClass('is-visible');
        }
      }
    })

    .state('admin', {
      url: '/admin',
      templateUrl: assetsUrl + 'partials/admin.html',
      onEnter: function(Admin){
        Admin.validateAdmin();
      }
    })

    .state('admin.new', {
      url: '/new',
      templateUrl: assetsUrl + 'partials/admin-new.html',
      controller: 'AdminController',
    })

    .state('admin.users', {
      url: '/users',
      templateUrl: assetsUrl + 'partials/users.html',
      controller: 'UserAdminController',
    })

    .state('userDetail', {
      url: '/users/{userID:[0-9]+}',
      templateUrl: assetsUrl + 'partials/user-detail.html',
      onEnter: function($stateParams, $state){
        if ($stateParams.userID === "") {
          $state.go('admin.users');
        }
      },
      controller: "UserDetailAdminController"
    })

    .state('editUser', {
      url: '/users/editUser',
      templateUrl: assetsUrl + 'partials/edit-user.html',
      controller: "UserDetailAdminController"
    })

    .state('admin.logOut', {
      url: '/logOut',
      templateUrl: assetsUrl + 'partials/admin-logOut.html',
      controller: function($scope, $localStorage, $state){
        $scope.signOutClick = function() {
          $scope.signOut();
          $localStorage.$reset();
          $state.go('account.signIn');
        };
      }
    })

    .state('admin.signIn', {
      url: '/sign-in',
      templateUrl: assetsUrl + 'partials/admin-sign-in.html',
      controller: 'AdminController'
    })

    .state('basket', {
      url: '/basket',
      templateUrl: assetsUrl + 'partials/basket.html',
      controller: 'BasketController'
    })

    .state('trends', {
      url: '/trends',
      templateUrl: assetsUrl + 'partials/trends.html',
      controller: 'TrendsController'
    })


    .state('trendView', {
      url: '/trends/:slug',
      templateUrl: assetsUrl + 'partials/trend-view.html',
      controller: 'TrendController'
    })

    .state('settings', {
      url: '/settings',
      templateUrl: assetsUrl + 'partials/user-settings.html',
      controller: 'UserSettingsController'
    })

    .state('pay', {
      abstract: true,
      url: '/pay',
      templateUrl: assetsUrl + 'partials/pay.html',
      controller: 'PaymentsController'
    })

    .state('mens', {
      url: '/mens',
      templateUrl: assetsUrl + 'partials/mobile-mens-categories.html',
      controller: 'MobileCatController'
    })

    .state('womens', {
      url: '/womens',
      templateUrl: assetsUrl + 'partials/mobile-womens-categories.html',
      controller: 'MobileCatController'
    })

    .state('pay.you', {
      url: '/you',
      templateUrl: assetsUrl + 'partials/you.html',
      controller: function($scope, $state, $localStorage){
        $scope.goToSignIn = function(){
          $localStorage.returnTo = "pay.address";
          $state.go("account.signIn");
        },
        $scope.goToSignUp = function(){
          $localStorage.returnTo = "pay.address";
          $state.go("account.signUp");
        }
      },
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('pay.address', {
      url: '/address',
      templateUrl: assetsUrl + 'partials/address.html',
      controller: function($scope, $state, $localStorage){
        $scope.localStorage = $localStorage;
        $scope.submitAddress = function(addressForm) {
          $localStorage.address = addressForm;
          $state.go('pay.billing')
        }
      },
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('pay.billing', {
      url: '/billing',
      templateUrl: assetsUrl + 'partials/billing.html',
      controller: function($scope, $state, $localStorage){
        $scope.localStorage = $localStorage;
        $scope.handleStripe = function(status, response){
          if(response.error) {
            if(response.error.message) {
              $scope.billingForm.error = response.error.message;
            } else {
              $scope.billingForm.error = response.error;
            }
          } else {
            // got stripe token, now charge it or smt
            $localStorage.token = response.id;
            $localStorage.last4 = $scope.number.slice(-4);
            $state.go('pay.confirmation');
          }
        };
        $scope.clear = function(){
          $localStorage.token = null;
        };
      },
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('pay.confirmation', {
      url: '/confirmation',
      templateUrl: assetsUrl + 'partials/confirmation.html',
      controller: function($scope, $localStorage, $state, $http, Basket, Deliveries){
        $scope.basket = Basket;
        $scope.deliveries = Deliveries;
        Basket.fetchBasketItemProducts();
        $scope.localStorage = $localStorage;
        $scope.submitOrder = function(){
          $scope.disabled = true;
          $http.post(backendUrl + "api/orders.json", {order: {
            token: $localStorage.token,
            basket: $localStorage.basketItems,
            deliveries: $localStorage.deliveries,
            address: $localStorage.address
          }}).success(function(){
            $state.go("pay.confirmed");
            Basket.reset();
          });
        }
      },
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('pay.confirmed', {
      url: "/confirmed",
      templateUrl: assetsUrl + 'partials/confirmed.html',
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('orders', {
      url: '/orders',
      templateUrl: assetsUrl + 'partials/orders.html',
      controller: 'OrdersController'
    })

    .state('account', {
      abstract: true,
      url: '/account',
      templateUrl: assetsUrl + 'partials/account.html'
    })

    .state('account.passwordReset', {
      url: '/password-reset?client_id&config&expiry&reset_password&token&uid',
      templateUrl: assetsUrl + 'partials/password-reset.html',
      controller: "UserRecoveryController"
    })

    .state('account.signIn', {
      url: '/sign-in',
      templateUrl: assetsUrl + 'partials/sign-in.html',
      controller: "UserSessionsController"
    })

    .state('account.signOut', {
      url: '/sign-in',
      templateUrl: assetsUrl + 'partials/sign-out.html',
      controller: "UserSessionsController"
    })

    .state('account.signUp', {
      url: '/sign-up',
      templateUrl: assetsUrl + 'partials/sign-up.html',
      controller: "UserRegistrationsController"
    })

    .state('account.forgottenPassword', {
      url: '/forgotten-password',
      templateUrl: assetsUrl + 'partials/forgotten-password.html',
      controller: "UserRecoveryController"
    })

    .state('account.delete', {
      url: '/destroy-account',
      templateUrl: assetsUrl + 'partials/destroy-account.html',
      controller: "UserRecoveryController"
    })

    .state('account.editDetails', {
      url: '/edit-user-details',
      templateUrl: assetsUrl + 'partials/edit-user-details.html',
      controller: "UserRecoveryController"
    })

    .state('products', {
      abstract: true,
      url: '/products',
      templateUrl: assetsUrl + 'partials/products.html'
    })

    .state('products.new', {
      url: '/new',
      templateUrl: assetsUrl + 'partials/new.html',
      controller: function(Filters, Products){
        Products.resetProducts();
        Filters.resetAll();
        Products.fetchProducts();
        setTimeout(function(){ window.scrollTo(0,Products.getLastScrollLocation()); }, 5);
      },
      onExit: function(Products){
        var lastScroll = document.body.scrollTop || document.documentElement.scrollTop
        Products.setLastScrollLocation(lastScroll)
      }
    })

    .state('products.hot', {
      url: '/hot',
      templateUrl: assetsUrl + 'partials/hot.html'
    })

    .state('products.saved', {
      url: '/saved',
      templateUrl: assetsUrl + 'partials/saved.html',
      controller: function($scope, WishlistItems, $auth, authModal){
        var callback = function(){
          return function(){
            $scope.wishlist = WishlistItems;
            WishlistItems.fetchWishlistItemProducts();
          }

        }
        var cb = callback()
        if ($auth.user.id) {
          cb()
        } else {

          var unsubscribe = $scope.$on('auth:login-success', function(ev){
            cb();
            authModal.deactivate();
            unsubscribe();
          })
          authModal.activate()

        }

        $scope.addToWishlist = function(product){
          WishlistItems.addToWishlistItems(product);
        };
      }
    })

    .state('categoryView', {
      url: '/products/:gender/{catID:[0-9]+}-{category}',
      templateUrl: assetsUrl + 'partials/category-view.html',
      controller: function($scope, $stateParams, Products, Filters, Categories){
        var genderVar;
        if ( $stateParams.gender === "male") {
          genderVar = "1";
        } else if ( $stateParams.gender === "female") {
          genderVar = "2";
        }
        $scope.category = $stateParams.category;
        Products.resetProducts();
        // Products.resetPage();
        Filters.resetAll();
        Filters.setFilter('category', $stateParams.catID);
        Filters.setFilter('gender', genderVar);
        Products.fetchProducts();
        setTimeout(function(){ window.scrollTo(0,Products.getLastScrollLocation()); }, 5);
      },
      onExit: function(Products){
        var lastScroll = document.body.scrollTop || document.documentElement.scrollTop;
        Products.setLastScrollLocation(lastScroll);
      }
    })

    .state('brands', {
      url: '/brands',
      templateUrl: assetsUrl + "partials/brands-index.html",
      controller: function($scope, Brands){
        $scope.brands = Brands;
        $scope.brands.fetchBrands();
      }
    })

    .state('brandView', {
      url: '/brands/{id:[0-9]+}-{brandId}',
      templateUrl: assetsUrl + "partials/brands-view.html",
      controller: "BrandController"
    })

    .state('brandCatView', {
      url: '/brands/{id:[0-9]+}-{brandId}/{catID:[0-9]+}-{category}',
      templateUrl: assetsUrl + "partials/brands-cat-view.html",
      controller: "BrandController"
    })

    .state('productDetail', {
      url: '/products/{productID:[0-9]+}-{slug}',
      templateUrl: assetsUrl + 'partials/product-detail.html',
      onEnter: function($stateParams, $state){
        if ($stateParams.productID === "") {
          $state.go('products.new');
        }
      },
      controller: "ProductDetailController"
    })

    .state('search', {
      url: '/search?searchString&category',
      templateUrl: assetsUrl + "partials/search-results.html",
      controller: function($scope, $stateParams, Products){
        $scope.searchString = $stateParams.searchString;
        Products.resetProducts();
        Products.fetchProducts();
        setTimeout(function(){ window.scrollTo(0,Products.getLastScrollLocation()); }, 5);
      },
      onExit: function(Products){
        var lastScroll = document.body.scrollTop || document.documentElement.scrollTop
        Products.setLastScrollLocation(lastScroll)
      }
    })

    .state('delivery', {
      url: '/delivery',
      templateUrl: assetsUrl + "partials/delivery.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('returns', {
      url: '/returns',
      templateUrl: assetsUrl + "partials/returns.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('about', {
      url: '/about',
      templateUrl: assetsUrl + "partials/about.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('pricePromise', {
      url: '/price-promise',
      templateUrl: assetsUrl + "partials/price-promise.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('stores-list', {
      url: '/stores-list',
      templateUrl: assetsUrl + "partials/stores-list.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('contact', {
      url: '/contact',
      templateUrl: assetsUrl + "partials/contact.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('terms', {
      url: '/terms',
      templateUrl: assetsUrl + "partials/terms.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('privacy', {
      url: '/privacy',
      templateUrl: assetsUrl + "partials/privacy.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    });



  // catch all route
  // send users to the form page
  $urlRouterProvider
    .when('/admin', 'admin/new')
    .when('/products', 'products/new')
    .when('/account', 'account/sign-in')
    .when('/pay', 'pay/you')
    .otherwise('/welcome');

  $authProvider.configure([
  {
    default: {
      apiUrl: backendUrl + 'api',
      passwordResetSuccessUrl: window.location.protocol + '//' + window.location.host + '/account/password-reset',
      authProviderPaths: {
        facebook: '/auth/facebook'
      }
    }
  }, {
    admin: {
      apiUrl:                backendUrl + 'api',
      signOutUrl:            '/admin_auth/sign_out',
      emailSignInPath:       '/admin_auth/sign_in',
      emailRegistrationPath: '/admin_auth',
      accountUpdatePath:     '/admin_auth',
      accountDeletePath:     '/admin_auth',
      passwordResetPath:     '/admin_auth/password',
      passwordUpdatePath:    '/admin_auth/password',
      tokenValidationPath:   '/admin_auth/validate_token',
      authProviderPaths: {
        facebook:  '/admin_auth/facebook'
      }
    }
  }
  ]);

  $locationProvider.html5Mode(true);
  $locationProvider.hashPrefix('!');
});

app.run(function($rootScope, $location, Meta) {
  $rootScope.$on("$stateChangeSuccess", function(event, toState, toParams, fromState, fromParams) {
    ga('send', 'pageview', $location.path());
    Meta.set("url", $location.protocol() + '://' + $location.host() + $location.path());
  });
});
