describe('ColorController', function(){
  beforeEach(module('App'));

  var $controller;

  //mock Application to allow us to inject our own dependencies
  //mock the controller for the same reason and include $rootScope and $controller

  beforeEach(inject(function(_$controller_){
    // The injector unwraps the underscores (_) from around the parameter names when matching
    $controller = _$controller_;
  }));
  // tests start here
  // it('should have variable currentUser = null', function(){
  //     expect(scope.currentUser).toBe(null);
  // });
  it('should attach the factory to the scope object', function(){
    var $scope = {};
    var controller = $controller('ColorController', { $scope: $scope });
    expect($scope.colors.fetchColors).toBeDefined();
    expect($scope.colors.list()).toBeDefined();
  });

  it('should return an empty array before fetch', function(){
    var $scope = {};
    var controller = $controller('ColorController', { $scope: $scope });
    var catchReturn = $scope.colors.list();
    expect(catchReturn).toEqual([]);
  });
});