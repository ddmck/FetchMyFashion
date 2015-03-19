describe('CategoryController', function(){
  beforeEach(module('App'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

  it('should attach the factory to the scope object', function(){
    var $scope = {};
    var controller = $controller('CategoryController', { $scope: $scope });
    expect($scope.categories).toBeDefined();
    expect($scope.categories.list()).toBeDefined();
    expect($scope.filters).toBeDefined();
  });

  it('should return an empty array before fetch', function(){
    var $scope = {};
    var controller = $controller('CategoryController', { $scope: $scope });
    var catchReturn = $scope.categories.list();
    expect(catchReturn).toEqual([]);
  });
});