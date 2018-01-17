app.config(function($stateProvider){

  $stateProvider
  .state('businessManagement.POS', {
    url: "/POS",
    views: {
       "": {
          templateUrl: '/static/ngTemplates/app.POS.default.html',
          controller : 'businessManagement.POS.default',
       }
    }
  })
});




app.controller("businessManagement.POS.default", function($scope , $state , $users ,  $stateParams , $http , Flash , $uibModal) {

  $scope.mode='invoice';

  $scope.form = {customerName : '', invoiceDate : new Date(), dewDate : new Date()}

  $scope.cards= [
    {img:'/static/images/avatar.png',name:"Prabhakar",price:200,gst:"18%",sac:123,stock:10},
    {img:'/static/images/avatar2.png',name:"Ankita",price:300,gst:"18%",sac:234,stock:20},
    {img:'/static/images/avatar3.png',name:"Swagata",price:400,gst:"18%",sac:245,stock:25},
    {img:'/static/images/avatar5.png',name:"Raju",price:500,gst:"18%",sac:264,stock:50},

  ]
  $scope.createInvoice = function() {
    $scope.mode = 'invoice';
  }
  $scope.goHome = function() {
    $scope.mode = 'home';
  }

  $scope.openCustomerForm = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.customer.form.html',
      size: 'md',
      backdrop : true,
      resolve : {name : function() {
        return $scope.form.customerName;
      }},
      controller: function($scope ,name){
        $scope.form = {'name' : name , address : {street : '' , state : '' , pincode : '' , country :  'India'}}
      },
    }).result.then(function () {

    } , function() {

    });


  }
  $scope.openProductForm = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.product.form.html',
      size: 'md',
      backdrop : true,
      // resolve : {name : function() {
      //   return $scope.form.customerName;
      // }},
      controller: function($scope){
        // $scope.form = {'name' : name , address : {street : '' , state : '' , pincode : '' , country :  'India'}}
      },
    }).result.then(function () {

    } , function() {

    });


  }

  $scope.openCustomerForm()

  $scope.invoice= [
    {id:"#123",name:"Prabhakar",date:"10/02/10",paid:"true",mode:"cash",amount:230},
    {id:"#234",name:"Ankita",date:"12/04/18",paid:"false",mode:"card",amount:500},
    {id:"#456",name:"Swagata",date:"10/07/17",paid:"true",mode:"paytm",amount:200},
    {id:"#789",name:"Raju",date:"15/05/17",paid:"false",mode:"cash",amount:300},

  ]

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
  $scope.dates = [
    "jan-march-2018", "Apr-jun-2018", "jul-Sep-2018","oct-Dec-2018"];
  $scope.returndates = [
      "jan-march-2018", "Apr-jun-2018", "jul-Sep-2018","oct-Dec-2018"];
});
