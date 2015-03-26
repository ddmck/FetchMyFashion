describe('TrendsController', function(){
  beforeEach(module('App'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

  it('should attach the factory to the scope object', function(){
    var $scope = {};
    var controller = $controller('TrendsController', { $scope: $scope });
    expect($scope.trends).toBeDefined();
    expect($scope.trends.list()).toBeDefined();
  });

  it('should return an empty array before fetch', function(){
    var $scope = {};
    var controller = $controller('TrendsController', { $scope: $scope });
    var catchReturn = $scope.trends.list();
    expect(catchReturn).toEqual([]);
  });
});