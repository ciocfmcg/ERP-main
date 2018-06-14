app.controller("businessManagement.clientRelationships.team", function($scope, $state, $users, $stateParams, $http, Flash , $timeout ) {

  $scope.form = {userInView : null , active : 'task'}
  $scope.active = 'task';
  $scope.me = $users.get('mySelf');
  $scope.form.userInView = $scope.me.pk;

  $scope.showChart = function(pk) {
    $scope.nodeInView = pk;
    $http({method : 'GET' , url : '/api/HR/profileOrgCharts/?user=' + pk}).
    then(function(response) {
      //
      //
      // // if ($scope.form.datasource.level == 'station') {
      //   $scope.form.datasource.className = 'middle-level';
      // // }else if ($scope.form.datasource.level == 'HQ') {
      // //   $scope.form.datasource.className = 'frontend1';
      // // }
      //
      // $scope.colorCodeUnit($scope.form.datasource.children);

      $scope.chart.init({data : response.data});
      $('.orgchart').addClass('noncollapsable');

    })
  }



  var nodeTemplateOrg = function(data) {
    return `
      <span class="office"></span>
      <div class="title">${data.name}</div>
      <div class="content" style="height:120px;"> <img style="height:100%;width:100%;" src="${data.dp}"></img> </div>
      <div class="row">${data.role}</div>
    `;
  };

  $scope.buildChart = function() {
    $scope.chart = $('#chart-container').orgchart({
      'nodeContent': 'level',
      'direction': 't2b',
      'nodeId': 'id',
      'pan': true,
      'nodeTemplate': nodeTemplateOrg,
      createNode: function($node, data) {

        // var secondMenuIconInfo = $('<i>', {
        //   'class': 'fa fa-info fa-3x second-menu-icon bg-blue', id : $node[0].id,
        //   click: function(event) {
        //     $scope.inView = $(this)[0].id;
        //     $scope.viewUnit($(this))
        //     event.stopPropagation();
        //   }
        // });
        //
        $node[0].onclick = function(event) {
          // $scope.showChart($(this)[0].id);
          $scope.form.userInView = parseInt($(this)[0].id);
        }
        // $node.append(secondMenuIconInfo);
      }
    });



  }

  $scope.buildChart();
  $scope.showChart($scope.me.pk);



  $scope.timelineItems = [
    {
      created : new Date(),
      newMonth : false,
      typ : 'todo',
      user : 1, text : 'dsada'
    },
    {
      created : new Date(),
      newMonth : false,
      typ : 'todo',
      user : 1, text : 'dsada'
    },
    {
      created : new Date(),
      newMonth : true,
      typ : 'todo',
      user : 1, text : 'dsada'
    },
    {
      created : new Date(),
      newMonth : false,
      typ : 'todo',
      user : 1, text : 'dsada'
    }
  ]



});
