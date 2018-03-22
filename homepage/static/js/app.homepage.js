console.log("loaded");
var app = angular.module('app' , ['ui.router']);


app.config(function($stateProvider ,  $urlRouterProvider , $httpProvider , $provide ){

  // $urlRouterProvider.otherwise('/home');
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
  $httpProvider.defaults.withCredentials = true;




});

// app.run([ '$rootScope', '$state', '$stateParams', function ($rootScope,   $state,   $stateParams) {
//     $rootScope.$state = $state;
//     $rootScope.$stateParams = $stateParams;
//     $rootScope.$on("$stateChangeError", console.log.bind(console));
//   }
// ]);

// Main controller is mainly for the Navbar and also contains some common components such as clipboad etc
app.controller('main' , function($scope , $state , $http , $timeout , $interval){
  console.log("main loded");
  $scope.crmBannerID = 1;

  $scope.mainBannerImages = ['/static/images/rackmint_banner.png' ]
  $scope.bannerID = 0;

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
app.controller('homepage.chat' , function($scope , $state , $http , $timeout , $interval){
  $scope.name = "Pradeep";

  $scope.minimized = true;

  $scope.started = false;

  $scope.data = {minimized : true , started : false , msgText : '',name: '',email: ''}


  $scope.messages=[{msg:"hii" , sentByMe : false }]
  $scope.msgText='';
  $scope.send = function(){
    $scope.messages.push({msg : $scope.data.msgText , sentByMe : true})
    $scope.data.msgText = '';
  }
  var validUsers= [
    {'name':'Pradeep','email':'abc@gmail.com'},
  ];
  $scope.authentication = function (){
    if ($scope.data.name.length == 0   || $scope.data.email.length ==0 ) {
      return;
    }
    $scope.data.started=true;
    $scope.data.minimized=false;
    }



});

app.controller('homepage.career' , function($scope , $state , $http , $timeout , $interval){

  $scope.elements = [
    {role: 'FrontEnd Developer',functionalarea:'Web Application Development',experience:'0-1 years',roledetails:'view details',notes:'The truth is that our finest moments are most likely to occur when we are feeling deeply uncomfortable, unhappy, or unfulfilled. For it is only in such moments, propelled by our discomfort, that we are likely to step out of our ruts and start searching for different ways or truer answers.'},
    {role: 'Backend Developer',functionalarea:'Web Application Development',experience:'0-1 years',roledetails:'view details',notes:'The truth is that our finest moments are most likely to occur when we are feeling deeply uncomfortable, unhappy, or unfulfilled. For it is only in such moments, propelled by our discomfort, that we are likely to step out of our ruts and start searching for different ways or truer answers.'},
    {role: 'Android Developer',functionalarea:'Web Application Development',experience:'0-1 years',roledetails:'view details',notes:'The truth is that our finest moments are most likely to occur when we are feeling deeply uncomfortable, unhappy, or unfulfilled. For it is only in such moments, propelled by our discomfort, that we are likely to step out of our ruts and start searching for different ways or truer answers.'},
    {role: 'Software Developer Intern',functionalarea:'Web Application Development',experience:'0-1 years',roledetails:'view details',notes:'The truth is that our finest moments are most likely to occur when we are feeling deeply uncomfortable, unhappy, or unfulfilled. For it is only in such moments, propelled by our discomfort, that we are likely to step out of our ruts and start searching for different ways or truer answers.'}
  ];

});
