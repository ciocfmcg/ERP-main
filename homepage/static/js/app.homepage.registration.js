
app.controller('registration' , function($scope , $state , $http , $timeout , $interval){
  console.log("registration loded");
  $scope.mode = 'main';

  $scope.validity = {firstName : null , lastName : null, email : null ,mobile : null,password : null , rePassword: null };

  $scope.form = {firstName :null ,lastName : null , email : null ,mobile : null , password : null, rePassword : null , emailOTP : null , mobileOTP: null , token: null , reg : null , agree : false};
  $scope.validityChecked = false;
  $scope.validityChecked2 = false;

  $scope.getOTP = function() {
    $scope.validityChecked = true;
    console.log($scope.form);

    if (!$scope.form.agree || $scope.form.firstName == undefined || $scope.form.firstName == null || $scope.form.firstName.length ==0 || $scope.form.lastName == undefined || $scope.form.lastName == null || $scope.form.lastName.length ==0 || $scope.form.email == undefined || $scope.form.email == null || $scope.form.email.length ==0 || $scope.form.mobile == undefined || $scope.form.mobile == null || $scope.form.mobile.length ==0 || $scope.form.password == undefined || $scope.form.password == null || $scope.form.password.length <6 || $scope.form.email.indexOf('@') == -1 ) {
      console.log("form not valid , returning");

      return;
    }

    var toSend= {
      mobile : $scope.form.mobile,
      email : $scope.form.email,
    }
    $http({method : 'POST' , url : '/api/homepage/registration/' , data : toSend}).
    then(function(response) {


      if (($scope.form.password != null && $scope.form.password.length <6) || $scope.form.password == null ) {
        return;
      }


      $scope.form.token = response.data.token;
      $scope.form.reg = response.data.pk;
      $scope.mode = 'verify';
    })


  }

  $scope.verify = function() {

    $http({method : 'PATCH' , url : '/api/homepage/registration/' + $scope.form.reg + '/', data : $scope.form }).
    then(function(response) {
      console.log(response);
      window.location.href = "/ERP";
    }, function(err) {
      console.log(err);
      if (err.status == 400) {
        $scope.validityChecked2 = true;
      }
    })
  }

  $scope.loading = true;

  $scope.$watch('form' , function(newValue , oldValue) {

    if ($scope.loading) {
      $scope.loading = false;
      return;
    }
    console.log(newValue);
    if (newValue.firstName != null && newValue.firstName.length > 0) {
      $scope.validity.firstName = true;
      $scope.form.firstName = toTitleCase(newValue.firstName);
    }
    if (newValue.firstName == undefined) {
      $scope.validity.firstName = false;
    }

    if (newValue.lastName != null && newValue.lastName.length > 0) {
      $scope.validity.lastName = true;
      $scope.form.lastName = toTitleCase(newValue.lastName);
    }
    if (newValue.lastName == undefined) {
      $scope.validity.lastName = false;
    }

    console.log($scope.validity);
  }, true)

});
