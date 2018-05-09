app.controller('businessManagement.tools.archive' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions, $uibModal){
  // settings main page controller

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
    itemTemplate : '/static/ngTemplates/app.tools.archieve.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/tools/archivedDocument/',
    searchField: 'name',
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
        } else if (action == 'archieveBrowser') {
          var title = 'Details :';
          var appType = 'archieveBrowser';
        }else if (action == 'delete') {
          // $http({method : 'DELETE' , url : '/api/tools/archivedDocument/' + target +'/'}).
          // then(function(response) {
          //
          //
          //
          // });

        }

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


  userviews = [{
    name: 'list',
    icon: 'fa-person',
    template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
    itemTemplate : '/static/ngTemplates/app.tools.archieve.users.html',
  }, ];


  $scope.userConfig = {
    views: userviews,
    url: '/api/HR/users/',
    searchField: 'username',
    itemsNumPerView: [16, 32, 48],
  }






})
app.controller('businessManagement.tools.archieve.item' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions,$uibModal){


  $scope.addInfo = function(value) {
    $scope.user=[]
  $http.get('/api/HR/users/'+value+'/').
  then(function(response) {
    $scope.user = response.data;
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.tools.archieve.users.modal.html',
      size: 'lg',
      controller: 'tools.archive.users.modal',
      resolve:{
        data:function(){
          return $scope.user;
        }
      }
    });
  })
}

})

app.controller('tools.archive.users.modal' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions,data){
$scope.user=data;
  $scope.values = [];
  $scope.add = function() {
    $scope.values.push($scope.form.add);
    $scope.form.add = '';
  }

})

app.controller('businessManagement.tools.new' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.resetForm = function() {
    $scope.form = {file : emptyFile , description : '' , title : '' , docID : ''}
  }

  $scope.resetForm();

  $scope.save = function() {

    var fd = new FormData();

    if ($scope.form.description.length ==0 || $scope.form.title.length ==0 || $scope.form.docID.length ==0 || $scope.form.file == emptyFile) {
      Flash.create('danger' , 'Please check the form');
      return;
    }


    fd.append( 'pdf', $scope.form.file);
    fd.append( 'description', $scope.form.description);
    fd.append( 'title', $scope.form.title);
    fd.append( 'source', $scope.form.source);
    fd.append( 'dated', $scope.form.dated.toJSON().split('T')[0]);
    fd.append( 'docID', $scope.form.docID);

    $http({method : 'POST' , url : '/api/tools/archivedDocument/' , data : fd , transformRequest: angular.identity,
    headers: {
      'Content-Type': undefined
    }}).
    then(function(response) {
      Flash.create('success' , 'Saved');
      $scope.resetForm();
    })

  }



})
app.controller('businessManagement.tools.archive.explore', function($scope, $http, $aside, Flash) {

  $scope.archieve = $scope.data.tableData[$scope.tab.data.index]
  console.log($scope.archieve.sections,"gfgf");



})
