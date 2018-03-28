app.config(function($stateProvider) {

  $stateProvider
    .state('tutorAccount', {
      url: "/tutorAccount",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.tutor.tutorAccount.html',
          controller: 'home.tutor.tutorAccount',
        }
      }
    })


  console.log("Configured");
});

app.controller("home.tutor.tutorAccount", function($scope, $state, $users, $stateParams, $http, Flash) {


    $scope.form = {
      gender: 'M',
      school: 'S',
      standard: '1',
      schoolName: '',
      street: '',
      city: '',
      pinCode: null,
      state: '',
      country: '',
      mobile: null,
      parentEmail : '',
      parentMobile : null,
    }


  $http.get('/api/tutors/Tutor24User/').
  then(function(response) {
    console.log('*******************************', response.data);
    $scope.form.tutorPk = response.data.tutorObj.tutorPk;
    $scope.form.school = response.data.tutorObj.school;
    $scope.form.standard = response.data.tutorObj.standard;
    $scope.form.schoolName = response.data.tutorObj.schoolName;
    $scope.form.street = response.data.tutorObj.street;
    $scope.form.city = response.data.tutorObj.city;
    $scope.form.pinCode = response.data.tutorObj.pinCode;
    $scope.form.state = response.data.tutorObj.state;
    $scope.form.country = response.data.tutorObj.country;
    $scope.form.hrPk = response.data.hrObj.hrPk;
    $scope.form.gender = response.data.hrObj.gender;
    $scope.form.mobile = response.data.hrObj.mobile;
    $scope.form.parentEmail = response.data.tutorObj.parentEmail;
    $scope.form.parentMobile = response.data.tutorObj.parentMobile;
    $scope.form.isTutor = response.data.tutorObj.isTutor;
  })



  $scope.saveTutorProfile = function() {
    console.log('entrrrrrrrrrrrrrrrrrrrrrrr');
    var f = $scope.form;
    console.log(f);
    var tutors24Data = {
      'gender': f.gender,
      'standard': f.standard,
      'school': f.school
    }

    if (f.schoolName != null && f.schoolName.length >0) {
      tutors24Data.schoolName = f.schoolName;
    }
    if (f.mobile != null) {
      tutors24Data.mobile = f.mobile;
    }
    if (f.street != null && f.street.length >0) {
      tutors24Data.street = f.street;
    }
    if (f.city != null && f.city.length >0) {
      tutors24Data.city = f.city;
    }
    if (f.state != null && f.state.length >0) {
      tutors24Data.state = f.state;
    }
    if (f.country != null && f.country.length >0) {
      tutors24Data.country = f.country;
    }
    if (f.pinCode != null) {
      tutors24Data.pinCode = f.pinCode;
    }
    if (f.parentEmail != null && f.parentEmail.length >0) {
      tutors24Data.parentEmail = f.parentEmail;
    }
    if (f.parentMobile != null) {
      tutors24Data.parentMobile = f.parentMobile;
    }

    console.log(tutors24Data);
    $http({
      method: 'PATCH',
      url: '/api/tutors/tutors24Profile/' + $scope.form.tutorPk + '/',
      data: tutors24Data,
    }).
    then(function(response) {
      Flash.create('success', 'Saved')
    })

    // $http({
    //   method: 'PATCH',
    //   url: '/api/tutors/tutors24Profile/'+$scope.form.tutorPk+'/',
    //   data: fd,
    // }).
    // then(function(response) {
    //   $scope.form = response.data;
    //   console.log(response.data);
    //
    // })



  }

});
