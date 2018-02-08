app.config(function($stateProvider){
  $stateProvider.state('projectManagement.LMS.configure', {
    url: "/configure",
    templateUrl: '/static/ngTemplates/app.LMS.configure.html',
    controller: 'projectManagement.LMS.configure'
  });
});

app.controller("projectManagement.LMS.configure", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.subject.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/LMS/subject/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Contact :';
          var appType = 'contactEditor';
        } else if (action == 'details') {
          var title = 'Details :';
          var appType = 'contactExplorer';
        }


        console.log({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        });


        $scope.addTab({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        })
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




});

app.controller("projectManagement.LMS.configure.form", function($scope, $state, $users, $stateParams, $http, Flash) {
  $scope.mode = 'topic';

  $scope.resetForm = function() {
    $scope.form = {title : '' , description : '' , dp : emptyFile , level : 0}
  }



  $scope.subjectSearch = function(query) {
    return $http.get( '/api/LMS/subject' +'?title__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.resetForm();
  $scope.form.subject = '';
  $scope.save = function() {

    var toSend = new FormData();

    toSend.append('title' , $scope.form.title)
    toSend.append('description' , $scope.form.description)


    if ($scope.mode == 'subject') {
      toSend.append('dp' , $scope.form.dp)
      toSend.append('level' , $scope.form.level)
    }else {
      if (typeof $scope.form.subject != 'object') {
        Flash.create('warning' , 'Subject is required for a topic');
        return;
      }
      toSend.append('subject' , $scope.form.subject.pk)
    }

    $http({
      method: 'POST',
      url: '/api/LMS/' + $scope.mode + '/',
      data: toSend,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success' , 'Saved');
      $scope.resetForm();

    })



  }



});
