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
