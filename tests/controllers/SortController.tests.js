describe('SortController', function(){
  beforeEach(module('App'));

  var $controller;

  beforeEach(inject(function(_$controller_){
    $controller = _$controller_;
  }));

  it('should have defined methods', function(){
    var $scope = {};
    var controller = $controller('SortController', { $scope: $scope });
    expect($scope.Filters).toBeDefined();
    expect($scope.sorters).toBeDefined();
    expect($scope.setSort).toBeDefined();
  });

  it('should have valid sorters', function(){
    var $scope = {};
    var controller = $controller('SortController', { $scope: $scope });
    sort = [
      {
        name: "Name A-Z",
        val: "first_letter, asc"
      },
      {
        name: "Name Z-A",
        val: "first_letter, desc"
      },
      {
        name: "Price Low-High",
        val: "display_price, asc"
      },
      {
        name: "Price High-Low",
        val: "display_price, desc"
      }
    ];

    expect($scope.sorters).toEqual(sort);
  });
});