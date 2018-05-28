app.controller('admin.manageUsers.mailAccount', function($scope, $http) {
  $scope.generateMailPasskey = function() {
    console.log($scope);
    console.log($scope.data);
    $http({
      method: 'PATCH',
      url: '/api/mail/account/' + $scope.data.mailAccount.pk + '/?user=' + $scope.data.mailAccount.user
    }).
    then(function(response) {
      $scope.data.mailAccount = response.data;
    });
  }
});

app.controller('sudo.manageUsers.explore', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout) {

  $scope.data = $scope.tab.data;
  console.log($scope.data);


  console.log('aaaaaaaaaaaaaaaaaaaaaa', $scope.data.pk);
  $http({
    method: 'GET',
    url: '/api/HR/payroll/?user=' + $scope.data.userPK
  }).
  then(function(response) {
    $scope.payroll = response.data[0];
    console.log($scope.payroll);
  })
  console.log('((((((((((((((()))))))))))))))', $scope.data.userPK);
  $http({
    method: 'GET',
    url: '/api/HR/designation/?user=' + $scope.data.userPK
  }).
  then(function(response) {
    console.log(response.data, '&&&&&&&&&&&&&&&&&&&&&&&7');
    $scope.designation = response.data[0];
    console.log($scope.designation);


    if (typeof $scope.designation.division == 'number') {
      $http({
        method: 'GET',
        url: '/api/organization/divisions/' + $scope.designation.division + '/'
      }).
      then(function(response) {
        $scope.designation.division = response.data;
      })
    }

    if (typeof $scope.designation.unit == 'number') {
      $http({
        method: 'GET',
        url: '/api/organization/unit/' + $scope.designation.unit + '/'
      }).
      then(function(response) {
        $scope.designation.unit = response.data;
      })

    }

  })




});

app.controller('sudo.manageUsers.editPayroll', function($scope, $http, Flash, $users) {
  console.log($scope.tab.data);
  $scope.user = $users.get($scope.tab.data.user);

  $scope.form = $scope.tab.data;
  $scope.save = function() {
    console.log(typeof $scope.form.joiningDate);
    // make patch request
    var f = $scope.form;
    dataToSend = {
      // user: f.pk,
      hra: f.hra,
      special: f.special,
      lta: f.lta,
      basic: f.basic,
      taxSlab: f.taxSlab,
      adHoc: f.adHoc,
      policyNumber: f.policyNumber,
      provider: f.provider,
      amount: f.amount,
      noticePeriodRecovery: f.noticePeriodRecovery,
      al: f.al,
      ml: f.ml,
      adHocLeaves: f.adHocLeaves,
      off: f.off,
      accountNumber: f.accountNumber,
      ifscCode: f.ifscCode,
      bankName: f.bankName,
      deboarded: f.deboarded,
      PFUan: f.PFUan,
      pan: f.pan,


    }

    if (typeof f.joiningDate == 'object') {
      dataToSend.joiningDate = f.joiningDate.toJSON().split('T')[0]
    } else {
      dataToSend.joiningDate = f.joiningDate
    }

    // if (typeof f.lastWorkingDate == 'object') {
    //   dataToSend.lastWorkingDate = f.lastWorkingDate.toJSON().split('T')[0]
    // } else {
    //   dataToSend.lastWorkingDate = f.lastWorkingDate
    // }

    if (f.lastWorkingDate != null) {
      dataToSend.lastWorkingDate = f.lastWorkingDate.toJSON().split('T')[0]
    }


    $http({
      method: 'PATCH',
      url: '/api/HR/payroll/' + f.pk + '/',
      data: dataToSend
    }).
    then(function(response) {

      // $scope.data.pk=response.data.pk

      Flash.create('success', response.status + ' : ' + response.statusText);
      // }, function(response){
      //    Flash.create('danger', response.status + ' : ' + response.statusText);
    }, function(err) {

    })



  }




});

app.controller('sudo.manageUsers.editDesignation', function($scope, $http, Flash, $users) {

  // $scope.user = $users.get($scope.tab.data.user);

  $scope.divisionSearch = function(query) {
    return $http.get('/api/organization/divisions/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data);
      return response.data;
    })
  };

  $scope.unitSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/unit/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };

  $scope.depSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/departments/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };

  $scope.roleSearch = function(query) {
    // console.log('************',query);
    return $http.get('/api/organization/role/?name__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };

  $scope.form = $scope.tab.data;

  if (typeof $scope.form.reportingTo == 'number') {
    $scope.form.reportingTo = $users.get($scope.form.reportingTo);
  }

  if (typeof $scope.form.secondaryApprover == 'number') {
    $scope.form.secondaryApprover = $users.get($scope.form.secondaryApprover);
  }

  if (typeof $scope.form.primaryApprover == 'number') {
    $scope.form.primaryApprover = $users.get($scope.form.primaryApprover);
  }
  if (typeof $scope.form.division == 'number') {
    $http({
      method: 'GET',
      url: '/api/organization/divisions/' + $scope.form.division + '/'
    }).
    then(function(response) {
      $scope.form.division = response.data;
    })
  }

  if (typeof $scope.form.unit == 'number') {
    $http({
      method: 'GET',
      url: '/api/organization/unit/' + $scope.form.unit + '/'
    }).
    then(function(response) {
      $scope.form.unit = response.data;
    })
  }

  if (typeof $scope.form.department == 'number') {
    $http({
      method: 'GET',
      url: '/api/organization/departments/' + $scope.form.department + '/'
    }).
    then(function(response) {
      $scope.form.department = response.data;
    })
  }

  if (typeof $scope.form.role == 'number') {
    $http({
      method: 'GET',
      url: '/api/organization/role/' + $scope.form.role + '/'
    }).
    then(function(response) {
      $scope.form.role = response.data;
    })
  }





  console.log('pppppppppppppppppppp', $scope.tab.data);
  $scope.save = function() {
    // make patch request
    var f = $scope.form;
    dataToSend = {
      // user: f.pk,
      reportingTo: f.reportingTo.pk,
      primaryApprover: f.primaryApprover.pk,
      secondaryApprover: f.secondaryApprover.pk,
      division: f.division.pk,
      unit: f.unit.pk,
      department: f.department.pk,
      role: f.role.pk

    }

    $http({
      method: 'PATCH',
      url: '/api/HR/designation/' + f.pk + '/',
      data: dataToSend
    }).
    then(function(response) {

      // $scope.form.pk = response.data.pk;
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(err) {})
  }
});



app.controller('sudo.admin.editProfile', function($scope, $http, $aside, $state, Flash, $users, $filter, $timeout) {

  $scope.page = 1;
  $scope.maxPage = 3;
  console.log($scope.tab);

  $scope.data = $scope.tab.data;
  $scope.next = function() {
    console.log("came to next");
    if ($scope.page < $scope.maxPage) {
      $scope.page += 1;
    }
  }

  $scope.prev = function() {
    if ($scope.page > 1) {
      $scope.page -= 1;
    }
  }

  $scope.saveFirstPage = function() {
    var prof = $scope.data;

    console.log($scope.data);

    var dataToSend = {
      empID: prof.empID,
      prefix: prof.prefix,
      // dateOfBirth: prof.dateOfBirth.toJSON().split('T')[0],

      gender: prof.gender,
      permanentAddressStreet: prof.permanentAddressStreet,
      permanentAddressCity: prof.permanentAddressCity,
      permanentAddressPin: prof.permanentAddressPin,
      permanentAddressState: prof.permanentAddressState,
      permanentAddressCountry: prof.permanentAddressCountry,
      sameAsShipping: prof.sameAsShipping,
      localAddressStreet: prof.localAddressStreet,
      localAddressCity: prof.localAddressCity,
      localAddressPin: prof.localAddressPin,
      localAddressState: prof.localAddressState,
      localAddressCountry: prof.localAddressCountry,
      email: prof.email,
      mobile: prof.mobile,
      emergency: prof.emergencyName + '::' + prof.emergencyNumber,
      bloodGroup: prof.bloodGroup,
    }
    if (prof.married) {
      dataToSend.married = prof.married;
      dataToSend.anivarsary = prof.anivarsary.toJSON().split('T')[0]
    }

    if (typeof prof.dateOfBirth == 'object') {
      dataToSend.dateOfBirth = prof.dateOfBirth.toJSON().split('T')[0]
    } else {
      dataToSend.dateOfBirth = prof.dateOfBirth
    }

    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + prof.pk + '/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', "Saved");
    })
  }

  $scope.saveSecondPage = function() {


    var f = $scope.data;
    var dataToSend = {
      website: f.website,
      almaMater: f.almaMater,
      pgUniversity: f.pgUniversity,
      docUniversity: f.docUniversity,
      fathersName: f.fathersName,
      mothersName: f.mothersName,
      wifesName: f.wifesName,
      childCSV: f.childCSV,
      note1: f.note1,
      note2: f.note2,
      note3: f.note3,
    }

    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + f.pk + '/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', "Saved");
    })

  }

  $scope.files = {
    'TNCandBond': emptyFile,
    'resume': emptyFile,
    'certificates': emptyFile,
    'transcripts': emptyFile,
    'otherDocs': emptyFile,
    'resignation': emptyFile,
    'vehicleRegistration': emptyFile,
    'appointmentAcceptance': emptyFile,
    'pan': emptyFile,
    'drivingLicense': emptyFile,
    'cheque': emptyFile,
    'passbook': emptyFile,
    'sign': emptyFile,
    'IDPhoto': emptyFile

  }

  $scope.saveFiles = function() {
    var f = $scope.files;
    var fd = new FormData();

    var fileFields = ['TNCandBond', 'resume', 'certificates', 'transcripts', 'otherDocs', 'resignation', 'vehicleRegistration', 'appointmentAcceptance', 'pan', 'drivingLicense', 'cheque', 'passbook', 'sign', 'IDPhoto']
    for (var i = 0; i < fileFields.length; i++) {
      if ($scope.files[fileFields[i]] != emptyFile) {
        fd.append(fileFields[i], $scope.files[fileFields[i]])
      }
    }

    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + $scope.data.pk + '/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      console.log(response);
      Flash.create('success', "Saved");

    })
  }

  $scope.save = function() {
    if ($scope.page == 1) {
      $scope.saveFirstPage();
    } else if ($scope.page == 2) {
      $scope.saveSecondPage();
    } else {
      $scope.saveFiles();
    }
  }

});




app.controller('admin.manageUsers', function($scope, $http, $aside, $state, Flash, $users, $filter) {

  // var views = [{name : 'table' , icon : 'fa-bars' , template : '/static/ngTemplates/genericTable/tableDefault.html'},
  //     {name : 'thumbnail' , icon : 'fa-th-large' , template : '/static/ngTemplates/empSearch/tableThumbnail.html'},
  //     {name : 'icon' , icon : 'fa-th' , template : '/static/ngTemplates/empSearch/tableIcon.html'},
  //     {name : 'graph' , icon : 'fa-pie-chart' , template : '/static/ngTemplates/empSearch/tableGraph.html'}
  //   ];

  var views = [{
      name: 'table',
      icon: 'fa-bars',
      template: '/static/ngTemplates/genericTable/genericSearchList.html',
      itemTemplate: '/static/ngTemplates/app.HR.manage.users.items.html'
    },
    // {name : 'thumbnail' , icon : 'fa-th-large' , template : '/static/ngTemplates/empSearch/tableThumbnail.html'},
    // {name : 'icon' , icon : 'fa-th' , template : '/static/ngTemplates/empSearch/tableIcon.html'},
    // {name : 'graph' , icon : 'fa-pie-chart' , template : '/static/ngTemplates/empSearch/tableGraph.html'}
  ];

  var options = {
    main: {
      icon: 'fa-envelope-o',
      text: 'im'
    },
    others: [{
        icon: '',
        text: 'social'
      },
      {
        icon: '',
        text: 'editProfile'
      },
      {
        icon: '',
        text: 'editDesignation'
      },
      {
        icon: '',
        text: 'editPermissions'
      },
      {
        icon: '',
        text: 'editMaster'
      },
      {
        icon: '',
        text: 'editPayroll'
      },
      {
        icon: '',
        text: 'viewProfile'
      },
    ]
  };
  var fields = ['username', 'email', 'first_name', 'last_name', 'profile'];

  var multiselectOptions = [{
      icon: 'fa fa-book',
      text: 'Learning'
    },
    {
      icon: 'fa fa-bar-chart-o',
      text: 'Performance'
    },
    {
      icon: 'fa fa-envelope-o',
      text: 'message'
    },
  ];

  $scope.config = {
    url: '/api/HR/users/',
    views: views,
    options: options,
    itemsNumPerView: [12, 24, 48],
    multiselectOptions: multiselectOptions,
    searchField: 'username',
    fields: fields,
  };

  $scope.tabs = [];
  $scope.searchTabActive = true;
  $scope.data = {
    tableData: []
  };

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {

      if ($scope.tabs[i].app == input.app) {
        if ((typeof $scope.tabs[i].data.url != 'undefined' && $scope.tabs[i].data.url == input.data.url) || (typeof $scope.tabs[i].data.pk != 'undefined' && $scope.tabs[i].data.pk == input.data.pk)) {
          $scope.tabs[i].active = true;
          alreadyOpen = true;
        }
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }




  // create new user
  $scope.newUser = {
    username: '',
    firstName: '',
    lastName: '',
    password: ''
  };
  $scope.createUser = function() {
    dataToSend = {
      username: $scope.newUser.username,
      first_name: $scope.newUser.firstName,
      last_name: $scope.newUser.lastName,
      password: $scope.newUser.password
    };
    $http({
      method: 'POST',
      url: '/api/HR/usersAdminMode/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
      $scope.newUser = {
        username: '',
        firstName: '',
        lastName: '',
        password: ''
      };
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }


  $scope.tableAction = function(target, action, mode) {
    // target is the url of the object
    if (typeof mode == 'undefined') {
      if (action == 'im') {
        $scope.$parent.$parent.addIMWindow(target);
      } else if (action == 'editProfile') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == target) {
            u = $users.get(target)
            $http.get('/api/HR/profileAdminMode/' + $scope.data.tableData[i].profile.pk + '/').
            success((function(target) {
              return function(response) {
                u = $users.get(target)
                console.log("will add tab profile : ");
                console.log(response);
                $scope.addTab({
                  title: 'Edit Profile for ' + u.first_name + ' ' + u.last_name,
                  cancel: true,
                  app: 'editProfile',
                  data: response,
                  active: true
                })

                console.log($scope.tabs);
              }
            })(target));
          }
        }

      } else if (action == 'social') {
        $state.go('home.social', {
          id: target
        })
      } else if (action == 'editMaster') {
        console.log(target);
        $http({
          method: 'GET',
          url: '/api/HR/usersAdminMode/' + target + '/'
        }).
        then(function(response) {
          $http({
            method: 'GET',
            url: '/api/mail/account/?user=' + target
          }).
          then((function(userData) {
            return function(response) {
              userData.mailAccount = response.data[0];
              $scope.addTab({
                title: 'Edit master data  for ' + userData.first_name + ' ' + userData.last_name,
                cancel: true,
                app: 'editMaster',
                data: userData,
                active: true
              })
            }
          })(response.data))
        })
      } else if (action == 'editPermissions') {
        u = $users.get(target)
        $http.get('/api/ERP/application/?user=' + u.username).
        success((function(target) {
          return function(data) {
            u = $users.get(target)
            permissionsFormData = {
              appsToAdd: data,
              url: target,
            }
            $scope.addTab({
              title: 'Edit permissions for ' + u.first_name + ' ' + u.last_name,
              cancel: true,
              app: 'editPermissions',
              data: permissionsFormData,
              active: true
            })
          }
        })(target));
      } else if (action == 'viewProfile') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == target) {
            u = $users.get(target)
            $http.get('/api/HR/profileAdminMode/' + $scope.data.tableData[i].profile.pk + '/').
            success((function(target) {
              return function(response) {
                response.userPK = target;
                u = $users.get(target)
                console.log("will add tab profile : ");
                console.log(response);
                $scope.addTab({
                  title: 'Profile for ' + u.first_name + ' ' + u.last_name,
                  cancel: true,
                  app: 'viewProfile',
                  data: response,
                  active: true
                })

                console.log($scope.tabs);
              }
            })(target));
          }
        }
      } else if (action == 'editDesignation') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == target) {
            u = $users.get(target)
            $http.get('/api/HR/designation/' + $scope.data.tableData[i].designation + '/').
            success((function(target) {
              return function(response) {
                response.userPK = target;
                // console.log(target);
                u = $users.get(target)
                console.log("will add tab profile : ");
                console.log(response);
                $scope.addTab({
                  title: 'Edit Designation for ' + u.first_name + ' ' + u.last_name,
                  cancel: true,
                  app: 'editDesignation',
                  data: response,
                  active: true
                })

                console.log($scope.tabs);
              }
            })(target));
          }
        }
      } else if (action == 'editPayroll') {
        for (var i = 0; i < $scope.data.tableData.length; i++) {
          if ($scope.data.tableData[i].pk == target) {
            u = $users.get(target)
            $http.get('/api/HR/payroll/' + $scope.data.tableData[i].payroll.pk + '/').
            success((function(target) {
              return function(response) {
                u = $users.get(target)
                console.log("will add tab payroll : ");
                console.log(response);
                $scope.addTab({
                  title: 'Edit payroll for ' + u.first_name + ' ' + u.last_name,
                  cancel: true,
                  app: 'editPayroll',
                  data: response,
                  active: true
                })

                console.log($scope.tabs);

              }
            })(target));
          }
        }
      }
      // for the single select actions
    } else {
      if (mode == 'multi') {
        console.log(target);
        console.log(action);
      }
    }
  }

  $scope.updateUserPermissions = function(index) {
    var userData = $scope.tabs[index].data;
    if (userData.appsToAdd.length == 0) {
      Flash.create('warning', 'No new permission to add')
      return;
    }
    var apps = [];
    for (var i = 0; i < userData.appsToAdd.length; i++) {
      apps.push(userData.appsToAdd[i].pk)
    }
    var dataToSend = {
      user: getPK(userData.url),
      apps: apps,
    }
    $http({
      method: 'POST',
      url: '/api/ERP/permission/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    })

  }

  $scope.getPermissionSuggestions = function(query) {
    return $http.get('/api/ERP/application/?name__contains=' + query)
  }

  $scope.updateProfile = function(index) {
    userData = $scope.tabs[index].data;
    var fd = new FormData();
    for (key in userData) {
      if (key != 'url' && userData[key] != null) {
        if ($scope.profileFormStructure[key].type.indexOf('integer') != -1) {
          if (userData[key] != null) {
            fd.append(key, parseInt(userData[key]));
          }
        } else if ($scope.profileFormStructure[key].type.indexOf('date') != -1) {
          if (userData[key] != null) {
            fd.append(key, $filter('date')(userData[key], "yyyy-MM-dd"));
          }
        } else if ($scope.profileFormStructure[key].type.indexOf('url') != -1 && (userData[key] == null || userData[key] == '')) {
          // fd.append( key , 'http://localhost');
        } else {
          fd.append(key, userData[key]);
        }
      }
    }
    $http({
      method: 'PATCH',
      url: '/api/HR/profileAdminMode/' + userData.pk + '/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  };

  $scope.updateUserMasterDetails = function(index) {
    var userData = $scope.tabs[index].data;
    dataToSend = {
      username: userData.username,
      last_name: userData.last_name,
      first_name: userData.first_name,
      is_staff: userData.is_staff,
      is_active: userData.is_active,
    }
    if (userData.password != '') {
      dataToSend.password = userData.password
    }
    $http({
      method: 'PATCH',
      url: userData.url.replace('users', 'usersAdminMode'),
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', response.status + ' : ' + response.statusText);
    }, function(response) {
      Flash.create('danger', response.status + ' : ' + response.statusText);
    });
  }


  $scope.Reporting = function(query) {
    // console.log('************',query);
    console.log("@@@@@@@@@@@@@@");
    return $http.get('/api/HR/users/?username__contains=' + query).
    then(function(response) {
      console.log('@', response.data)
      return response.data;
    })
  };


});
