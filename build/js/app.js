var app = angular.module('App', ['infinite-scroll', 'ngSanitize', 'btford.markdown', 'ui.router', 'ng-token-auth', 'ipCookie', 'ngStorage', 'angularPayments', 'btford.modal', 'akoenig.deckgrid', 'selectize', 'btford.socket-io']);
var backendUrl = "http://localhost:3000/";
var assetsUrl = 'http://localhost:9000/';
var scraperUrl = 'http://localhost:5000/';
var socketsUrl = 'http://localhost:8080';
Stripe.setPublishableKey('pk_test_mfQJDA4oT57DLFi7l0HYu782');


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

    .state('admin.dataFeeds', {
      url: '/data_feeds',
      templateUrl: assetsUrl + 'partials/data-feeds.html',
      controller: 'AdminDataFeedsController'
    })

    .state('admin.users', {
      url: '/users',
      templateUrl: assetsUrl + 'partials/users.html',
      controller: 'UserAdminController'
    })

    .state('admin.userDetail', {
      url: '/users/{userID:[0-9]+}',
      templateUrl: assetsUrl + 'partials/user-detail.html',
      onEnter: function($stateParams, $state){
        if ($stateParams.userID === "") {
          $state.go('admin.users');
        }
      },
      controller: "UserDetailAdminController",
      onExit: function(Admin){
        Admin.clearMessages();
      }
    })

    .state('admin.addRecommendation', {
      url: '/users/{userID:[0-9]+}/addRecommendation',
      templateUrl: assetsUrl + 'partials/recommendation.html',
      onEnter: function($stateParams, $state){
        if ($stateParams.userID === "") {
          $state.go('admin.users');
        }
      },
      controller: "UserDetailAdminController"
    })

    .state('admin.viewRecommendation', {
      url: '/users/{userID:[0-9]+}/recommendations/{recommendationID:[0-9]+}',
      templateUrl: assetsUrl + 'partials/recommendation-view.html',
      controller: 'RecommendationsController'
    })

    .state('admin.editUser', {
      url: '/users/{userID:[0-9]+}/editUser',
      templateUrl: assetsUrl + 'partials/edit-user.html',
      onEnter: function($stateParams, $state){
        if ($stateParams.userID === "") {
          $state.go('admin.users');
        }
      },
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
      },
      tokenFormat: {
        "access-token": "{{ token }}",
        "token-type":   "Bearer",
        "client":       "{{ clientId }}",
        "expiry":       "{{ expiry }}",
        "uid":          "{{ uid }}"
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

app.directive('ngNavBar', function(){
  return {
    restrict: 'A',
    templateUrl: assetsUrl + 'templates/nav-bar-template.html',
    replace: true,
    transclude: true,
    compile: function() {
      var menuToggle = $('#js-mobile-menu').unbind();
      $('#js-navigation-menu').removeClass("show");

      menuToggle.on('click', function(e) {
        e.preventDefault();
        $('#js-navigation-menu').slideToggle(function(){
          if($('#js-navigation-menu').is(':hidden')) {
            $('#js-navigation-menu').removeAttr('style');
          }
        });
      });
      $('.nav-link a').on('click', function(e) {
        e.preventDefault();
        $('#js-navigation-menu').slideToggle(function(){
          if($('#js-navigation-menu').is(':hidden')) {
            $('#js-navigation-menu').removeAttr('style');
            window.scrollTo(0,0);
          }
        });
      });
    }
  }
});

app.directive('ngCallouts', function(){
  return {
    restrict: 'A',
    templateUrl: assetsUrl + 'templates/callouts-template.html',
    replace: true,
    transclude: true,
    compile: function(){
      $(document).foundation('equalizer', 'reflow');
    }
  }
});

app.directive('ngFeaturedCategories', function(){
  return {
    restrict: 'A',
    templateUrl: assetsUrl + 'templates/featured-categories-template.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngFooter', function(){
  return {
    restrict: 'A',
    templateUrl: assetsUrl + 'templates/footer-template.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngSizeDropdown', function(){
  return {
    restrict: 'A',
    templateUrl: assetsUrl + 'templates/size-dropdown.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMoreLikeThis', function(){
  return {
    restrict: 'A',
    templateUrl: assetsUrl + 'templates/more-like-this.html',
    replace: true,
    transclude: true
  }
})

app.directive('ngProductDetails', function(){
  return {
    restrict: 'A',
    templateUrl: assetsUrl + 'templates/product-details.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngProductList', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/product-list.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngFilters', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/filters.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngGenderFilter', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/gender-filter.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMaterialsFilter', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/materials-filter.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngCategoryFilter', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/category-filter.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngSubCategoryFilter', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/sub-category-filter.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngStylesFilter', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/styles-filter.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngColorsFilter', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/colors-filter.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngBrandsFilter', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/brands-filter.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngSortBy', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/sort-by.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTitle', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/meta-title.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaDescription', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/meta-description.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterCard', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:card" content="product">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterSite', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:site" content="@FetchMyFashion">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterTitle', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/meta-twitter-title.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterDescription', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/meta-twitter-description.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterCreator', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:creator" content="@FetchMyFashion">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterImage', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:image" content="{{ meta.content().imageUrl }}">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterPrice', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/meta-twitter-price.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterPriceLabel', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:label1" content="Price">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterData', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:data2" content="{{ meta.content().sizes }}">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaTwitterDataLabel', function(){
  return {
    restrict: "A",
    template: '<meta name="twitter:label2" content="Sizes">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaSchemaName', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/meta-schema-name.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaSchemaDescription', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/meta-schema-description.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaSchemaImage', function(){
  return {
    restrict: "A",
    template: '<meta itemprop="image" content="{{ meta.content().imageUrl }}">',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaOgTitle', function(){
  return {
    restrict: "A",
    template: '<meta property="og:title" content="{{ meta.content().title }}" />',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaOgType', function(){
  return {
    restrict: "A",
    template: '<meta property="og:type" content="product" />',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaOgUrl', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/meta-og-url.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaOgImage', function(){
  return {
    restrict: "A",
    template: '<meta property="og:image" content="{{ meta.content().imageUrl }}" />',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaOgDescription', function(){
  return {
    restrict: "A",
    template: '<meta property="og:description" content="{{ meta.content().description }}" />',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaOgSiteName', function(){
  return {
    restrict: "A",
    template: '<meta property="og:site_name" content="Fetch my Fashion" />',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaOgPriceAmount', function(){
  return {
    restrict: "A",
    templateUrl: assetsUrl + 'templates/meta-og-price-amount.html',
    replace: true,
    transclude: true
  }
});

app.directive('ngMetaOgPriceCurrency', function(){
  return {
    restrict: "A",
    template: '<meta property="product:price:currency" content="GBP" />',
    replace: true,
    transclude: true
  }
});
app.factory('Filters', ['$location', function($location){
  // Hacky way to prevent location being set to empty string causing refresh
  var filters = {};
  var lastResetFrom;
  return {
    getFilters: function(){
      return filters;
    },
    setFilter: function(name, value){
      var changed = filters[name] !== value
      filters[name] = value;
      return changed;
    },
    removeFilter: function(name){
      var changed = !!filters[name]
      delete filters[name];
      return changed;
    },
    useQuery: function(query){
      filters = query;
    },
    resetAll: function(hard){
      if (hard) {
        filters = {gender: filters.gender};
        lastResetFrom = $location.absUrl();
      } else if (lastResetFrom !== $location.absUrl()) {
        filters = {gender: filters.gender};
        lastResetFrom = $location.absUrl();
      }
    }
  };
}]);

app.factory('Users', ['$http', function($http){
  var users = [];
  var page = 1;
  return{
    fetchUsers: function(){
      $http.get(backendUrl + 'api/users.json', {async: true, params:{page: page}}).success(function(data){
        users = data;
      });
    },
    list: function(){
      return users;
    },
    increment: function(){
      page++;
    },
    decrement: function(){
      page--;
    }
  };
}]);

app.factory('UserToEdit', ['$http', '$rootScope', function($http, $rootScope){
  var user = [];
  return{
    fetchUser: function(id){
      $http.get(backendUrl + 'api/users/' + id + '.json', {async: true})
      .success(function(data){
        user = data;
        $rootScope.$broadcast('userToEditLoaded');
      });
    },
    list: function(){
      return user;
    }
  };
}]);


app.factory('Trends', [ '$http', 'Products', 'Filters', function($http, Products, Filters){
  var trends = [];
  return {
    fetchTrends: function(){
      $http.get(backendUrl + 'features.json', {async: true}).success(function(data){
        trends = data;
      });
    },
    list: function(){
      return trends;
    }
  };
}]);


app.factory('Admin', [ '$http', '$auth', '$state', '$rootScope', function($http, $auth, $state, $rootScope){
  var messages = [];
  return {
    validateAdmin: function(){
      $auth.validateUser()
      .then(function(resp){
        if (!resp.configName || resp.configName != "admin"){
          $state.go('welcome');
        } else if ($state.$current == 'admin') {
          $state.go('admin.new');
        }
      })
      .catch(function(resp){
        $state.go('admin.signIn');
      });
    },
    fetchMessages: function(customerId){
      $http.get(backendUrl + 'api/messages.json', {async: true, params:{user_id: customerId}})
        .success(function(data){
          messages = data;
        });
    },
    listMessages: function(){
      return messages;
    },
    sendMessage: function(customerId, content){
      $http.post(backendUrl + 'api/messages/admin_message.json', {async: true, message:{user_id: customerId, text: content, seen: false}})
        .success(function(data){
          $rootScope.$broadcast('newMessage');
        });
    },
    clearMessages: function(){
      messages = [];
    }
  };
}]);

app.factory('Recommendations', ['$http', '$state', function($http, $state){
  var recommendations = [];
  return {
    createRecommendation: function(rec){
      $http.post(backendUrl + 'recommendations.json', {async: true, recommendation: rec})
        .success(function(data){
          $state.go('admin.viewRecommendation', {userID: data.user_id, recommendationID: data.id});
        });
    },
    fetchRecommendations: function(customerId){
      $http.get(backendUrl + 'api/recommendations.json', {async: true, params:{user_id: customerId}})
        .success(function(data){
          recommendations = data;
        });
    },
    list: function(){
      return recommendations;
    }
  };
}]);

app.factory('Categories', [ '$http', '$rootScope', function($http, $rootScope){
  var categories = [];
  var loaded = false;
  return {
    fetchCategories: function(dataHolder){
      $http.get(backendUrl + 'categories.json', {async: true}).success(function(data){
        categories = data;
        if (!loaded) { $rootScope.$broadcast('catsLoaded'); loaded = true; }
        if (!!dataHolder) {$rootScope.$broadcast('categoriesReceived', dataHolder);}
      });
    },
    list: function(){
      return categories;
    },
    addCount: function(newArr){
      var array = [];
      _.map(categories, function(n){
        _.forEach(newArr, function(v){
          if (v.name == n.name){
            n.count = v.count;
            n.displayName = n.name + ' ' + '(' + n.count + ')';
          }
        });
        if (!n.count){
          n.count = 0;
          n.displayName = n.name;
        }
      });
      $rootScope.$broadcast('catsLoaded');
    }
  };
}]);

app.factory('Colors', [ '$http', '$rootScope', function($http, $rootScope){
  var colors = [];
  var loaded = false;
  return {
    fetchColors: function(dataHolder){
      $http.get(backendUrl + 'colors.json', {async: true}).success(function(data){
        colors = data;
        if (!loaded) {$rootScope.$broadcast('colorsLoaded'); loaded = true;}
        if (!!dataHolder) {$rootScope.$broadcast('colorsReceived', dataHolder);}
      });
    },
    list: function(){
      return colors;
    },
    addCount: function(newArr){
      var array = [];
      _.map(colors, function(n){
        _.forEach(newArr, function(v){
          if (v.name == n.name){
            n.count = v.count;
            n.displayName = n.name + ' ' + '(' + n.count + ')';
          }
        });
        if (!n.count){
          n.count = 0;
          n.displayName = n.name;
        }
      });
      $rootScope.$broadcast('colorsLoaded');
    }
  };
}]);

app.factory('Materials', [ '$http', '$rootScope', function($http, $rootScope){
  var materials = [];
  var loaded = false;
  return {
    fetchMaterials: function(dataHolder){
      $http.get(backendUrl + 'materials.json', {async: true}).success(function(data){
        materials = data;
        if (!loaded) {$rootScope.$broadcast('materialsLoaded'); loaded = true;}
        if (!!dataHolder) {$rootScope.$broadcast('materialsReceived', dataHolder);}
      });
    },
    list: function(){
      return materials;
    },
    addCount: function(newArr){
      var array = [];
      _.map(materials, function(n){
        _.forEach(newArr, function(v){
          if (v.name == n.name){
            n.count = v.count;
            n.displayName = n.name + ' ' + '(' + n.count + ')';
          }
        });
        if (!n.count){
          n.count = 0;
          n.displayName = n.name;
        }
      });
      $rootScope.$broadcast('materialsLoaded');
    }
  };
}]);

app.factory('Stores', [ '$http', function($http){
  var stores = [];
  return {
    fetchStores: function(){
      $http.get(backendUrl + 'stores.json', {async: true}).success(function(data){
        stores = data;
      });
    },
    list: function(){
      return stores;
    },
    listStoresForProducts: function(products){
      var storeIDs = _.map(products, function(p){
        return p.store_id
      });
      storeIDs = _.uniq(storeIDs);
      var s = _.filter(stores, function(str){
        return (_.indexOf(storeIDs, str.id) > -1)
      });
      return s;
    },
    calcStdDeliveryPrice: function(store, products){
      var productsForStore = _.filter(products, function(p){
        return (p.store_id === store.id)
      });
      var totalSpendForStore = 0;
      _.forEach(productsForStore, function(p){
        totalSpendForStore += parseFloat(p.display_price);
      });
      if (parseFloat(store.free_delivery_threshold) < totalSpendForStore){
        return 0
      } else {
        return store.standard_price
      }
    }
  }
}]);

app.factory('Deliveries', ['$localStorage', function($localStorage){
  if (!$localStorage.deliveries){
    $localStorage.deliveries = [];
  };
  return {
    list: function(){
      return $localStorage.deliveries
    },
    addDelivery: function(delivery, store){
      delivery = JSON.parse('{' + delivery + '}');
      var holdingArr = _.reject($localStorage.deliveries, function(d){
        return (d.store == store.id);
      });
      if (delivery.type) {
        holdingArr.push(delivery);
      }
      $localStorage.deliveries = holdingArr;
    },
    reset: function(){
      $localStorage.deliveries = [];
    },
    total: function(){
      if ($localStorage.deliveries.length > 0) {
        var total = 0;
         _.forEach($localStorage.deliveries, function(n) {
          total += n.price;
        });
        return total;
      } else {
        return 0;
      }

    }
  };
}]);


app.factory('SubCategories', [ '$http', 'Filters', '$rootScope', function($http, Filters, $rootScope){
  var subCategories = [];
  return {
    fetchSubCategories: function(){
      $http.get(backendUrl + 'sub_categories.json', {async: true}).success(function(data){
        subCategories = data;
        $rootScope.$broadcast('subCatsLoaded');
      });
    },
    list: function(){
      return subCategories;
    },
    availableList: function(){
      return _.filter(subCategories, function(subCat){
        return subCat.category_id == Filters.getFilters().category;
      });
    }
  };
}]);

app.factory('Styles', [ '$http', 'Filters', '$rootScope', function($http, Filters, $rootScope){
  var styles = [];
  var loaded = false;
  return {
    fetchStyles: function(dataHolder){
      $http.get(backendUrl + 'styles.json', {async: true}).success(function(data){
        styles = data;
        if (!loaded) {$rootScope.$broadcast('stylesLoaded'); loaded = true;}
        if (!!dataHolder) {$rootScope.$broadcast('stylesReceived', dataHolder);}
      });
    },
    list: function(){
      return styles;
    },
    availableList: function(){
      return _.filter(styles, function(style){
        return style.category_id == Filters.getFilters().category;
      });
    },
    addCount: function(newArr){
      var array = [];
      _.map(styles, function(n){
        _.forEach(newArr, function(v){
          if (v.name == n.name){
            n.count = v.count;
            n.displayName = n.name + ' ' + '(' + n.count + ')';
          }
        });
        if (!n.count){
          n.count = 0;
          n.displayName = n.name;
        }
      });
      $rootScope.$broadcast('stylesLoaded');
    }
  };
}]);

app.factory('Orders', [ '$http', function($http){
  var orders = [];
  return {
    fetchOrders: function(){
      $http.get(backendUrl + 'api/orders.json', {async: true}).success(function(data){
        orders = data;
      });
    },
    list: function(){
      return orders;
    }
  };
}]);

app.factory('WishlistItems', [ '$http', '$localStorage', function($http, $localStorage){
  var wishlistItems = [];
  $http.get(backendUrl + 'api/wishlist_items.json').success(function(data){
        wishlistItems = data;
  });
  return {
    update: function(array) {
      $localStorage.wishlistItems = array;
    },
    fetchWishlistItemProducts: function(){
      $http.get(backendUrl + 'api/wishlist_items.json').success(function(data){
        wishlistItems = data;
      });
    },
    listProducts: function(){
      return _.map(wishlistItems, function(wl){
        return wl.product;
      });
    },
    list: function(){
      return wishlistItems;
    },
    wishedFor: function(productId){
      var ans =  _.find(wishlistItems, function(wl){
        return wl.product.id == productId;
      })
      return !(ans === undefined);
    },
    addToWishlistItems: function(product){

      var wli = _.find(wishlistItems, function(wl){
        return wl.product.id === product.id;
      })
      if ( wli === undefined ) {
        $http.post(backendUrl + 'api/wishlist_items.json', {async: true, params: {
                                                                              product_id: product.id
                                                                              }})
          .success(function(data){
            wishlistItems.push(data)
          });

      } else {

        $http.delete(backendUrl + 'api/wishlist_items/' + wli.id + '.json', {async: true})
          .success(function(data){
            wishlistItems = _.reject(wishlistItems, function(wl){
              return wl.id === wli.id
            })
          })

      }
    }
  }
}]);

app.factory('Basket', [ '$http', '$localStorage', function($http, $localStorage){
  if (!$localStorage.basketItems){
    $localStorage.basketItems = [];
  };
  var products = [];
  return {
    reset: function(){
      products = [];
      $localStorage.basketItems = [];
    },
    update: function(array) {
      $localStorage.basketItems = array;
    },
    fetchBasketItemProducts: function(){
      products = [];
      var basketItems = $localStorage.basketItems;
      _.forEach(basketItems, function(item){
        $http.get(backendUrl + 'products/' + item.productId + '.json').success(function(data){
          data.selectedSize = item.sizeName;
          products.push(data);
        });
      });
    },
    listProducts: function(){
      return products;
    },
    listStores: function(){
      return stores;
    },
    list: function(){
      return $localStorage.basketItems;
    },
    total: function(){
      var result = 0.0;
      _.forEach(products, function(p){
        result += parseFloat(p.display_price)
      });
      return result
    },
    addToBasketItems: function(product){
      var basketItems = $localStorage.basketItems;
      var productWithSize = {
        productId: product.id,
        sizeName: product.selectedSize.name
      }
      basketItems.push(productWithSize);
      $localStorage.basketItems = basketItems;
    },
    removeFromBasketItems: function(product){
      var basketItems = $localStorage.basketItems;
      basketItems = _.reject(basketItems, function(n){
        return n.productId == product.id
      });
      $localStorage.basketItems = basketItems;
      products = _.reject(products, function(p){
        return p === product;
      })
    },
    inBasketItems: function(productID){
      return _.some(products, { 'id': productID });
    }
  }
}]);

app.factory('Products', ['$http', 'Filters', '$location', 'Colors', 'Brands', '$rootScope', 'Materials', 'Categories', 'Styles', function($http, Filters, $location, Colors, Brands, $rootScope, Materials, Categories, Styles){

  var query = $location.search();
  Filters.useQuery(query);
  var factory = this;
  var products = [];
  var page = 1;
  var searching = true;
  var scrollActive = false;
  var lastScrollLocation = 0;
  var lastResetFrom;
  return {
    setLastScrollLocation: function(y) {
      lastScrollLocation = y
    },
    getLastScrollLocation: function() {
      return lastScrollLocation
    },
    scrollActive: function(){
      return scrollActive;
    },
    setScrollActive: function(val){
      scrollActive = val;
    },
    getProducts: function(){
      return products;
    },
    currentPage: function(){
      return page;
    },
    currentlySearching: function(){
      return searching;
    },
    enumeratePage: function(){
      page += 1;
    },
    resetProducts: function(hard){
      if (hard) {
        products = [];
        scrollActive = false;
        lastResetFrom = $location.absUrl();
        page = 1
        lastScrollLocation = 0
      } else if ($location.absUrl() !== lastResetFrom) {
        products = [];
        scrollActive = false;
        lastResetFrom = $location.absUrl();
        page = 1;
        lastScrollLocation = 0;
      } else {
        lastScrollLocation = lastScrollLocation;
      }
    },
    resetPage: function(){
      page = 1;
    },
    addProducts: function(newProducts){
      products = products.concat(newProducts);
    },
    fetchProducts: function(){
      searching = true;
      $http.get(backendUrl + 'products.json', { async: true,
                                                params: {
                                                  page: page.toString(),
                                                  filters: {
                                                    gender_id: Filters.getFilters().gender,
                                                    brand_id: Filters.getFilters().brand,
                                                    category_id: Filters.getFilters().category,
                                                    sub_category_id: Filters.getFilters().subCategory,
                                                    color_id: Filters.getFilters().color,
                                                    material_id: Filters.getFilters().material,
                                                    style_id: Filters.getFilters().style,
                                                    brand_id: Filters.getFilters().brand,
                                                    out_of_stock: false,
                                                    has_sizes: true
                                                  },
                                                  sort: Filters.getFilters().sort,
                                                  search_string: Filters.getFilters().searchString

                                                }}).success(function(data){
                                                  if (data.colors && data.colors.length > 0) {
                                                    Colors.fetchColors(data.colors);
                                                  }
                                                  if (data.categories && data.categories.length > 0) {
                                                    Categories.fetchCategories(data.categories);
                                                  }
                                                  if (data.materials && data.materials.length > 0) {
                                                    Materials.fetchMaterials(data.materials);
                                                  }
                                                  if (data.brands && data.brands.length > 0) {
                                                    Brands.fetchBrands(data.brands);
                                                  }
                                                  if (data.styles && data.styles.length > 0) {
                                                    Styles.fetchStyles(data.styles);                                                  }
                                                  if (data.products.length > 0) {
                                                    products = products.concat(data.products);
                                                    page += 1;
                                                    scrollActive = true;
                                                    searching = false;
                                                  } else {
                                                    scrollActive = false;
                                                    searching = false;
                                                  }

      });
    },
    currentlySearching: function(){
      return searching;
    }
  };
}]);

app.factory('MoreLikeThis', ['$http', '$rootScope', function($http, $rootScope){
  var moreLikeThis = [];
  return {
    getMoreLikeThis: function(){
      return moreLikeThis;
    },
    fetchMoreLikeThis: function(item){
      searching = true;
      $http.get(backendUrl + 'more_like_this.json', { async: true,
                                                      params: {
                                                        id: item.id
                                                      }
                                                    })
                                                    .success(function(data){
                                                      moreLikeThis = [];
                                                      moreLikeThis = moreLikeThis.concat(data);
                                                      moreLikeThis = _.reject(moreLikeThis, {'id': item.id});
                                                      $rootScope.$broadcast('moreLikeThisLoaded');
                                                    });
    }
  };
}]);

app.factory('Brands', ['$http', '$rootScope', function($http, $rootScope){
  var o = {};
  o.brands = [];
  o.loaded = false;
  o.fetchBrands = function(dataHolder){
    $http.get(backendUrl + 'brands.json', { async: true }).success(function(data){
      o.brands = data;
      if (!o.loaded) {$rootScope.$broadcast('brandsLoaded'); o.loaded = true;}
      if (!!dataHolder) {$rootScope.$broadcast('brandsReceived', dataHolder);}
    });
  };

  o.formattedList = function(){
    return _.groupBy(o.brands, function(br){
      return br.name[0].toLowerCase();
    });
  };

  o.list = function(){
    return o.brands;
  };

  o.addCount = function(newArr){
    var array = [];
    _.map(o.brands, function(n){
      _.forEach(newArr, function(v){
        if (v.name == n.name){
          n.count = v.count;
          n.displayName = n.name + ' ' + '(' + n.count + ')';
        }
      });
      if (!n.count){
        n.count = 0;
        n.displayName = n.name;
      }
    });
    $rootScope.$broadcast('brandsLoaded');
  };

  return o;
}]);

app.factory('Meta', function(){
  content = {};
  return {
    content: function(){
      return content;
    },
    set: function(setter, value){
      content[setter] = value;
    }
  };
});

app.factory('authModal', function (btfModal) {
  return btfModal({
    controller: 'AuthModalCtrl',
    controllerAs: 'modal',
    templateUrl: assetsUrl + 'partials/auth-modal.html'
  });
});

app.factory('mySocket', function (socketFactory) {
  var myIoSocket = io.connect(socketsUrl);

  mySocket = socketFactory({
    ioSocket: myIoSocket
  });
  mySocket.forward('admin_news');
  return mySocket;
});

app.controller('UserSessionsController', ['$scope', '$state', '$auth', '$localStorage', 'authModal', 'WishlistItems', function ($scope, $state, $auth, $localStorage, authModal, WishlistItems) {
  $scope.$on('auth:login-error', function(ev, reason) {
    $scope.error = reason.errors[0];
  });

  $scope.$on('auth:login-success', function(ev){
    ga('send', 'event', 'users', 'signedIn');
    WishlistItems.fetchWishlistItemProducts()
    if ($localStorage.returnTo) {
      $state.go($localStorage.returnTo);
      delete $localStorage.returnTo;
    } else if (authModal.active()) {
      return
    } else {
      $state.go('products.new');
    }

  });

  $scope.handleLoginBtnClick = function() {
    $auth.submitLogin($scope.loginForm)
      .then(function(resp) {
        console.log(resp);
      })
      .catch(function(resp) {
       //$scope.error = resp;
      });
  };

  $scope.handleFacebookBtnClick = function() {
    $auth.authenticate('facebook')
      .then(function(resp) {

      })
      .catch(function(resp) {

      })
  };

  $scope.loginClick = function() {
    $scope.submit = true;
    if ($scope.login.$valid){
      $scope.handleLoginBtnClick();
    }
  };

  $scope.signOutClick = function() {
    $scope.signOut();
    $localStorage.$reset();
    $state.go('account.signIn');
  };
}]);

app.controller('AdminController', ['$scope', '$auth', function($scope, $auth){

  $scope.handleRegBtnClick = function() {
    $auth.submitRegistration($scope.registrationForm, {config: 'admin'})
      .then(function(resp) {
        console.log("Worked");
      })
      .catch(function(resp) {
        console.log("Error");
      });
    };

  $scope.buttonClick = function() {
    $scope.submitted = true;
    if ($scope.registration.$valid){
      $scope.handleRegBtnClick();
    }
  };

  $scope.handleLoginBtnClick = function() {
  $auth.submitLogin($scope.loginForm, {config: 'admin'})
    .then(function(resp) {

    })
    .catch(function(resp) {

    });
  };
}]);

app.controller('UserAdminController', ['$scope', 'Users', function($scope, Users){
  Users.fetchUsers();
  $scope.users = Users;

  $scope.$on('socket:admin_news', function (ev, data) {
    var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
    snd.play();
    $scope.users.fetchUsers();
  });

  $scope.incrementPage = function() {
    $scope.users.increment();
    $scope.users.fetchUsers();
  };

  $scope.decrementPage = function() {
    $scope.users.decrement();
    $scope.users.fetchUsers();
  };
}]);

app.controller('UserDetailAdminController', ['$scope', 'Users', '$stateParams', '$http', '$state', 'Admin', '$rootScope', 'Recommendations', 'UserToEdit', '$auth', 'mySocket', function($scope, Users, $stateParams, $http, $state, Admin, $rootScope, Recommendations, UserToEdit, $auth, mySocket){
  $scope.id = $stateParams.userID;
  $scope.admin = Admin;
  $scope.recommendations = Recommendations;
  $scope.userToEdit = UserToEdit;
  $scope.openChat = false;
  $scope.openRecommendations = false;


  $rootScope.$on('newMessage', function(){
    Admin.fetchMessages($scope.id);
    $scope.messageText = ""
  });

  $scope.$on('socket:admin_news', function (ev, data) {
    if (data.toUser == $scope.id) {
      var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
      snd.play();
      Admin.fetchMessages($scope.id);
    } else {
      var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");
      snd.play();
      setTimeout(function(){snd.play()}, 500);
      setTimeout(function(){snd.play()}, 1000);
    }

  });

  $rootScope.$on('userToEditLoaded', function(){
    $scope.userToEdit = UserToEdit.list();
  });

  if ($state.current.name == "admin.userDetail"){
    UserToEdit.fetchUser($scope.id);
    Admin.fetchMessages($scope.id);
    Recommendations.fetchRecommendations($scope.id);
  }

  $scope.sendMessage = function(messageText) {
    Admin.sendMessage($scope.id, messageText);
  };

  $scope.createRecommendation = function(){
    $scope.recommendation.sender_id = $scope.user.id;
    Recommendations.createRecommendation($scope.recommendation);
  };

  $scope.openC = function(){
    if ($scope.openRecommendations === true){
      $scope.openRecommendations = false;
      $scope.openChat = !$scope.openChat;
    }else{
      $scope.openChat = !$scope.openChat;
    }
  };

  $scope.openR = function(){
    if ($scope.openChat === true){
      $scope.openChat = false;
      $scope.openRecommendations = !$scope.openRecommendations;
    }else{
      $scope.openRecommendations = !$scope.openRecommendations;
    }
  };

  $scope.handleUpdateAccountBtnClick = function() {
    console.log($scope.updateAccountForm);
    $auth.updateAccount($scope.updateAccountForm, {config: 'user'})
      .then(function(resp) {
        console.log(resp);
      })
      .catch(function(resp) {
        console.log(resp);
      });
  };
}]);

app.controller('UserRegistrationsController', ['$scope', '$state', '$auth', '$localStorage', function($scope, $state, $auth, $localStorage) {
  $scope.$on('auth:registration-email-error', function(ev, reason) {
    $scope.error = reason.errors.full_messages[0];
  });

  $scope.$on('auth:registration-email-success', function(ev, message){
    ga('send', 'event', 'users', 'signedUp');
    $auth.submitLogin({
      email: $scope.registrationForm.email,
      password: $scope.registrationForm.password
    });
  });

  $scope.handleRegBtnClick = function() {
    $auth.submitRegistration($scope.registrationForm)
      .then(function(resp) {
        // ga('send', 'event', 'users', 'signUp');
      })
      .catch(function(resp) {
        //$scope.error = resp
      });
    };

  $scope.buttonClick = function() {
    $scope.submitted = true;
    if ($scope.registration.$valid){
      $scope.handleRegBtnClick();
    }
  };
}]);

app.controller('UserRecoveryController', ['$stateParams','$state', '$scope', '$auth', function($stateParams, $state, $scope, $auth){
  $scope.handlePwdResetBtnClick = function() {
    $auth.requestPasswordReset($scope.passwordResetForm)
      .success(function(resp) {
        $scope.result = "You'll receive an email with a link shortly, didn't receive an email? Click the button below"
      })
      .error(function(resp) {
        $scope.error = resp.errors[0];
      });
  };

  $scope.handleUpdatePasswordBtnClick = function() {
    $auth.updatePassword($scope.changePasswordForm)
      .then(function(resp) {
        $scope.result = "Password Updated"
      })
      .catch(function(resp) {
        $scope.error = resp.data.errors[0];
      });
  };

  $scope.handleDestroyAccountBtnClick = function() {
    $auth.destroyAccount()
      .then(function(resp) {
        $scope.result = "Your account has been closed"
      })
      .catch(function(resp) {
        $scope.error = resp.data.errors[0];
      });
  };

  $scope.handleUpdateAccountBtnClick = function() {
    $auth.updateAccount($scope.updateAccountForm)
      .then(function(resp) {
        $scope.result = "Details updated successfully";
      })
      .catch(function(resp) {
        if (resp.data.errors.name)
          {
            $scope.nameError = resp.data.errors.name[0]
          }else{
            $scope.emailError = resp.data.errors.email[0]
          };
      });
  };
}]);

app.controller('TrendsController', ['$state', '$scope', 'Trends','Filters', function($state, $scope, Trends, Filters){
  $scope.trends = [];
  Trends.fetchTrends();
  $scope.trends = Trends;
  $scope.trend = Trends.list();

}]);

app.controller('TrendController', ['$http', '$stateParams', '$scope', 'Products', 'Filters', 'Trends', 'Meta', function($http, $stateParams, $scope, Products, Filters, Trends, Meta){
  Products.resetProducts();
  Filters.resetAll();
  Filters.removeFilter('gender');
  $http.get(backendUrl + 'features/' + $stateParams.slug + '.json').success(function(data){
    $scope.trend = data;
    // if ($scope.trend.gender_id) Filters.setFilter("gender", $scope.trend.gender_id);
    if ($scope.trend.brand_id) Filters.setFilter("brand", $scope.trend.brand_id);
    if ($scope.trend.search_string) Filters.setFilter("searchString", $scope.trend.search_string);
    if ($scope.trend.category_id) Filters.setFilter("category", $scope.trend.category_id);
    Meta.set("title", "Check out " + data.title + " and other trends at Fetch my Fashion");
    Meta.set("description", data.copy);
    Meta.set("imageUrl", data.image_url);
    Products.fetchProducts();
  });
}]);

app.controller('ProductsController',  ['$scope', '$http', '$state', 'Filters', 'Products', 'WishlistItems', '$localStorage', 'authModal', '$auth', function($scope, $http, $state, Filters, Products, WishlistItems, $localStorage, authModal, $auth){
  var productCtrl = this;
  productCtrl.products = Products;
  // WishlistItems.fetchWishlistItems();
  this.filters = Filters;

  this.viewProduct = function(product) {
    $state.go('productDetail', {productID: product.id})
  };

  this.addToWishlist = function(product){
    var callback = function(product){
      return function(){
        WishlistItems.addToWishlistItems(product);
        ga('send', 'event', 'products', 'addToWishlist', product.name);
      }
    }

    var cb = callback(product)

    if ($auth.user.id) {
      cb();
    } else {

      var unsubscribe = $scope.$on('auth:login-success', function(ev){
        cb();
        authModal.deactivate();
        unsubscribe();
      })
      authModal.activate();
      ga('send', 'event', 'users', 'askedToSignIn', 'adding to wishlist');
    }

  };

  this.checkIfWishedFor = function(product_id){
    return WishlistItems.wishedFor(product_id);
  },


  this.openLink = function(product, userId){

    window.open(product.url,'_blank');
    if (!userId) {
      $('#signUpModal').foundation('reveal', 'open');
    }
  };

  this.nextPage = function(products){

    if (Products.scrollActive() === true) {
      ga('send', 'event', 'products', 'viewPage', Products.currentPage());
      Products.setScrollActive(false);
      Products.fetchProducts();
    }
  };

}]);

app.controller('GenderController', ['$scope', 'Filters', 'Products', '$localStorage', function($scope, Filters, Products, $localStorage){
  $scope.genderId = Filters.getFilters().gender;
  $scope.myGenders = [{id: 0, name: "All"},{id: 1, name: "Mens"},{id: 2, name: "Womens"}];

  $scope.myConfig = {
      create: false,
      valueField: 'id',
      labelField: 'name',
      maxItems: 1,
      searchField: 'name',
      allowEmptyOption: true
    };

  $scope.setGender = function(gender) {
    var changed;
    if ( gender === "1") {
      changed = Filters.setFilter("gender", 1);
      ga('send', 'event', 'filters', 'selectGender', 'male');
    } else if ( gender === "2") {
      changed = Filters.setFilter("gender", 2);
    } else if ( gender === undefined || gender == 0 ){
      changed = Filters.removeFilter("gender");
    }
    $localStorage.gender = Filters.getFilters().gender
    if (changed) {
      Products.resetProducts(true);
      Products.fetchProducts();
    }
  };
}]);

app.controller('CategoryController', ['$scope', 'Filters', 'Products', 'Categories', '$rootScope', function($scope, Filters, Products, Categories, $rootScope){
  var changed;
  Categories.fetchCategories();
  $scope.catId = Filters.getFilters().category;
  $scope.myCats = [{id: 0, displayName: "All"}].concat(Categories.list());
  $scope.$on("catsLoaded", function(){
    $scope.myCats = [{id: 0, displayName: "All"}].concat(Categories.list());
  });

  $rootScope.$on("categoriesReceived", function(event, array){
    Categories.addCount(array);
  });

  $scope.categories = Categories;

  $scope.myConfig = {
      create: false,
      valueField: 'id',
      labelField: 'displayName',
      sortField: [{field: 'count', direction: 'desc'}],
      maxItems: 1,
      searchField: 'name',
      allowEmptyOption: true
    };

  $scope.setCategory = function(cat_id){
    if (cat_id === undefined || cat_id === 0) {
      changed = Filters.removeFilter("category");
    } else {
      changed = Filters.setFilter("category", parseInt(cat_id));
      ga('send', 'event', 'filters', 'selectCategory', cat_id);
      //$rootScope.$broadcast('stylesLoaded');
    }

    if (changed) {
      Filters.removeFilter("subCategory");
      Filters.removeFilter("style");
      Products.resetProducts(true);
      Products.fetchProducts();
    }
  };
}]);

app.controller('SubCategoryController', ['$scope', 'Filters', 'Products', 'Categories', 'SubCategories', function($scope, Filters, Products, Categories, SubCategories){
  SubCategories.fetchSubCategories();
  $scope.mySubCats = [{id: 0, name: "All"}].concat(SubCategories.availablelist());
  $scope.$on("subCatsLoaded", function(){
    $scope.mySubCats = [{id: 0, name: "All"}].concat(SubCategories.availablelist());
  });

  $scope.subCategories = SubCategories;

  $scope.myConfig = {
      create: false,
      valueField: 'id',
      labelField: 'name',
      maxItems: 1,
      searchField: 'name',
      allowEmptyOption: true
    };

  $scope.setSubCat = function(sub_cat_id){
    if (sub_cat_id === undefined || sub_cat_id == 0) {
      Filters.removeFilter("subCategory");
    } else {
      Filters.setFilter("subCategory", parseInt(sub_cat_id));
    }
    Products.resetProducts(true);
    Products.fetchProducts();
  };
}]);

app.controller('StylesController', ['$scope', 'Filters', 'Products', 'Categories', 'Styles', '$rootScope', function($scope, Filters, Products, Categories, Styles, $rootScope){
  var changed;
  $scope.styleId = Filters.getFilters().style;
  Styles.fetchStyles();
  $scope.myStyles = [{id: 0, displayName: "All"}].concat(Styles.availableList());
  $scope.$on("stylesLoaded", function(){
    $scope.myStyles = [{id: 0, displayName: "All"}].concat(Styles.availableList());
  });

  $rootScope.$on("stylesReceived", function(event, array){
    Styles.addCount(array);
  });

  $scope.styles = Styles;
  $scope.filters = Filters;

  $scope.myConfig = {
    create: false,
    valueField: 'id',
    labelField: 'displayName',
    sortField: [{field: 'count', direction: 'desc'}],
    maxItems: 1,
    searchField: 'name',
    allowEmptyOption: true
  };

  $scope.setStyle = function(style_id){
    if (style_id === undefined || style_id == 0) {
      changed = Filters.removeFilter("style");
    } else {
      changed = Filters.setFilter("style", parseInt(style_id));
      ga('send', 'event', 'filters', 'selectStyle', style_id);
    }
    if (changed) {
      Products.resetProducts(true);
      Products.fetchProducts();
    }
  };
}]);

app.controller('ColorController', ['$scope', 'Filters', 'Products', 'Colors', '$rootScope', function($scope, Filters, Products, Colors, $rootScope){
  var changed;
  Colors.fetchColors();
  $scope.colorId = Filters.getFilters().color;
  $scope.myColors = [{id: 0, displayName: "All"}].concat(Colors.list());
  $scope.$on("colorsLoaded", function(){
    $scope.myColors = [{id: 0, displayName: "All"}].concat(Colors.list());
  });

  $rootScope.$on("colorsReceived", function(event, array){
    Colors.addCount(array);
  });

  $scope.colors = Colors;
  $scope.myConfig = {
      create: false,
      valueField: 'id',
      labelField: 'displayName',
      sortField: [{field: 'count', direction: 'desc'}],
      maxItems: 1,
      searchField: 'displayName',
      allowEmptyOption: true
    };

  $scope.setColor = function(color_id){
    if (color_id === undefined || color_id == 0) {
      changed = Filters.removeFilter("color");
    } else {
      changed = Filters.setFilter("color", parseInt(color_id));
    }
    if (changed) {
      Products.resetProducts(true);
      Products.fetchProducts();
    }
  };
}]);

app.controller('BrandDropdownController', ['$scope', 'Filters', 'Products', 'Brands', '$http', '$rootScope', function($scope, Filters, Products, Brands, $http, $rootScope){
  var changed;
  $scope.brandId = Filters.getFilters().brand;

  Brands.fetchBrands();
  $scope.myBrands = [{id: 0, displayName: "All"}].concat(Brands.brands);

  $scope.$on("brandsLoaded", function(){
    $scope.myBrands = [{id: 0, displayName: "All"}].concat(Brands.brands);
  });

  $rootScope.$on("brandsReceived", function(event, array){
    Brands.addCount(array);
  });

  $scope.brands = Brands;

  $scope.myConfig = {
      create: false,
      valueField: 'id',
      labelField: 'displayName',
      sortField: [{field: 'count', direction: 'desc'}],
      maxItems: 1,
      searchField: 'name',
      allowEmptyOption: true
    };

  $scope.setBrand = function(brand_id){
    if (brand_id === undefined || brand_id == 0) {
      changed = Filters.removeFilter("brand");
    } else {
      changed = Filters.setFilter("brand", parseInt(brand_id));
    }
    if (changed) {
      Products.resetProducts(true);
      Products.fetchProducts();
    }
  };
}]);

app.controller('MobileCatController', ['$scope', 'Categories', function($scope, Categories){
  Categories.fetchCategories();
  $scope.categories = Categories;

}]);

app.controller('SearchController', ['$state', 'Filters', 'Products', 'Categories', '$localStorage', function($state, Filters, Products, Categories, $localStorage){
  this.updateSearch = function(searchString){
    if (searchString === null || searchString === undefined || searchString === '' || searchString === ' ') {
      return
    } else {
      cat = Filters.getFilters().category;
      Filters.resetAll(true);
      Filters.setFilter("category", cat);
      Filters.setFilter("searchString", searchString);
      $state.go('search', {searchString: searchString});
      ga('send', 'event', 'products', 'search', searchString);
    }
  };

  this.findCat = function(searchString){
    Filters.removeFilter("category");
    Filters.removeFilter("subCategory");
    var words = searchString.toLowerCase().split(" ");
    _(words).forEach(function(word){
      if (Filters.getFilters().category === undefined) {
        _(Categories.list()).forEach(function(category){
          if (Filters.getFilters().category === undefined) {
            if (category.name === word){
              Filters.setFilter("category", parseInt(category.id));
              Filters.setFilter("category", parseInt(category.id));
            } else if (category.name.substring(0, category.name.length - 1) === word) {
              Filters.setFilter("category", parseInt(category.id));
            }
          }
        });
      }
    });
  };
}]);

app.controller('ToggleController', ['$scope', function($scope){
  $scope.open = false;

  $scope.toggle = function(){
    $scope.open = !$scope.open;
  }
}]);

app.controller('BasketController', ['$scope', '$localStorage', 'Basket', 'Stores', 'Deliveries', function($scope, $localStorage, Basket, Stores, Deliveries){
  $scope.basket = Basket;
  $scope.stores = Stores;
  $scope.deliveries = Deliveries;
  Deliveries.reset();
  Basket.fetchBasketItemProducts();
  Stores.fetchStores();
  $scope.removeFromBasket = function(product){
    Basket.removeFromBasketItems(product);
    ga('send', 'event', 'products', 'removeFromBasket', product.name);
  };
  $scope.setDelivery = function(delivery, store){
    Deliveries.addDelivery(delivery, store);
  }
  $scope.valid = function(){
    var numbersMatch = ($scope.stores.listStoresForProducts($scope.basket.listProducts()).length === $scope.deliveries.list().length);
    var gtZero = ($scope.deliveries.list().length > 0);
    return !(numbersMatch && gtZero)
  }

}])

app.controller('PaymentsController', ['$scope', '$auth', '$localStorage', '$state', 'Basket', function($scope, $auth, $localStorage, $state, Basket){
  if ($auth.user.id) {
    $state.go('pay.address');
  }
}]);

app.controller('SortController', ['$scope', 'Filters', 'Products', function($scope, Filters, Products){
  var changed;
  $scope.sort = Filters.getFilters().sort;
  $scope.Filters = Filters;
  $scope.mySorts = [{id: 0, name: "Name A-Z", value: "first_letter, asc"},{id: 1, name: "Name Z-A", value: "first_letter, desc"},{id: 2, name: "Price Low-High", value: "display_price, asc"},{id: 2, name: "Price High-Low", value: "display_price, desc"}];

  $scope.myConfig = {
    create: false,
    valueField: 'value',
    labelField: 'name',
    maxItems: 1,
    searchField: 'name',
    allowEmptyOption: true
  };


  $scope.setSort = function(sort){
    changed = Filters.setFilter("sort", sort);
    ga('send', 'event', 'filters', 'sort', sort);
    if (changed) {
      Products.resetProducts(true);
      Products.fetchProducts();
    }
  };
}]);

app.controller('OrdersController', ['$scope', 'Orders', function($scope, Orders){
  Orders.fetchOrders();
  $scope.orders = Orders;
}]);

app.controller('MaterialController', ['$scope', 'Filters', 'Products', 'Materials', '$rootScope', function($scope, Filters, Products, Materials, $rootScope){

  $scope.materials = [];
  Materials.fetchMaterials();
  $scope.myMaterials = [{id: 0, displayName: "All"}].concat(Materials.list());
  $scope.filters = Filters;

  $scope.$on("materialsLoaded", function(){
    $scope.myMaterials = [{id: 0, displayName: "All"}].concat(Materials.list())
  });

  $rootScope.$on("materialsReceived", function(event, array){
    Materials.addCount(array);
  });

  $scope.myConfig = {
    create: false,
    valueField: 'id',
    labelField: 'displayName',
    sortField: [{field: 'count', direction: 'desc'}],
    maxItems: 1,
    searchField: 'name',
    allowEmptyOption: true
  };

  $scope.setMaterial = function(mtrl_id){
    if (mtrl_id === undefined || mtrl_id == 0) {
      changed = Filters.removeFilter("material");
    } else {
      changed = Filters.setFilter("material", parseInt(mtrl_id));
      ga('send', 'event', 'filters', 'selectMaterial', mtrl_id);
    }
    if (changed) {
      Products.resetProducts(true);
      Products.fetchProducts();
    }

  };
}]);

app.controller('ProductDetailController', ['$scope', '$stateParams', '$http', 'Basket', 'Meta', 'WishlistItems', '$auth', 'authModal','$localStorage', 'MoreLikeThis', '$rootScope', function($scope, $stateParams, $http, Basket, Meta, WishlistItems, $auth, authModal, $localStorage, MoreLikeThis, $rootScope){
  // get the id
  $scope.showMenu = false;
  $scope.id = $stateParams.productID;
  $scope.basket = Basket;
  $scope.basket.fetchBasketItemProducts();
  $scope.size = null;

  $scope.MLT = MoreLikeThis;

  $http.get(backendUrl + 'products/' + $scope.id + '.json', {async: true}).success(function(data){
    $scope.product = data;
    Meta.set("title", $scope.product.brand_name + " " + $scope.product.name + " at Fetch My Fashion");
    Meta.set("description", "Shop " + $scope.product.name + " by " + $scope.product.brand_name + " at Fetch My Fashion, All Your Favourite Stores In One Place");
    $scope.currentImg = data.large_image_url || data.image_url;
    Meta.set("imageUrl", $scope.currentImg);
    Meta.set("displayPrice", $scope.product.display_price);
    Meta.set("id", $scope.product.id);
    Meta.set("slug", $scope.product.slug);
    var sizes = _.map($scope.product.sizes, function(size){ return size.name }).join(" | ");
    Meta.set("sizes", sizes);
    if ($scope.product.image_urls) {
      $scope.product.image_urls = _.uniq($scope.product.image_urls);
    } else {
      $scope.product.image_urls = [$scope.currentImg];
    }

    $scope.getStoreDetails($scope.product);
    window.scrollTo(0, 0);

    $scope.MLT.fetchMoreLikeThis($scope.product);
    // if ($scope.product.deeplink) {
    //   $scope.scraping = true

    //   $http.get(scraperUrl + $scope.product.deeplink, {async: true}).success(function(data){
    //     $scope.product.sizes = _.map(data.sizes, function(size) {
    //       return {name: size.name.split(" - ")[0]};
    //     });
    //     $scope.scraping = false
    //   })

    // }

  });

  $scope.addToWishlist = function(product){
    var callback = function(product){
      return function(){
        WishlistItems.addToWishlistItems(product);
        ga('send', 'event', 'products', 'addToWishlist', product.name);
      }
    }

    var cb = callback(product)

    if ($auth.user.id) {
      cb();
    } else {

      var unsubscribe = $scope.$on('auth:login-success', function(ev){
        cb();
        authModal.deactivate();
        unsubscribe();
      })
      authModal.activate();
      ga('send', 'event', 'users', 'askedToSignIn', 'adding to wishlist');
    }

  };

  $scope.checkIfWishedFor = function(){
    return WishlistItems.wishedFor($scope.id);
  };

  $scope.toggleMenu = function(){
    $scope.showMenu = !$scope.showMenu;
  };

  $scope.currentIndex = 0;

  $scope.setCurrentSlideIndex = function (index) {
      $scope.currentIndex = index;
  };

  $scope.isCurrentSlideIndex = function (index) {
      return $scope.currentIndex === index;
  };

  $scope.prevSlide = function () {
    $scope.currentIndex = ($scope.currentIndex < $scope.product.image_urls.length - 1) ? ++$scope.currentIndex : 0;
  };

  $scope.nextSlide = function () {
    $scope.currentIndex = ($scope.currentIndex > 0) ? --$scope.currentIndex : $scope.product.image_urls.length - 1;
  };

  $scope.setProductImg = function(imgUrl) {
    $scope.currentImg = imgUrl;
  };

  $scope.selectSize = function(size){
    $scope.size = size;
    $scope.showMenu = false;
    $scope.product.selectedSize = size;
  };

  $scope.setButtonMsg = function(inBasket){
    if (!inBasket) {
      $scope.msg = "Adding to Basket";
    } else {
      $scope.msg = "Removing from Basket";
    }
  };

  $scope.addToBasket = function(inBasket){
    if (!inBasket) {
      Basket.addToBasketItems($scope.product);
      ga('send', 'event', 'products', 'addToBasket', $scope.product.name);
    } else {
      Basket.removeFromBasketItems($scope.product);
    }
    $scope.basket.fetchBasketItemProducts();
    $scope.msg = null;
  };

  $scope.getStoreDetails = function(product){
    $http.get(backendUrl + 'stores/' + product.store_id + '.json', {async: true}).success(function(data){
      $scope.storeDetails = data
    })
  };
}]);

app.controller("HeadController", ["Meta", "$scope", function(Meta, $scope){
  $scope.meta = Meta;
}]);

app.controller("BrandController", ["Meta", "$scope", "$http", "$stateParams", "Products", "Filters", "$state", function(Meta, $scope, $http, $stateParams, Products, Filters, $state){
  Products.resetProducts();
  Products.resetPage();
  Filters.resetAll();
  Filters.setFilter('brand', $stateParams.id);
  $scope.category = $stateParams.category;
  Filters.setFilter('category', $stateParams.catID);
  Products.fetchProducts()
  $http.get(backendUrl + 'brands/' + $stateParams.brandId + '.json', {async: true}).success(function(data){
    $scope.brand = data;
    $scope.checkIfFeaturedCategorySet($scope);

    if ($stateParams.catID){
      Meta.set("title", $scope.brand.name + " " + $scope.category + " at Fetch My Fashion");
      Meta.set("description", "Shop " + $scope.brand.name + " " + $scope.category + " at Fetch My Fashion, All Your Favourite Stores In One Place");
    }else{
      Meta.set("title", $scope.brand.name + " at Fetch My Fashion");
      Meta.set("description", "Shop " + $scope.brand.name + " at Fetch My Fashion, All Your Favourite Stores In One Place");
    }
  })

  $scope.checkIfFeaturedCategorySet = function($scope){
    $scope.brand.featured_categories = _.reject($scope.brand.featured_categories, function(n) {
                                       return _.contains(n.name, $scope.category)
                                       });
  };

  $scope.onCatPage = function(){
    return !!$scope.category;
  }
}]);


app.controller('AuthModalCtrl', function (authModal) {
  this.closeMe = authModal.deactivate;
});

app.controller('RecommendationsController', ["$scope", "$stateParams", "$http", function($scope, $stateParams, $http) {
  $scope.recommendationID = $stateParams.recommendationID;
  $http.get(backendUrl + 'api/recommendations/' + $scope.recommendationID + ".json", {async: true}).success(function(data){
    $scope.recommendation = data;
  });

  $scope.createNew = function(recItem) {
    console.log("hi");
    $http.post(backendUrl + 'api/recommendations/' + $scope.recommendationID + "/recommendation_items.json", {async: true, recommendation_item: {description: recItem.description, product_id: recItem.productURL.match(/\/\d+\-/)[0].slice(1, - 1)}}).success(function(data) {
      console.log(data);
      $scope.newRecItem = null;
      $scope.recommendation.recommendation_items.push(data);
    })
  }
}]);

app.controller('AdminDataFeedsController', ['$scope', '$http', function($scope, $http){
 $scope.button = {};
 $scope.runDataFeeds = function() {
   console.log("run feeds");
   $scope.button.disabled = true;
   $http.post(backendUrl + 'api/run_feeds.json', {async: true}).success(function(data){
    console.log(data);
    $scope.button.hidden = true;
   })
 }
}])

