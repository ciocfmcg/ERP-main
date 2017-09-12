console.log("loaded");
var app = angular.module('app' , ['ui.router']);

app.config(function($stateProvider ,  $urlRouterProvider , $httpProvider , $provide ){

  $urlRouterProvider.otherwise('/home');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;


});

app.run([ '$rootScope', '$state', '$stateParams', function ($rootScope,   $state,   $stateParams) {
    $rootScope.$state = $state;
    $rootScope.$stateParams = $stateParams;
    $rootScope.$on("$stateChangeError", console.log.bind(console));
  }
]);

// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc
app.controller('main' , function($scope , $state , $http , $timeout , $interval){
  console.log("main loded");
  $scope.text = 'hey';

  $scope.mainBannerImages = ['/static/images/banner-img2.jpg' ,'/static/images/ecommerce.wallpaper2.jpg' ,'/static/images/background2.jpg']
  $scope.bannerID = 0;

  $interval(function() {
    $scope.bannerID += 1;
    if ($scope.bannerID==$scope.mainBannerImages.length) {
      $scope.bannerID = 0;
    }
  } , 2000)


});
