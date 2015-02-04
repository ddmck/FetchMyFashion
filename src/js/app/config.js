
app.config(function($stateProvider, $urlRouterProvider, $authProvider) {
    
  $stateProvider
  
    // route to show our landing page (/welcome)
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'partials/welcome.html',
      controller: function($scope, $localStorage, WishlistItems){
        if ($localStorage.gender){
          $scope.msg = "Welcome back!";
        } else {
          $scope.msg = "Fashion Delivered Without the Wait";
        };
        $scope.wishlist = $localStorage.wishlistItems;
      }
    })

    .state('basket', {
      url: '/basket',
      templateUrl: 'partials/basket.html',
      controller: 'BasketController'
    })

    .state('pay', {
      abstract: true,
      url: '/pay',
      templateUrl: 'partials/pay.html',
      controller: 'PaymentsController'
    })

    .state('pay.you', {
      url: '/you',
      templateUrl: 'partials/you.html'
    })

    .state('pay.address', {
      url: '/address',
      templateUrl: 'partials/address.html', 
      controller: function($scope, $state, $localStorage){
        $scope.localStorage = $localStorage;
        $scope.submitAddress = function(addressForm) {
          $localStorage.address = addressForm;
          console.log(addressForm);
          $state.go('pay.billing')
        }
      }
    })

    .state('pay.billing', {
      url: '/billing',
      templateUrl: 'partials/billing.html',
      controller: function($scope, $state, $localStorage){
        $scope.localStorage = $localStorage;
        $scope.handleStripe = function(status, response){
          if(response.error) {
            $scope.billingForm.error = response.error;
          } else {
            // got stripe token, now charge it or smt
            $localStorage.token = response.id;
            $state.go('pay.confirmation')
          }
        };
        $scope.clear = function(){
          $localStorage.token = null;
        }
      }
    })

    .state('pay.confirmation', {
      url: '/confirmation',
      templateUrl: 'partials/confirmation.html',
      controller: function($scope, $localStorage, $http, Basket){
        $scope.basket = Basket;
        Basket.fetchBasketItemProducts();
        $scope.localStorage = $localStorage;
        $scope.submitOrder = function(){
          $http.post(backendUrl + "api/orders.json", {order: {
            token: $localStorage.token,
            basket: $localStorage.basketItems,
            address: $localStorage.address
          }});
        } 
      }
    })

    .state('account', {
      abstract: true,
      url: '/account',
      templateUrl: 'partials/account.html'
    })

    .state('account.signIn', {
      url: '/sign-in',
      templateUrl: 'partials/sign-in.html',
      controller: "UserSessionsController"
    })

    .state('account.signUp', {
      url: '/sign-up',
      templateUrl: 'partials/sign-up.html',
      controller: "UserRegistrationsController"
    })

    .state('products', {
      abstract: true,
      url: '/products',
      templateUrl: 'partials/products.html'
    })

    .state('products.new', {
      url: '/new',
      templateUrl: 'partials/new.html'
    })

    .state('products.hot', {
      url: '/hot',
      templateUrl: 'partials/hot.html'
    })

    .state('products.saved', {
      url: '/saved',
      templateUrl: 'partials/saved.html',
      controller: function($scope, WishlistItems){
        $scope.wishlist = WishlistItems;
        WishlistItems.fetchWishlistItemProducts();
        $scope.removeFromWishlist = function(product){
          WishlistItems.removeFromWishlistItems(product);
        };
      }
    })

    .state('categoryView', {
      url: '/products/:gender/{catID}-{category}',
      templateUrl: 'partials/category-view.html',
      controller: function($scope, $stateParams, Products, Filters, Categories){
        $scope.category = $stateParams.category;
        Products.resetProducts();
        Products.resetPage();
        Filters.resetAll();
        Filters.setFilter('category', $stateParams.catID);
        Filters.setFilter('gender', $stateParams.gender);
      }
    })

    .state('productDetail', {
      url: '/products/:productID',
      templateUrl: 'partials/product-detail.html',
      controller: function($scope, $stateParams, $http, Basket) {
        // get the id
        $scope.showMenu = false;
        $scope.id = $stateParams.productID;
        $scope.basket = Basket;
        $scope.basket.fetchBasketItemProducts();
        $scope.size = null;
        $http.get(backendUrl + 'products/' + $scope.id + '.json', {async: true}).success(function(data){
          $scope.product = data;
          $scope.currentImg = data.large_image_url || data.image_url;
          window.scrollTo(0, 0);
        });

        $scope.toggleMenu = function(){
          $scope.showMenu = !$scope.showMenu;
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
        }

        $scope.addToBasket = function(inBasket){
          if (!inBasket) {
            Basket.addToBasketItems($scope.product);
          } else {
            Basket.removeFromBasketItems($scope.product);
          }
          $scope.basket.fetchBasketItemProducts();
          $scope.msg = null;
        };
      }
    })

    .state('search', {
      url: '/search?searchString&category',
      templateUrl: "partials/search-results.html",
      controller: function($scope, $stateParams, Products){
        $scope.searchString = $stateParams.searchString;
        Products.resetProducts();
        Products.resetPage();
        Products.fetchProducts();
        Products.enumeratePage();
      }
    })

    .state('delivery', {
      url: '/delivery',
      templateUrl: "partials/delivery.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('returns', {
      url: '/returns',
      templateUrl: "partials/returns.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('about', {
      url: '/about',
      templateUrl: "partials/about.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('stores-list', {
      url: '/stores-list',
      templateUrl: "partials/stores-list.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('contact', {
      url: '/contact',
      templateUrl: "partials/contact.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })

    .state('terms', {
      url: '/terms',
      templateUrl: "partials/terms.html",
      onEnter: function(){
        window.scrollTo(0,0);
      }
    })
      
  // catch all route
  // send users to the form page 
  $urlRouterProvider
    .when('/products', 'products/new')
    .when('/account', 'account/sign-in')
    .when('/pay', 'pay/ypu')
    .otherwise('/welcome');
  
  $authProvider.configure({
      apiUrl: backendUrl + 'api'
  });
})

