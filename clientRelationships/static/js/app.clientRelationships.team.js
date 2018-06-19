app.controller("businessManagement.clientRelationships.team", function($scope, $state, $users, $stateParams, $http, Flash, $timeout) {

  $scope.form = {
    userInView: null,
    active: 'task',
    today:new Date()
  }
  $scope.active = 'task';
  $scope.me = $users.get('mySelf');
  $scope.form.userInView = $scope.me.pk;
  $scope.timelineItems = [];
  $scope.calendar = [];
  $scope.showChart = function(pk) {
    $scope.nodeInView = pk;
    $http({
      method: 'GET',
      url: '/api/HR/profileOrgCharts/?user=' + pk
    }).
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

      $scope.chart.init({
        data: response.data
      });
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


  //
  // $scope.timelineItems = [
  //   {
  //     created : new Date(),
  //     newMonth : false,
  //     typ : 'todo',
  //     user : 1, text : 'dsada'
  //   },
  //   {
  //     created : new Date(),
  //     newMonth : false,
  //     typ : 'todo',
  //     user : 1, text : 'dsada'
  //   },
  //   {
  //     created : new Date(),
  //     newMonth : true,
  //     typ : 'todo',
  //     user : 1, text : 'dsada'
  //   },
  //   {
  //     created : new Date(),
  //     newMonth : false,
  //     typ : 'todo',
  //     user : 1, text : 'dsada'
  //   }
  // ]
  $scope.change = function() {
    $scope.pageNo = 0;
    if ($scope.form.active == "activity") {
      $scope.nextPage = function() {
        console.log($scope.pageNo, "aaaaaaa");
        if ($scope.disableNext) {
          return;
        }
        $scope.pageNo += 1;
        $scope.retriveTimeline();
      }

      $scope.prevPage = function() {
        if ($scope.pageNo == 0) {
          return;
        }
        $scope.pageNo -= 1;
        $scope.retriveTimeline();
      }
      $scope.analyzeTimeline = function() {
        for (var i = 0; i < $scope.timelineItems.length; i++) {
          $scope.timelineItems[i].created = new Date($scope.timelineItems[i].created);
          if (i < $scope.timelineItems.length - 1 && $scope.timelineItems[i].created.getMonth() != new Date($scope.timelineItems[i + 1].created).getMonth()) {
            $scope.timelineItems[i + 1].newMonth = true;
          }
        }
      }
      $scope.retriveTimeline = function() {
        console.log($scope.pageNo, "a");
        $http({
          method: 'GET',
          url: '/api/clientRelationships/activity/?contact=' + $scope.form.userInView + '&limit=5&offset=' + $scope.pageNo * 5
        }).
        then(function(response) {
          $scope.timelineItems = response.data.results;
          console.log($scope.timelineItems, "aaaaaaabbb");
          if ($scope.timelineItems.length == 0 && $scope.pageNo != 0) {
            $scope.prevPage();
          }
          $scope.disableNext = response.data.next == null;
          $scope.analyzeTimeline();
        })
      }
      $scope.retriveTimeline()
    }
    if ($scope.form.active == "task") {

      $scope.pageNo = 0;
      $scope.nxtPage = function() {
        console.log($scope.pageNo, "aaaaaaa");
        if ($scope.disableNext) {
          return;
        }
        $scope.pageNo += 1;
        $scope.retriveTimeline();
      }

      $scope.prePage = function() {
        if ($scope.pageNo == 0) {
          return;
        }
        $scope.pageNo -= 1;
        $scope.retriveTimeline();
      }
      $scope.analyzeCalendar = function() {
        for (var i = 0; i < $scope.calendar.length; i++) {
          $scope.calendar[i].when = new Date($scope.calendar[i].when);
          $scope.calendar[i].newDate = false;
          if (i < $scope.calendar.length - 1) {
            if ($scope.calendar[i].when.toDateString() != new Date($scope.calendar[i + 1].when).toDateString()) {
              $scope.calendar[i].newDate = true;
              if ($scope.calendar[i].when.toDateString() == new Date().toDateString()) {
                $scope.calendar[i].today = true;
              }
            }
          }
        }
      }
      $scope.retriveTimeline = function() {
        console.log($scope.form.userInView, "atask")
        $http({
          method: 'GET',
          url: '/api/PIM/calendar/?user=' + $scope.form.userInView +'&originator='+'CRM'+ '&limit=5&offset=' + $scope.pageNo * 5
        }).
        then(function(response) {
          $scope.calendar = response.data.results;
          console.log('7777777777777777777',$scope.calendar);
          for (var i = 0; i < $scope.calendar.length; i++) {
            if ($scope.calendar[i].data != null && $scope.calendar[i].data.length>0) {
              var deal = JSON.parse($scope.calendar[i].data)
              console.log(deal);
              $http({
                method: 'GET',
                url: '/api/clientRelationships/deal/'+deal.deal + '/'
              }).
              then((function(i) {
                return function(response) {
                  console.log('ressssssssssss',response.data);
                  $scope.calendar[i].data = response.data
                }
              })(i))
            }
            console.log('666666666666',$scope.calendar);

          }
          if ($scope.calendar.length == 0 && $scope.pageNo != 0) {
            $scope.prePage();
          }
          $scope.disableNext = response.data.next == null;
          $scope.analyzeCalendar();

        })
      }
      $scope.markComplete = function(pk) {
        for (var i = 0; i < $scope.calendar.length; i++) {
          if ($scope.calendar[i].pk == pk) {
            $scope.calendar[i].completed = true;
            $http({
              method: 'PATCH',
              url: '/api/PIM/calendar/' + pk + '/',
              data: {
                completed: true
              }
            }).
            then(function(response) {
              Flash.create('success', 'Updated');
            }, function(err) {
              Flash.create('danger', 'Error while updating');
            })
          }
        }
      }
      $scope.retriveTimeline()
    }
  }
  $scope.change()

});
