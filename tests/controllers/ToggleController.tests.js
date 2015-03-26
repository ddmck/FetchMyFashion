describe('ToggleController', function(){
  beforeEach(module('App'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

  it('should attach the factory to the scope object', function(){
    var $scope = {};
    var controller = $controller('ToggleController', { $scope: $scope });
    expect($scope.open).toBeDefined();
    expect($scope.toggle).toBeDefined();
  });

  it('should toggle the boolean on execution', function(){
    var $scope = {};
    var controller = $controller('ToggleController', { $scope: $scope });
    
    expect($scope.open).toEqual(false);
    $scope.toggle();
    expect($scope.open).toEqual(true);
  });
});