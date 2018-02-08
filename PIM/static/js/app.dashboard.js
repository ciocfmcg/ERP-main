app.controller("controller.home", function($scope , $state) {

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.onClick = function (points, evt) {
    console.log(points, evt);
  };

  $scope.labels2 = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  $scope.data2 = [300, 500, 100];

  // var datascource = {
  //         'name': 'Liabilities',
  //         'children': [
  //           { 'name': 'LTL',
  // 			'children':[
  // 			   { 'name':'Share Capitals' },
  // 			   {'name':'Loans'},
  // 			]
  // 		  },
  //           { 'name': 'STL',
  // 		  'children':[
  // 		  { 'name':'creditors' }
  // 		  ]
  // 		  },
  //         ]
  //       };
  //
  //     $('#chart-container1').orgchart({
  //       'data' : datascource,
  //       'nodeContent': 'title',
  //       'direction': 'r2l'
  //     });
  //
  //   var datascource = {
  //       'name': 'Assets',
  //       'children': [
  //         { 'name': "PA'S",'title':'60%'},
  //         { 'name': "NPA'S",'title':'40%'},
  //       ]
  //     };
  //
  //   $('#chart-container2').orgchart({
  //     'data' : datascource,
  //     'nodeContent': 'title',
  //     'direction': 'b2t'
  //   });
  //
  //   var datascource = {
  //     'name': 'Incomes',
  //     'children': [
  //       { 'name': 'Sales' },
  //       { 'name': 'Other Incomes' },
  //     ]
  //   };
  //
  //   $('#chart-container3').orgchart({
  //     'data' : datascource,
  //     'nodeContent': 'title',
  //     'direction': 'l2r'
  //   });
  //   var datascource = {
  //       'name': 'Expenses',
  //       'children': [
  //         { 'name':'VC'},
  //         { 'name': 'FC'},
  //       ]
  //     };
  //
  //   $('#chart-container4').orgchart({
  //     'data' : datascource,
  //     'nodeContent': 'title',
  //     'direction': 't2b'
  //   });


})
