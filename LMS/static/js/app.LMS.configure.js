app.config(function($stateProvider){
  $stateProvider.state('projectManagement.LMS.configure', {
    url: "/configure",
    templateUrl: '/static/ngTemplates/app.LMS.configure.html',
    controller: 'projectManagement.LMS.configure'
  });
});

app.controller("projectManagement.LMS.configure", function($scope, $state, $users, $stateParams, $http, Flash) {


});

app.controller("projectManagement.LMS.configure.form", function($scope, $state, $users, $stateParams, $http, Flash) {
  $scope.mode = 'topic';

  $scope.resetForm = function() {
    $scope.form = {title : '' , description : '' , dp : emptyFile , subject : '' , level : 0}
  }

  $scope.subjectSearch = function(query) {
    return $http.get( '/api/LMS/subject' +'?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.resetForm();

  $scope.save = function() {

    var toSend = new FormData();

    toSend.append('title' , $scope.form.title)
    toSend.append('description' , $scope.form.description)


    if ($scope.mode == 'subject') {
      toSend.append('dp' , $scope.form.dp)
      toSend.append('level' , $scope.form.level)
    }else {
      if (typeof $scope.form.subject != 'object') {
        Flash.create('warning' , 'Subject is required for a topic');
        return;
      }
      toSend.append('subject' , $scope.form.subject.pk)
    }

    $http({
      method: 'POST',
      url: '/api/LMS/' + $scope.mode + '/',
      data: toSend,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success' , 'Saved');
      $scope.resetForm();

    })



  }



});
