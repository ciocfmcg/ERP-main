app.controller('businessManagement.tools.PDF' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

  $scope.form = {file : emptyFile};



  $scope.process = function() {

    var fd = new FormData();
    fd.append('file' , $scope.form.file);

    $http({method : 'POST' , url : '/api/tools/COI/' , data : fd, transformRequest: angular.identity,
    headers: {
      'Content-Type': undefined
    }  }).
    then(function(response) {

      console.log(response);
      $scope.result = response.data.data;

    })



  }

})
