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

  $scope.startSession = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.tutor.addSession.form.html',
      size: 'md',
      backdrop : true,
      controller: function($scope ){
        $scope.form = {subject : null , topic : '' , question : ''}
        $scope.validity = {subject : false , topic : false , question : false}
        $scope.showErrors = false;
        $scope.subjects = [];
        $scope.topics = [];

        $http({method : 'GET' , url : '/api/LMS/subject/'}).
        then(function(response) {

          $scope.subjects = response.data;


        });

        $scope.start = function() {
          $scope.status = 'idle';
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
      size: 'md',
      backdrop : true,
      controller: function($scope ){


      },
    })
  }


});
