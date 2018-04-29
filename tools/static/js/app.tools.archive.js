app.controller('businessManagement.tools.archive' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){
  // settings main page controller

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/tableDefault.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/tools/archivedDocument/',
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
