
app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.organization', {
    url: "/organization",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
       },
       "menu@businessManagement.organization": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller : 'controller.generic.menu',
        },
        "@businessManagement.organization": {
          templateUrl: '/static/ngTemplates/app.organization.dash.html',
          controller : 'businessManagement.organization.dash',
        }
    }
  })
});


app.controller("businessManagement.organization.dash",function($scope, $state, $users, $stateParams, $http, Flash, $uibModal ,$aside) {

  $scope.form = {division : '' , datasource : {}}

  $scope.colorCodeUnit = function(children) {
    var toRemove = []
    for (var i = 0; i < children.length; i++) {


      // if (children[i].level == 'station') {
        children[i].className = 'middle-level';
      //   toRemove.push(i);
      // }else if (children[i].level == 'HQ') {
      //   children[i].className = 'frontend1';
      // }

      $scope.colorCodeUnit(children[i].children);
    }

    for (var i = toRemove.length -1; i >= 0; i--)
    children.splice(toRemove[i],1);

  }

  $scope.openHQ = function(pk) {
    $scope.nodeInView = pk;
    $http({method : 'GET' , url : '/api/organization/unitSuperLite/' + pk +'/'}).
    then(function(response) {

      $scope.form.datasource = response.data;

      // if ($scope.form.datasource.level == 'station') {
        $scope.form.datasource.className = 'middle-level';
      // }else if ($scope.form.datasource.level == 'HQ') {
      //   $scope.form.datasource.className = 'frontend1';
      // }

      $scope.colorCodeUnit($scope.form.datasource.children);

      $scope.chart.init({data : $scope.form.datasource});
      $('.orgchart').addClass('noncollapsable');

    })
  }

  $scope.fetchFirstLevelUnit = function() {
    $http({method : 'GET' , url : '/api/organization/firstLevelUnit/?divisions=' + $scope.form.division.pk }).
    then(function(response) {
      $scope.firstLevelHQs = response.data;
      $scope.openHQ($scope.firstLevelHQs[0].pk);
    })
  }

  $scope.$watch('form.division' , function(newValue , oldValue) {
    if (typeof newValue == 'object') {
      $scope.fetchFirstLevelUnit();
    }
  })




  $scope.inView = null;

  var nodeTemplate = function(data) {
    return `
      <span class="office"></span>
      <div class="title">${data.name}</div>
      <div class="content"></div>
    `;
  };

  $scope.buildChart = function() {
    $scope.chart = $('#chart-container').orgchart({
      'nodeContent': 'level',
      'direction': 't2b',
      'nodeId': 'pk',
      'pan': true,
      'nodeTemplate': nodeTemplate,
      createNode: function($node, data) {

        var secondMenuIconInfo = $('<i>', {
          'class': 'fa fa-info fa-3x second-menu-icon bg-blue', id : $node[0].id,
          click: function(event) {
            $scope.inView = $(this)[0].id;
            $scope.viewUnit($(this))
            event.stopPropagation();
          }
        });

        $node[0].onclick = function() {
          console.log("clicked : " + $node);
        }
        $node.append(secondMenuIconInfo);
      }
    });



  }


  $scope.buildChart();

  $http({method : 'GET' , url : '/api/organization/divisions'}).
  then(function(response) {
    $scope.divisions = response.data;
    $scope.form.division = $scope.divisions[0];
  })

  $scope.selectDivision = function(idx) {
  $scope.form.division = $scope.divisions[idx];
}

$scope.viewUnit = function(idx) {
    $aside.open({
      templateUrl: '/static/ngTemplates/app.organization.unit.aside.explore.html',
      placement: 'left',
      size: 'md',
      backdrop: true,
      controller:function($scope , input, $http , $uibModalInstance) {
        $scope.mode = 'view';
        $scope.edit = function() {
          $scope.mode = 'edit';
        }

        $scope.delete = function() {
          $http({method : 'DELETE' , url : '/api/organization/unit/' + $scope.unit.pk + '/'}).
          then(function(response) {
            $uibModalInstance.dismiss('reload');
          })
        }

        $scope.save = function() {
          $http({method : 'PATCH' , url : '/api/organization/unit/' + $scope.unit.pk + '/' , data : {name : $scope.unit.name , city : $scope.unit.address}}).
          then(function(response) {
            $uibModalInstance.dismiss('reload');
          })
        }


        $http({method : 'GET' , url : '/api/organization/unitFull/' + input + '/'}).
        then(function(response) {
          $scope.unit = response.data;
          $http({method : 'GET' , url : '/api/HR/userSearch/?unit=' + $scope.unit.pk}).
          then(function(response) {
            $scope.users = response.data;
          })
        })
        $scope.input = input;
      },
      resolve: {
       input: function () {
         return $scope.inView;
        }
      }
    }).result.then(function (d) {

    }, function (d) {
      console.log(d);
      if (d == 'reload') {
        $scope.openHQ($scope.nodeInView);
      }
    });
  }


});


app.controller("businessManagement.organization", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.organization.division.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/organization/divisions/',
    searchField: 'name',
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit :';
          var appType = 'divisionEditor';
        } else if (action == 'info') {
          var title = 'Details :';
          var appType = 'divisionInfo';
        }


        console.log({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            division: $scope.data.tableData[i]
          },
          active: true
        });


        $scope.addTab({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i,
            division: $scope.data.tableData[i]
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
