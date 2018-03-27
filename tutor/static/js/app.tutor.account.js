app.config(function($stateProvider) {

  $stateProvider
    .state('account', {
      url: "/account",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.tutor.account.html',
          controller: 'home.tutor.account',
        }
      }
    })


  console.log("Configured");
});

app.controller("home.tutor.account", function($scope, $state, $users, $stateParams, $http, Flash) {

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.tutors.transactions.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/tutors/tutors24Transaction/',
    searchField: 'ref_id',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }

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
      mobile: null
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

    if (f.schoolName.length >0) {
      tutors24Data.schoolName = f.schoolName;
    }
    if (f.mobile != null) {
      tutors24Data.mobile = f.mobile;
    }
    if (f.street.length >0) {
      tutors24Data.street = f.street;
    }
    if (f.city.length >0) {
      tutors24Data.city = f.city;
    }
    if (f.state.length >0) {
      tutors24Data.state = f.state;
    }
    if (f.country.length >0) {
      tutors24Data.country = f.country;
    }
    if (f.pinCode != null) {
      tutors24Data.pinCode = f.pinCode;
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
