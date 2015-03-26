describe('GenderController', function(){
  beforeEach(module('App'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

  it('should attach the factory to the scope object', function(){
    var $scope = {};
    var controller = $controller('GenderController', { $scope: $scope });
    expect($scope.setGender).toBeDefined();
  });
});