app.controller('businessManagement.tools.fileCache' , function($scope , $http , $uibModal , $state, Flash , $users , $filter , $permissions){

  $scope.data = {tableData : []};

  views = [{name : 'list' , icon : 'fa-bars' ,
    template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
    itemTemplate : '/static/ngTemplates/app.tools.fileCache.item.html',
  },];

  $scope.config = {
    views : views,
    url : '/api/tools/fileCache/',
    searchField: 'fileID',
    itemsNumPerView : [12,24,48],
    canCreate : true,
    editorTemplate : '/static/ngTemplates/app.tools.form.fileCache.new.html',
  }

  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    console.log($scope.data.tableData);

    if (action == 'info') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){
            $scope.showOptions($scope.data.tableData[i]);
        }
      }
    }
  }

  $scope.showOptions = function(fileCache) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.tools.form.fileCache.html',
      size: 'sm',
      resolve : {
        fileCache : function() {
          return fileCache;
        }
      },
      closed: function(pk) {
        console.log('closed');
        console.log(pk);
      },
      controller: function($scope , fileCache, $http, Flash, $uibModalInstance){

        $scope.form = {daysToExtend : 0};
        $scope.fileCache = fileCache;

        $scope.update = function() {
          var dataToSend = {days:$scope.form.daysToExtend};
          console.log(dataToSend);
          $http({method:'PATCH', url : '/api/tools/fileCache/' +$scope.fileCache.pk + '/', data : dataToSend}).
          then(function(response) {
            $scope.form = {daysToExtend : 0};
            $scope.fileCache.expiresOn = response.data.expiresOn;
            Flash.create('success' , 'Expiry extended');
          }, function(response){
            Flash.create('danger' , 'Error occured');
          });
        }

        $scope.delete = function() {
          $http({method : 'DELETE' , url : '/api/tools/fileCache/' +$scope.fileCache.pk + '/'}).
          then(function(response) {
            $uibModalInstance.close($scope.fileCache.pk)
          }, function(err) {
            Flash.create('danger' , 'Error occured');
          })
        }
      },
    });
  }



});


app.controller('businessManagement.tools.fileCache.item' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){

  $scope.$watch('data', function(newValue , oldValue) {

    var prts = $scope.data.attachment.split('/')
    var fileName = prts[prts.length-1]
    var prts = fileName.split('_')
    $scope.data.fileName = prts[prts.length-1]

  });


});



app.controller('businessManagement.tools.fileCache.new' , function($scope , $http , $aside , $state, Flash , $users , $filter , $permissions){


  $scope.form = {apiKey : '', attachment: emptyFile};


  $scope.save = function() {
    var fd = new FormData();
    if ($scope.form.apiKey.length <2) {
      Flash.create('warning' , 'Please provide a valid API Key')
      return
    }

    fd.append('apiKey', $scope.form.apiKey);
    if ($scope.form.attachment != emptyFile) {
      fd.append('attachment', $scope.form.attachment);
    }else{
      Flash.create('warning' , 'No file selected')
    }

    $http({
      method: 'POST',
      url: '/api/tools/fileCache/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      Flash.create('success' , 'New file added to cache')
      $scope.form = {apiKey : '', attachment: emptyFile}
    }, function(err) {
      Flash.create('danger' , 'Error occured')
    });
  }



});
