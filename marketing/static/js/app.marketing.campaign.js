app.controller("businessManagement.marketing.campaign", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.data = {
    tableData: []
  };

  $scope.me = $users.get('mySelf');


  var views = [{
    name: 'list',
    icon: 'fa-bars',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.marketing.campaign.item.html',
  }, ];

  $scope.Config = {
    url: '/api/marketing/campaign/',
    views: views,
    itemsNumPerView: [12, 24, 48],
    filterSearch: true,
    searchField: 'Search..',
  };

  $scope.tableAction = function(target, action, mode) {
    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          $scope.addTab({
            title: 'Edit Campaign : ' + $scope.data.tableData[i].pk,
            cancel: true,
            app: 'editCampaign',
            data: {
              pk: target,
              index: i
            },
            active: true
          })
        } else if (action == 'info') {
          $scope.addTab({
            title: 'Explore Campaign : ' + $scope.data.tableData[i].pk,
            cancel: true,
            app: 'exploreCampaign',
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


app.controller("businessManagement.marketing.canpaign.form", function($scope, $http, Flash) {

  $scope.resetForm = function() {
    $scope.form = {
      name: '',
      src: '',
      sourceList: [],
      tag: '',
      tagsList: [],
      filterFrom: '',
      filterTo: ''

    }
  }
  $scope.resetForm()

  if ($scope.tab != undefined) {
    console.log($scope.data.tableData[$scope.tab.data.index]);
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
    $scope.form.tagsList = $scope.form.tags
    $scope.form.tag = ''
    $scope.form.sourceList = JSON.parse($scope.form.source);
    $scope.src = ''
    if ($scope.form.filterFrom != null && $scope.form.filterTo != null && $scope.form.filterFrom.length > 0 && $scope.form.filterTo.length > 0) {
      console.log('s');
      for (var i = 0; i < $scope.form.tagsList.length; i++) {
        console.log(i, $scope.form.filterFrom);
        console.log('yessss');
        $http({
          method: 'GET',
          url: '/api/marketing/tag/?name=' + $scope.form.tagsList[i].name + '&fd=' + $scope.form.filterFrom + '&td=' + $scope.form.filterTo + '&fetch= ',
        }).
        then((function(i) {
          return function(response) {
            console.log('ressssssssss', response.data);
            $scope.form.tagsList[i] = response.data[0];
            console.log($scope.form);
          }
        })(i))
      }
    }
    // $scope.form.total = 0
    // for (var i = 0; i < $scope.form.sourceList.length; i++) {
    //   $scope.form.total += $scope.form.sourceList[i].sourceCount
    // }
    // for (var i = 0; i < $scope.form.tagsList.length; i++) {
    //   $scope.form.total += $scope.form.tagsList[i].tagsCount
    // }

  }

  $scope.$watch('[form.filterFrom,form.filterTo]', function(newValue, oldValue) {
    var d = new Date($scope.form.filterFrom)
    console.log(new Date(d.setMinutes( d.getMinutes() + 480)));
    console.log('watchhhhh',$scope.form.filterFrom);
    if ($scope.form.filterFrom != null && $scope.form.filterTo != null && typeof $scope.form.filterFrom == 'object' && typeof $scope.form.filterTo == 'object') {
      // var fromd = new Date($scope.form.filterFrom)
      // var tod = new Date($scope.form.filterTo)
      // $scope.form.filterFrom = new Date(fromd.setMinutes( fromd.getMinutes() + 480))
      // $scope.form.filterTo = new Date(tod.setMinutes( tod.getMinutes() + 480))
      $scope.form.fd = $scope.form.filterFrom.toJSON().split('T')[0]
      $scope.form.td = $scope.form.filterTo.toJSON().split('T')[0]
      // $scope.form.sourceList = []
      // $scope.form.tagsList = []
      for (var i = 0; i < $scope.form.tagsList.length; i++) {
        console.log(i, $scope.form.filterFrom);
        console.log('yessss');
        $http({
          method: 'GET',
          url: '/api/marketing/tag/?name=' + $scope.form.tagsList[i].name + '&fd=' + $scope.form.fd + '&td=' + $scope.form.td + '&fetch= ',
        }).
        then((function(i) {
          return function(response) {
            console.log('ressssssssss', response.data);
            $scope.form.tagsList[i] = response.data[0];
            console.log($scope.form);
          }
        })(i))
      }
      for (var i = 0; i < $scope.form.sourceList.length; i++) {
        console.log(i, $scope.form.filterFrom);
        console.log('yessss');
        $http({
          method: 'POST',
          url: '/api/marketing/sourceSuggest/',
          data: {
            source: $scope.form.sourceList[i].source,
            fd: $scope.form.fd,
            td: $scope.form.td,
            fetch: ''
          }
        }).
        then((function(i) {
          return function(response) {
            console.log('ressssssssss', response.data);
            $scope.form.sourceList[i] = response.data.val[0];
            console.log($scope.form);
          }
        })(i))
      }
    } else {
      if ($scope.form.filterFrom != null && $scope.form.filterTo != null && $scope.form.filterFrom.length > 0 && $scope.form.filterTo.length > 0) {
        // $scope.form.fd = $scope.form.filterFrom
        // $scope.form.td = $scope.form.filterTo
        $scope.form.fd = new Date(new Date($scope.form.filterFrom).setDate(new Date($scope.form.filterFrom).getDate() - 1)).toJSON().split('T')[0]
        $scope.form.td = new Date(new Date($scope.form.filterTo).setDate(new Date($scope.form.filterTo).getDate() - 1)).toJSON().split('T')[0]
        console.log($scope.form.fd, $scope.form.td);
      } else {
        $scope.form.fd = ''
        $scope.form.td = ''
      }
    }

  }, true);

  $scope.$watch('[form.sourceList,form.tagsList]', function(newValue, oldValue) {
    console.log($scope.form);
    // $scope.form.total = 0
    // for (var i = 0; i < $scope.form.sourceList.length; i++) {
    //   $scope.form.total += $scope.form.sourceList[i].sourceCount
    // }
    // for (var i = 0; i < $scope.form.tagsList.length; i++) {
    //   $scope.form.total += $scope.form.tagsList[i].tagsCount
    // }

  }, true);

  $scope.tagSearch = function(val) {
    console.log($scope.form);
    return $http({
      method: 'GET',
      url: '/api/marketing/tag/?name__contains=' + val + '&fd=' + $scope.form.fd + '&td=' + $scope.form.td,
    }).
    then(function(response) {
      return response.data;
    })
  }
  $scope.closeTags = function(idx) {
    $scope.form.tagsList.splice(idx, 1)
  }

  $scope.srcSearch = function(val) {
    return $http({
      method: 'POST',
      url: '/api/marketing/sourceSuggest/',
      data: {
        source: val,
        fd: $scope.form.fd,
        td: $scope.form.td
      }
    }).
    then(function(response) {
      console.log(response.data.val);
      return response.data.val;
    })
  }
  $scope.closeSrc = function(idx) {
    $scope.form.sourceList.splice(idx, 1)
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
      Flash.create('warning', 'Please Select A Suggested Tags')
      return
    }
  }

  $scope.saveSrc = function() {
    if (typeof $scope.form.src == 'object') {
      for (var i = 0; i < $scope.form.sourceList.length; i++) {
        if ($scope.form.sourceList[i].pk == $scope.form.src.pk) {
          Flash.create('warning', 'Already Added')
          return
        }
      }
      $scope.form.sourceList.push($scope.form.src)
      $scope.form.src = ''
    } else {
      Flash.create('warning', 'Please Select A Suggested Source')
      return
    }
  }

  $scope.createCampaign = function() {
    var f = $scope.form
    var method = 'POST'
    var url = '/api/marketing/campaign/'
    if (f.pk) {
      method = 'PATCH'
      url = url + f.pk + '/'
    }
    if (f.name == null || f.name.length == 0) {
      Flash.create('warning', 'Name Is Required')
      return
    }
    if (f.tagsList.length == 0 && f.sourceList.length == 0) {
      Flash.create('warning', 'Either Tags Or Source Is Required')
      return
    }

    console.log(f);
    var toSend = {
      name: f.name
    }
    if (f.filterFrom != null && typeof f.filterFrom == 'object') {
      toSend.filterFrom = f.filterFrom.toJSON().split('T')[0]
    }
    if (f.filterTo != null && typeof f.filterTo == 'object') {
      toSend.filterTo = f.filterTo.toJSON().split('T')[0]
    }

    if (f.tagsList.length > 0) {
      var tagsPk = []
      for (var i = 0; i < f.tagsList.length; i++) {
        tagsPk.push(f.tagsList[i].pk)
      }
      toSend.tags = tagsPk
    }
    if (f.sourceList.length > 0) {
      toSend.source = JSON.stringify(f.sourceList)
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

app.controller("businessManagement.marketing.canpaign.explore", function($scope, $http, Flash, $uibModal , $sce) {
  $scope.sai = 'kiran'
  $scope.campaignData = []
  $scope.showPrev = false
  $scope.showNext = false
  if ($scope.tab != undefined) {
    console.log($scope.data.tableData[$scope.tab.data.index]);
    $scope.data = $scope.data.tableData[$scope.tab.data.index]
    if ($scope.data.directions.length > 0) {
      $scope.data.directions  = $sce.trustAsHtml($scope.data.directions);
    }
    $http({
      method: 'GET',
      url: '/api/marketing/campaignDetails/?pk=' + $scope.data.pk,
    }).
    then(function(response) {
      console.log(response.data);
      $scope.campaignData = response.data
      if ($scope.data.status == 'started' && $scope.data.typ == 'call') {
        console.log('calllllllllllll', $scope.campaignData);
        $scope.idx = 0
        $scope.userData = $scope.campaignData[$scope.idx]
        $scope.totalUsers = $scope.campaignData.length
        if ($scope.totalUsers > 1) {
          $scope.showNext = true
        }
      }
    })
  }


  $scope.prev = function() {
    $scope.idx -= 1
    if ($scope.idx == 0) {
      $scope.showPrev = false
    }
    $scope.userData = $scope.campaignData[$scope.idx]
    $scope.showNext = true
  }
  $scope.next = function() {
    $scope.idx += 1
    if ($scope.idx == $scope.totalUsers - 1) {
      $scope.showNext = false
    }
    $scope.userData = $scope.campaignData[$scope.idx]
    $scope.showPrev = true
  }

  $scope.changeStatus = function(typ) {
    if ($scope.data.status == 'created') {
      $uibModal.open({
        templateUrl: '/static/ngTemplates/app.marketing.campaign.callForm.html',
        size: 'lg',
        backdrop: true,
        resolve: {
          data: function() {
            return $scope.data;
          },
          typ: function() {
            return typ;
          }
        },
        controller: "businessManagement.marketing.canpaign.typPopUp",
      });

    } else if ($scope.data.status == 'started') {
      $http({
        method: 'PATCH',
        url: '/api/marketing/campaign/' + $scope.data.pk + '/',
        data: {
          status: 'closed'
        }
      }).
      then(function(response) {
        console.log(response.data);
        $scope.data.status = response.data.status
      })

    }

  }

  $scope.createLog = function(typ){
    console.log('777777777',typ);
  }
})

app.controller("businessManagement.marketing.canpaign.typPopUp", function($scope, $http, Flash, $uibModal, data, typ, $uibModalInstance) {

  console.log('77777777', data, typ);
  $scope.data = data
  $scope.typ = typ
  $scope.form = {
    part: '',
    directions: '',
    msgBody: '',
    emailSubject: '',
    emailBody: '',
    partList: [],
    PartPk: []
  }
  $scope.userSearch = function(query) {
    return $http.get('/api/HR/userSearch/?username__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.addParticipants = function() {
    console.log($scope.form.part);
    for (var i = 0; i < $scope.form.PartPk.length; i++) {
      if ($scope.form.PartPk[i] == $scope.form.part.pk) {
        Flash.create('warning', 'This User Has Already Added')
        return
      }
    }
    $scope.form.partList.push($scope.form.part)
    $scope.form.PartPk.push($scope.form.part.pk)
    $scope.form.part = ''
  }
  $scope.closeUser = function(idx) {
    $scope.form.partList.splice(idx, 1)
    $scope.form.PartPk.splice(idx, 1)
  }
  $scope.submit = function() {
    console.log($scope.form.partList, $scope.form.PartPk);
    var toSend = {
      status: 'started',
      typ: $scope.typ
    }
    if ($scope.typ == 'email') {
      if ($scope.form.emailSubject.length == 0) {
        Flash.create('warning', 'Email Subject Is Required')
        return
      }
      if ($scope.form.emailBody.length == 0) {
        Flash.create('warning', 'Email Content Is Required')
        return
      }
      toSend.emailSubject = $scope.form.emailSubject
      toSend.emailBody = $scope.form.emailBody
    } else if ($scope.typ == 'sms') {
      if ($scope.form.msgBody.length == 0) {
        Flash.create('warning', 'Message Is Required')
        return
      }
      toSend.msgBody = $scope.form.msgBody
    } else {
      if ($scope.form.directions.length == 0) {
        Flash.create('warning', 'Directions Is Required')
        return
      }
      toSend.directions = $scope.form.directions
      if ($scope.form.PartPk.length > 0) {
        toSend.participants = $scope.form.PartPk
      }
    }
    $http({
      method: 'PATCH',
      url: '/api/marketing/campaign/' + $scope.data.pk + '/',
      data: toSend
    }).
    then(function(response) {
      console.log(response.data);
      $scope.data.status = response.data.status
      $scope.data.typ = response.data.typ
      $uibModalInstance.dismiss();
      Flash.create('success', 'Submitted')
    })
  }

})
