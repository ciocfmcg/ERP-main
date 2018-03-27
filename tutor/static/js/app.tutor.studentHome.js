app.config(function($stateProvider){

  $stateProvider
  .state('studentHome', {
    url: "/studentHome",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.tutor.studentHome.html',
          controller : 'home.tutor.studentHome',
       }
    }
  })

});

app.controller("home.tutor.studentHome", function($scope , $state , $users ,  $stateParams , $http , Flash , $uibModal) {

  $scope.form = {minutes1 : 0 , minutes2 : 0 , hours1 : 0, hours2 : 0}

  $http({method : 'GET' , url : '/api/tutors/Tutor24User/' }).
  then(function(response) {
    $scope.profile = response.data;

    $scope.profile.balance = 145;
    var minutes = $scope.profile.balance%60;
    var hours = parseInt($scope.profile.balance/60);

    console.log(minutes);
    console.log(hours);

    $scope.form.minutes1 = parseInt(minutes/10);
    $scope.form.minutes2 = minutes%10;

    $scope.form.hours1 = parseInt(hours/10);
    $scope.form.hours2 = hours%10;

    console.log($scope.form);

  })


  $scope.startSession = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.tutor.addSession.form.html',
      size: 'md',
      backdrop : false,
      controller: function($scope , $uibModalInstance ){
        $scope.form = {subject : null , topic : null , question : undefined}
        $scope.validity = {subject : false , topic : false , question : false}
        $scope.showErrors = false;
        $scope.subjects = [];
        $scope.topics = [];

        $scope.cancel = function() {
          $uibModalInstance.dismiss();
        }

        $http({method : 'GET' , url : '/api/LMS/subject/'}).
        then(function(response) {
          $scope.subjects = response.data;
        });

        $scope.$watch('form.subject' , function(newValue , oldValue) {
          console.log(newValue);
          if (newValue != null) {
            $http({method : 'GET' , url : '/api/LMS/topic/?subject=' + newValue }).
            then(function(response) {
              $scope.topics = response.data;
            });
          }
        }, true)
        $scope.status = 'idle';
        $scope.start = function() {

          console.log($scope.form);
          $scope.showErrors = true;
          if ($scope.form.subject == null) {
            $scope.validity.subject = false;
            return;
          }

          if ($scope.form.topic == null) {
            $scope.validity.topic = false;
            return;
          }

          if ($scope.form.question == undefined || $scope.form.question.length == 0) {
            $scope.validity.question = false;
            return;
          }

          $scope.status = 'starting';

          console.log("startSessop");


        }


      },
    })
  }

  $scope.addHours = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.tutor.addHours.form.html',
      size: 'lg',
      backdrop : true,
      controller: function($scope ){
        $scope.form= {minutes : 30 , promoStatus : null , promo: '' , promoPercent : 0 , rate : 150}

        $scope.getDicount = function() {
          return $scope.form.rate * parseInt($scope.form.minutes) * $scope.form.promoPercent /(100*60);
        }

        $scope.getTax = function() {
          var total = $scope.form.rate * $scope.form.minutes/60;
          return (total- $scope.getDicount())*0.18;
        }

        $scope.getTotal = function() {
          return $scope.form.rate * $scope.form.minutes/60;
        }

        $scope.addPromoCode = function() {
          if ($scope.form.promo == 'FEE') {
            $scope.form.promoStatus = true;
            $scope.form.promoPercent = 50;
          }else{
            $scope.form.promoStatus = false;
            $scope.form.promoPercent = 0;
          }
        }

        $scope.getGrand = function() {
          return parseInt($scope.getTax()*1.18/0.18);
        }


        $scope.add = function(val) {
          if ($scope.form.minutes == undefined || $scope.form.minutes.length == 0) {
            var prev = 0;
          }else{
            var prev = parseInt($scope.form.minutes);
          }

          $scope.form.minutes = prev +val;
        }


      },
    })
  }


});
