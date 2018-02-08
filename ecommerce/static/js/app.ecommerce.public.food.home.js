app.controller('controller.ecommerce.food.home' , function($scope , $state , $http , $users ,$uibModal , $interval){

  $scope.$watch(function() {
    if (typeof $scope.settings == 'undefined' || Object.keys($scope.settings).length==0) {
      $scope.settings = $scope.$parent.settings;
    }
  });

  $scope.$parent.showFeedback = false;

  $scope.openIntroVideo = function() {
    var modalInstance = $uibModal.open({
      template: '<iframe width="100%" style="margin:0px;padding:0px;" height="500" src="https://www.youtube.com/embed/2WdB9CPLibQ" frameborder="0" allowfullscreen></iframe>',
      controller: function($scope , $uibModalInstance) {

      },
      size: 'lg',
    });
  }


  $scope.steps = [
    {text : 'Locate' , icon : 'fa-map-marker'},
    {text : 'Search' , icon : 'fa-search'},
    {text : 'Select' , icon : 'fa-hand-pointer-o'},
    {text : 'Checkout' , icon : 'fa-credit-card'},
  ]

  $scope.whyZoomer = 1;
  $interval(function () {
    if ($scope.whyZoomer == 1) {
      $scope.whyZoomer = 2;
    }else if ($scope.whyZoomer == 2) {
      $scope.whyZoomer = 3;
    }else {
      $scope.whyZoomer =1;
    }
  }, 2000);

  $scope.fetchGenericProducts = function(){
    url = '/api/ecommerce/genericProductLite'
    $scope.listings = [];

    $http({method : "GET" , url : url}).
    then(function(response){
      for (var i = 0; i < response.data.length; i++) {
        l = response.data[i];
        $scope.genericProducts.push(l);
      }
    })
  }

  $scope.genericProducts = [];
  $scope.me = $users.get('mySelf');

  $scope.fetchGenericProducts()


});
