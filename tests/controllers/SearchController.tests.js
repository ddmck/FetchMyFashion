describe('SearchController', function(){
  beforeEach(module('App'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

  it('should have defined methods', function(){
    var $scope = {};
    var controller = $controller('SearchController', { $scope: $scope });
    expect(controller.updateSearch).toBeDefined();
    expect(controller.findCat).toBeDefined();
  });
});