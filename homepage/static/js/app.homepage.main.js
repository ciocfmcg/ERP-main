
app.controller('main' , function($scope , $state , $http , $timeout , $interval, $sce){
  console.log("main loded");
  $scope.crmBannerID = 1;

  $scope.mainBannerImages = [ ]
  $scope.bannerID = 0;
  $scope.typings = ["Online tutoring" , "24x7 online help" , "CBSE Preparation" , "IIT JEE Preparation", "AIPMT Preparation" ]
  $scope.typeIndex = 0;
  $scope.videoLink = '';

  $scope.videoLink = $sce.trustAsResourceUrl('https://www.youtube.com/embed/JC-Dpwb-Sk8');

  $interval(function() {

    $scope.typeIndex += 1;
    if ($scope.typeIndex == $scope.typings.length) {
      $scope.typeIndex = 0;
    }

  }, 5000)

  $interval(function() {
    $scope.bannerID += 1;
    if ($scope.bannerID==$scope.mainBannerImages.length) {
      $scope.bannerID = 0;
    }
  } , 2000)

  $interval(function() {
    $scope.crmBannerID += 1;
    if ($scope.crmBannerID==12) {
      $scope.crmBannerID = 1;
    }
  } , 1000)



});
