describe('ProductsController', function(){
  beforeEach(module('App'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

  it('should have defined functions', function(){
    var $scope = {};
    var controller = $controller('ProductsController', { $scope: $scope });
    expect($scope).toBeDefined();
    expect(controller.viewProduct).toBeDefined();
    expect(controller.addToWishlist).toBeDefined();
    expect(controller.checkIfWishedFor).toBeDefined();
    expect(controller.openLink).toBeDefined();
    expect(controller.nextPage).toBeDefined();
    expect(controller.filters).toBeDefined();
  });
});