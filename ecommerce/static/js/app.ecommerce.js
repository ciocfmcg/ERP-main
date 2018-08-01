app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.ecommerce', {
    url: "/ecommerce",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@businessManagement.ecommerce": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@businessManagement.ecommerce": {
          templateUrl: '/static/ngTemplates/app.ecommerce.vendor.default.html',
          controller: 'businessManagement.ecommerce.default',
        }
    }
  })
  .state('businessManagement.ecommerce.configure', {
    url: "/configure",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.configure.html',
    controller: 'businessManagement.ecommerce.configure'
  })
  .state('businessManagement.ecommerce.listings', {
    url: "/listings",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.listings.html',
    controller: 'businessManagement.ecommerce.listings'
  })
  .state('businessManagement.ecommerce.orders', {
    url: "/orders",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.orders.html',
    controller: 'businessManagement.ecommerce.orders'
  })
  .state('businessManagement.ecommerce.earnings', {
    url: "/earnings",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.earnings.html',
    controller: 'businessManagement.ecommerce.earnings'
  })
  .state('businessManagement.ecommerce.support', {
    url: "/support",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.support.html',
    controller: 'businessManagement.ecommerce.support'
  })
  .state('businessManagement.ecommerce.offerings', {
    url: "/offerings",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.offerings.html',
    controller: 'businessManagement.ecommerce.offerings'
  })
  .state('businessManagement.ecommerce.partners', {
    url: "/partners",
    templateUrl: '/static/ngTemplates/app.ecommerce.vendor.partners.html',
    controller: 'businessManagement.ecommerce.partners'
  })

});
app.controller("businessManagement.ecommerce.default", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $rootScope, $aside) {


  function getMonday( date ) {
      var day = date.getDay() || 7;
      if( day !== 1 )
          date.setHours(-24 * (day - 1));
      return date;
  }

  $scope.today = new Date();
  $scope.firstDay = new Date($scope.today.getFullYear(), $scope.today.getMonth(), 2);
  $scope.monday = getMonday(new Date());

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40, 50, 30, 44, 55, 66]

  ];

  $scope.graphForm = {graphType : 'week'}

  $scope.$watch('graphForm.graphType' , function(newValue , oldValue) {

    if (newValue == 'day') {
      var toSend = {date : $scope.today};
    }else if (newValue == 'week') {
      var toSend = {from : $scope.monday , to : $scope.today};
    }else {
      var toSend = {from : $scope.firstDay , to : $scope.today};
    }

    $http({method : 'POST' , url : '/api/ecommerce/onlineSalesGraphAPI/' , data : toSend}).
    then(function(response) {
      $scope.stats = response.data;
      console.log($scope.stats,'aaaaaaaaaaa');

      $scope.data2 = [$scope.stats.totalCollections, $scope.stats.totalSales.totalAmount__sum];
      console.log($scope.data2,'kkkkkkkkkkkkkkkkkkk')

      $scope.labels = [];
      // $scope.series = ['Series A'];
      $scope.trendData = [
        []
      ];

      for (var i = 0; i < $scope.stats.trend.length; i++) {
        $scope.stats.trend[i]
        $scope.trendData[0].push($scope.stats.trend[i].sum)
        $scope.labels.push($scope.stats.trend[i].created)
      }


      // $scope.labels = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      // $scope.series = ['Series A'];
      // $scope.data = [
      //   [65, 59, 80, 81, 56, 55, 50, 60, 71, 66, 77, 44]
      // ];


    })



  })





  $scope.mode = 'home';
  // $scope.mode = 'invoice'
  $scope.tabs = [];
  $scope.searchTabActive = true;
  var dummyDate = new Date();

  var onlyDate = new Date(dummyDate.getFullYear(), dummyDate.getMonth(), dummyDate.getDate()); // 2013-07-30 23:59:59


















  $scope.labels2 = ["Sales", "Collections"];




});
