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
        } else if (action == 'delete') {
          $http({
            method: 'DELETE',
            url: '/api/marketing/contacts/' + target + '/'
          }).
          then(function(response) {
            Flash.create('success', 'Deleted');
            $scope.$broadcast('forceRefetch', {})
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
    source: '',
    fil: emptyFile,
    success: false,
    usrCount: 0
  }
  $scope.tagsList = []
  $scope.tagSearch = function(val) {
    return $http({
      method: 'GET',
      url: '/api/marketing/tag/?name__contains=' + val
    }).
    then(function(response) {
      return response.data;
    })
  }
  $scope.closeTags = function(idx) {
    $scope.tagsList.splice(idx, 1)
  }
  $scope.saveTags = function() {
    if (typeof $scope.form.tags == 'object') {
      for (var i = 0; i < $scope.tagsList.length; i++) {
        if ($scope.tagsList[i].pk == $scope.form.tags.pk) {
          Flash.create('warning', 'Already Added')
          return
        }
      }
      $scope.tagsList.push($scope.form.tags)
      $scope.form.tags = ''
    } else {
      if ($scope.form.tags.length > 0) {
        $http({
          method: 'POST',
          url: '/api/marketing/tag/',
          data: {
            name: $scope.form.tags
          }
        }).
        then(function(response) {
          $scope.tagsList.push(response.data)
          $scope.form.tags = ''
        })
      }
    }
  }

  $scope.upload = function() {
    console.log('aaaaaaaaa', $scope.bulkform);
    if ($scope.bulkform.source.length == 0) {
      Flash.create('warning', 'Source Is Required')
      return
    }
    if ($scope.bulkform.fil == emptyFile) {
      Flash.create('warning', 'No File Has Selected')
      return
    }
    var toSend = new FormData()
    toSend.append('source', $scope.bulkform.source);
    toSend.append('fil', $scope.bulkform.fil);
    if ($scope.tagsList.length > 0) {
      var tagsPk = []
      for (var i = 0; i < $scope.tagsList.length; i++) {
        tagsPk.push($scope.tagsList[i].pk)
      }
      toSend.append('tags', tagsPk)
    }
    $http({
      method: 'POST',
      url: '/api/marketing/bulkContacts/',
      data: toSend,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success', 'Saved')
      $scope.bulkform.usrCount = response.data.count;
      $scope.bulkform.success = true;
    }, function(err) {
      console.log(err);
      Flash.create('danger', err.status + ' : ' + err.statusText);
    })
  }
});

app.controller("businessManagement.marketing.contacts.form", function($scope, $http, Flash) {

  $scope.resetForm = function() {
    $scope.form = {
      name: '',
      email: '',
      mobile: '',
      source: '',
      referenceId: '',
      tag: '',
      tagsList: [],
      pinCode: '',

    }
  }
  $scope.resetForm()

  if ($scope.tab != undefined) {
    console.log($scope.data.tableData[$scope.tab.data.index]);
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
    $scope.form.tagsList = $scope.form.tags
    $scope.form.tag = ''
  }

  $scope.tagSearch = function(val) {
    return $http({
      method: 'GET',
      url: '/api/marketing/tag/?name__contains=' + val
    }).
    then(function(response) {
      return response.data;
    })
  }
  $scope.closeTags = function(idx) {
    $scope.form.tagsList.splice(idx, 1)
  }
  $scope.saveTags = function() {
    if (typeof $scope.form.tag == 'object') {
      for (var i = 0; i < $scope.form.tagsList.length; i++) {
        if ($scope.form.tagsList[i].pk == $scope.form.tag.pk) {
          Flash.create('warning', 'Already Added')
          return
        }
      }
      $scope.form.tagsList.push($scope.form.tag)
      $scope.form.tag = ''
    } else {
      if ($scope.form.tag.length > 0) {
        $http({
          method: 'POST',
          url: '/api/marketing/tag/',
          data: {
            name: $scope.form.tag
          }
        }).
        then(function(response) {
          $scope.form.tagsList.push(response.data)
          $scope.form.tag = ''
        })
      }
    }
  }

  $scope.createContact = function() {
    var f = $scope.form
    var method = 'POST'
    var url = '/api/marketing/contacts/'
    if (f.pk) {
      method = 'PATCH'
      url = url + f.pk + '/'
    }
    if ((f.name == null || f.name.length == 0) && (f.email == null || f.email.length == 0) && (f.mobile == null || f.mobile.length == 0) && (f.source == null || f.source.length == 0) && (f.referenceId == null || f.referenceId.length == 0)) {
      Flash.create('warning', 'Atleast One Field Is Required')
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
    if (f.pinCode != null && f.pinCode.length > 0) {
      toSend.pinCode = f.pinCode
    }
    if (f.tagsList.length > 0) {
      var tagsPk = []
      for (var i = 0; i < f.tagsList.length; i++) {
        tagsPk.push(f.tagsList[i].pk)
      }
      toSend.tags = tagsPk
    }
    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved')
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
