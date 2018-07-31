app.controller('admin.settings.configure.blog' , function($scope , $stateParams , $http , $aside , $state , Flash , $users , $filter){
  console.log('hey');

  $scope.editor = {title : '' , pk : null}

  $http({method : 'GET' , url : '/api/PIM/blogTags/'}).
  then(function(response) {
    $scope.tags = response.data;
  })

  $scope.edit = function(index) {
    $scope.tagBackup = angular.copy($scope.tags[index]);
    $scope.tags.splice(index , 1)
    $scope.editor.title = angular.copy($scope.tagBackup.title);
    $scope.editor.pk = angular.copy($scope.tagBackup.pk);
  }

  $scope.saveCategory = function() {
    var url = '/api/PIM/blogTags/'
    var method = 'POST';
    var dataToSend = {
      title : $scope.editor.title
    };
    if($scope.editor.pk != null){
      $scope.tagBackup.title = $scope.editor.title;
      url += $scope.editor.pk + '/';
      method = 'PATCH';
    }

    $http({method : method , url : url , data : dataToSend}).
    then(function(response) {
      $scope.tags.push(response.data);
      $scope.editor = {title : '' , pk : null};
    })

  }

  $scope.delete = function(index) {
    $http({method : 'DELETE' , url : '/api/PIM/blogTags/' + $scope.tags[index].pk +'/'}).
    then(function(response) {
      $scope.tags.splice(index , 1);
    })
  }

  $scope.cancelEditor = function() {
    $scope.tags.push($scope.tagBackup);
    $scope.editor = {title : '' , pk : null};
  }

});

app.controller('admin.settings.configure.calendar.form' , function($scope , $stateParams , $http , $aside , $state , Flash , $users , $filter){
  console.log('hey');

  $scope.holiDayForm = {name : '' , typ : 'national' , date : new Date()}

  $scope.saveHoliday = function() {
    if ($scope.holiDayForm.name == null || $scope.holiDayForm.name.length == 0) {
      Flash.create('warning', 'Please Mention The Name' );
      return
    }
    if ($scope.holiDayForm.date == null) {
      Flash.create('warning', 'Please Select The Date' );
      return
    }
    var url = '/api/ERP/companyHoliday/'
    var method = 'POST';
    var dataToSend = {
      typ : $scope.holiDayForm.typ,
      name : $scope.holiDayForm.name,
    };
    if (typeof $scope.holiDayForm.date == 'object') {
      dataToSend.date = $scope.holiDayForm.date.toJSON().split('T')[0]
    }else {
      dataToSend.date = $scope.holiDayForm.date
    }
    if ($scope.holiDayForm.pk) {
      url += $scope.holiDayForm.pk + '/'
      method = 'PATCH'
    }
    console.log(dataToSend);
    $http({method : method , url : url , data : dataToSend}).
    then(function(response) {
      console.log(response.data);
      if ($scope.holiDayForm.pk) {
        Flash.create('success', 'Updated' );
      }else {

        Flash.create('success', 'Created' );
      }
      $scope.holiDayForm = {typ : 'national' , date : new Date()}
    })
  }

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.ERP.settings.configure.calendar.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/ERP/companyHoliday/',
    searchField: 'name',
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        console.log($scope.holiDayForm);
        if (action == 'edit') {
          var title = 'Edit :';
          var appType = 'divisionEditor';
          console.log('yessssssssss',$scope.data.tableData[i]);
          $scope.holiDayForm = $scope.data.tableData[i]
          console.log($scope.holiDayForm);
        }
      }
    }
  }


});


app.controller('admin.settings.configure' , function($scope , $stateParams , $http , $aside , $state , Flash , $users , $filter){

  // settings for dashboard controller
  if (typeof $stateParams.canConfigure == 'undefined') {
    return;
  }

  $http({method:'GET' , url : '/api/ERP/appSettingsAdminMode/?app=' + $stateParams.canConfigure}).
  then(function(response){
    $scope.settings = response.data;
    for (var i = 0; i < $scope.settings.length; i++) {
      $scope.settings[i].data = $scope.settings[i][$scope.settings[i].fieldType];
    }
  })

  $scope.save = function(){
    for (var i = 0; i < $scope.settings.length; i++) {
      if ($scope.settings[i].fieldType == 'flag') {
        dataToSend = {
          flag : $scope.settings[i].flag
        }

      }else {
        dataToSend = {
          value : $scope.settings[i].value
        }
      }
      $http({method : 'PATCH' , url : '/api/ERP/appSettingsAdminMode/'+ $scope.settings[i].pk + '/' , data : dataToSend } ).
      then(function(response){
        Flash.create('success', response.status + ' : ' + response.statusText );
      }, function(response){
        Flash.create('danger', response.status + ' : ' + response.statusText );
      });
    }
  }


});


app.controller('admin.settings.menu' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

  // var getState = function(input){
  //   parts = input.name.split('.');
  //   // console.log(parts);
  //   if (parts[0] == 'configure') {
  //     return  'admin.settings.configure ({canConfigure :' + input.canConfigure + ', app :"' + parts[2] + '"})'; ;
  //   } else {
  //     return input.name.replace('sudo' , 'admin')
  //   }
  // }
  var getState = function(input){
    parts = input.name.split('.');
    // console.log(parts);
    if (parts[0] == 'configure') {
      return  'home.settings.configure ({canConfigure :' + input.canConfigure + ', app :"' + parts[2] + '"})'; ;
    } else {
      return input.name.replace('sudo' , 'home')
    }
  }

  $scope.apps = [];

  $scope.buildMenu = function(apps){
    for (var i = 0; i < apps.length; i++) {
      a = apps[i];
      parts = a.name.split('.');
      if (a.module != 2 || parts.length != 3) {
        continue;
      }
      a.state = getState(a)
      a.dispName = parts[parts.length -1];
      $scope.apps.push(a);
    }
  }

  as = $permissions.apps();
  if(typeof as.success == 'undefined'){
    $scope.buildMenu(as);
  } else {
    as.success(function(response){
      $scope.buildMenu(response);
    });
  };

  $scope.isActive = function(index){
    app = $scope.apps[index]
    if (angular.isDefined($state.params.app)) {
      return $state.params.app == app.name.split('.')[2]
    } else {
      return  $state.is(app.name.replace('sudo' , 'admin'))
    }
  }

});
