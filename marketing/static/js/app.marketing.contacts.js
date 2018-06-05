app.controller("businessManagement.marketing.contacts", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.data = {
    tableData: []
  };

  $scope.me = $users.get('mySelf');


  var views = [{
    name: 'list',
    icon: 'fa-bars',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.marketing.contacts.item.html',
  }, ];

  $scope.Config = {
    url: '/api/marketing/contacts/',
    views: views,
    itemsNumPerView: [12, 24, 48],
    filterSearch: true,
    searchField: 'Search..',
    canCreate: true,
    editorTemplate: '/static/ngTemplates/app.marketing.bulkContacts.form.html',
  };

  $scope.tableAction = function(target, action, mode) {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          $scope.addTab({
            title: 'Edit Contact : ' + $scope.data.tableData[i].pk,
            cancel: true,
            app: 'editContact',
            data: {
              pk: target,
              index: i
            },
            active: true
          })
        }
      }
    }

  }

  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index) {
    $scope.tabs.splice(index, 1)
  }

  $scope.addTab = function(input) {
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      } else {
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }



})

app.controller("businessManagement.marketing.bulkContacts", function($scope, $http, Flash) {

$scope.bulkform = {
  source : '',
  fil : emptyFile,
  success : false ,
  usrCount : 0
}
$scope.upload = function(){
  console.log('aaaaaaaaa',$scope.bulkform);
  if ($scope.bulkform.source.length == 0) {
    Flash.create('warning', 'Source Is Required')
    return
  }
  if ($scope.bulkform.fil == emptyFile) {
    Flash.create('warning', 'No file selected')
    return
  }
  var toSend = new FormData()
  toSend.append('source' , $scope.bulkform.source);
  toSend.append('fil' , $scope.bulkform.fil);
  $http({
    method : 'POST',
    url : '/api/marketing/bulkContacts/',
    data : toSend,
    transformRequest: angular.identity,
    headers: {
      'Content-Type': undefined
    }
  }).
  then(function(response){
    Flash.create('success','Saved')
    $scope.bulkform.usrCount = response.data.count;
    $scope.bulkform.success = true;
  }, function(err) {
    console.log(err);
    Flash.create('danger', err.status + ' : ' + err.statusText);
  })
}
});

app.controller("businessManagement.marketing.contacts.form", function($scope, $http, Flash) {

$scope.resetForm = function(){
  $scope.form = {
    name : '',
    email : '',
    mobile : '',
    source : '',
    referenceId : '',

  }
}

$scope.resetForm()
if ($scope.tab != undefined) {
  console.log($scope.data.tableData[$scope.tab.data.index]);
  $scope.form = $scope.data.tableData[$scope.tab.data.index]
}

$scope.createContact = function(){
  var f = $scope.form
  var method = 'POST'
  var url = '/api/marketing/contacts/'
  if (f.pk) {
    method = 'PATCH'
    url = url + f.pk + '/'
  }
  if ((f.name == null || f.name.length == 0) && (f.email == null || f.email.length == 0) && (f.mobile == null || f.mobile.length == 0) && (f.source == null || f.source.length == 0) && (f.referenceId == null || f.referenceId.length == 0)) {
    Flash.create('warning','Atleast One Field Is Required')
    return

  }
  console.log(f);
  var toSend = {}
  if (f.name != null && f.name.length > 0) {
    toSend.name = f.name
  }
  if (f.email != null && f.email.length > 0) {
    toSend.email = f.email
  }
  if (f.mobile != null && f.mobile.length > 0) {
    toSend.mobile = f.mobile
  }
  if (f.source != null && f.source.length > 0) {
    toSend.source = f.source
  }
  if (f.referenceId != null && f.referenceId.length > 0) {
    toSend.referenceId = f.referenceId
  }
  $http({
    method : method,
    url : url,
    data : toSend
  }).
  then(function(response){
    Flash.create('success','Saved')
    if (!f.pk) {
      $scope.resetForm()
    }
    console.log(response.data);
  }, function(err) {
    console.log(err);
    Flash.create('danger', err.status + ' : ' + err.statusText);
  })
}
});
