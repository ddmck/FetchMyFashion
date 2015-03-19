describe('SubCategoryController', function(){
  beforeEach(module('App'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

  it('should attach the factory to the scope object', function(){
    var $scope = {};
    var controller = $controller('SubCategoryController', { $scope: $scope });
    expect($scope.subCategories).toBeDefined();
    expect($scope.subCategories.list()).toBeDefined();
    expect($scope.filters).toBeDefined();
  });

  it('should return an empty array before fetch', function(){
    var $scope = {};
    var controller = $controller('SubCategoryController', { $scope: $scope });
    var catchReturn = $scope.subCategories.list();
    expect(catchReturn).toEqual([]);
  });
});