app.config(function($stateProvider, $urlRouterProvider, $authProvider) {
    
  $stateProvider
  
    // route to show our landing page (/welcome)
    .state('welcome', {
      url: '/welcome',
      templateUrl: 'partials/welcome.html'
    })

    .state('products', {
      url: '/products',
      templateUrl: 'partials/products.html'
    })

    .state('products.new', {
      url: '/new',
      templateUrl: 'partials/new.html'
      // controller: function
    })

    .state('products.hot', {
      url: '/hot',
      templateUrl: 'partials/hot.html'
    })

    .state('categoryView', {
      url: '/products/:gender/{catID}-{category}',
      templateUrl: 'partials/category-view.html',
      controller: function($scope, $stateParams, Products, Filters, Categories){
        console.log($stateParams);
        console.log(Products);
        console.log(Filters);
        Products.resetProducts();
        Products.resetPage();
        Filters.resetAll();
        Filters.setFilter('category', $stateParams.catID);
        Filters.setFilter('gender', $stateParams.gender);
        Products.fetchProducts();
      }
    })

    .state('productDetail', {
      url: '/products/:productID',
      templateUrl: 'partials/product-detail.html',
      controller: function($scope, $stateParams, $http) {
        // get the id
        $scope.showMenu = false;
        $scope.id = $stateParams.productID;
        $scope.size = null;
        $http.get(backendUrl + 'products/' + $scope.id + '.json', {async: true}).success(function(data){
          $scope.product = data;
          window.scrollTo(0, 0);
        });

        $scope.toggleMenu = function(){
          $scope.showMenu = !$scope.showMenu;
        };

        $scope.selectSize = function(size){
          $scope.size = size;
          $scope.showMenu = false;
        }
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
      }
    })

    .state('delivery', {
      url: '/delivery',
      templateUrl: "partials/delivery.html"
    })

    .state('returns', {
      url: '/returns',
      templateUrl: "partials/returns.html"
    })

    .state('stores-list', {
      url: '/stores-list',
      templateUrl: "partials/stores-list.html"
    })
      
  // catch all route
  // send users to the form page 
  $urlRouterProvider.otherwise('/welcome');
  
  $authProvider.configure({
      apiUrl: backendUrl + 'api'
  });
})