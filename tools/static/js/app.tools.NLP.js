app.controller('businessManagement.tools.NLP' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller
  $scope.data = {input : '', apiKey: '30000$CbP7NzmWJaCF$PW5hROgNGXIVzpc7dVyoQ/PzTbNtWGziQiZfkF3L0rc=', keyValid : false, remaining : 0}

  $scope.veryfyKey = function() {
    $http({method : 'GET', url : '/api/tools/apiAccountPublic/', params: {key: $scope.data.apiKey}}).
    then(function(response) {
      Flash.create('success' , 'API key valid. Welcome!')
      console.log(response);
      $scope.data.keyValid = true;
      $scope.data.remaining = response.data.remaining;
    }, function(err) {

    });
  }


  $scope.process = function(type) {

    var dataToSend = {

    }
    $http({method : 'POST', url : '/api/tools/nlp/', data : dataToSend}).
    then(function(response) {

    }, function(err) {

    });




  }

  $scope.clear = function() {
    $scope.data.input = ''
  }


  $scope.veryfyKey()

})
