
app.controller('main' , function($scope , $state , $http , $timeout , $interval, $sce , $uibModal){
  console.log("main loded");
  $scope.crmBannerID = 1;

  $scope.mainBannerImages = [ ]
  $scope.bannerID = 0;
  $scope.typings = ["Realtime inventory" , "Snapdeal, Amazon, flipkart and more integrated" ]
  $scope.typeIndex = 0;
  $scope.videoLink = '';

  $scope.videoLink = $sce.trustAsResourceUrl('https://www.youtube.com/embed/7V6rliZPyCE');

  $scope.buy = function(typ) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.homepage.inquiry.html',
      size: 'lg',
      resolve : {

      },
      controller: function($scope, $http){

        $scope.form = {name: '' , email : '' , mobile : '' , company : '' , checkValidity : false};
        $scope.mode = 'form';

        $scope.enquire= function() {
          $scope.form.checkValidity = true;

          $http({method : 'POST' , url : '/api/homepage/enquireOrContact/' , data : $scope.form}).
          then(function(response) {
            $scope.mode = 'thankyou'
          })
        }
      },
    })
  }

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
