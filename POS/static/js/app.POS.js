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

app.controller("controller.POS.invoice.form" , function($scope , invoice){

  if (invoice.pk != undefined) {
    $scope.mode = 'edit';
    $scope.invoice = invoice;
  }else {
    $scope.mode = 'new';
    $scope.invoice = {name : '' , id : emptyFile}
  }
  // $scope.form = {'name' : name , address : {street : '' , state : '' , pincode : '' , country :  'India'}}
})

app.controller("controller.POS.productinfo.form" , function($scope , product){

  if (product.pk != undefined) {
    $scope.mode = 'edit';
    $scope.product = product;
  }else {
    $scope.mode = 'new';
    $scope.product = {name : '', img : emptyFile}
  }


  // $scope.products=products;

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
  // $scope.dates = [
  //   "jan-march-2018", "Apr-jun-2018", "jul-Sep-2018","oct-Dec-2018"];
  // $scope.returndates = [
  //     "jan-march-2018", "Apr-jun-2018", "jul-Sep-2018","oct-Dec-2018"];
  // $scope.form = {'name' : name , address : {street : '' , state : '' , pincode : '' , country :  'India'}}

})
app.controller("controller.POS.customer.form" , function($scope , customer , $http , Flash){

  if (customer.pk != undefined) {
    $scope.mode = 'edit';
    $scope.customer = customer;
  }else {
    $scope.mode = 'new';
    $scope.customer = {'name' : '', 'company' : '', 'email' : '', 'mobile'  : '', 'notes'  : '', 'pan'  : '', 'gst'  : '', 'street'  : '', 'city'  : '', 'state'  : '', 'pincode'  : '', 'country'  : 'India',  'streetBilling'  : '', 'cityBilling'  : '', 'stateBilling'  : '', 'pincodeBilling'  : '', 'countryBilling'  : 'India', 'sameAsShipping' : false , pk : null
  }
  }

  $scope.save = function() {
    var f = $scope.customer;
    if (f.name.length == 0) {
      Flash.create('warning' , 'Name can not be left blank');
      return;
    }

    var toSend = {
      name : f.name,
      sameAsShipping : f.sameAsShipping
    }

    var toPut = ['company', 'email', 'mobile' , 'notes' , 'pan' , 'gst' , 'street' , 'city' , 'state' , 'pincode' , 'country' ,  'streetBilling' , 'cityBilling' , 'stateBilling' , 'pincodeBilling' , 'countryBilling' ]

    for (var i = 0; i < toPut.length; i++) {
      var val= f[toPut[i]];
      if ( val != undefined  && val.length > 0 ) {
        toSend[toPut[i]] = val;
      }
    }

    var url = '/api/POS/customer/';
    if ($scope.mode == 'new') {
      var method =  'POST';
    }else {
      var method = 'PATCH';
      url += $scope.customer.pk +'/';
    }

    $http({method : method , url :  url, data : toSend}).
    then(function(response) {
      $scope.customer.pk = response.data.pk;
      if ($scope.mode == 'new'){
        Flash.create('success' , 'Saved');
      }else {
        Flash.create('success' , 'Created');
      }
      $scope.mode = 'edit';
    })
  }

})

app.controller("controller.POS.customerinfo.form" , function($scope , customer){

  if (customer.pk != undefined) {
    $scope.mode = 'edit';
    $scope.customer = customer;
  }else {
    $scope.mode = 'new';
    $scope.customer = {name : '', email : emptyFile}
  }
})

app.controller("controller.POS.invoicesinfo.form" , function($scope , invoice){

  if (invoice.pk != undefined) {
    $scope.mode = 'edit';
    $scope.invoice = invoice;
  }else {
    $scope.mode = 'new';
    $scope.invoice = {name : '', id : emptyFile}
  }
})

app.controller("businessManagement.POS.default", function($scope , $state , $users ,  $stateParams , $http , Flash , $uibModal) {

$scope.item='';
$scope.items='';
$scope.items1='';
$scope.products =[{name:'prabhakar'},{name:'ankita'},{name:'sai'},{name:'swagata'},{name:'pradeep'},{name:'raju'}]

$scope.selected='';
$scope.customers =[{name:'prabhakar'},{name:'ankita'},{name:'sai'},{name:'swagata'},{name:'pradeep'},{name:'raju'}]

  $scope.data = {
    tableData: [], invoiceTableDate : [] , customerDataTable : []
  };

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.POS.product.item.html',
  }, ];


    var multiselectOptions = [{icon : 'fa fa-plus' , text : 'new' },
    ];

  $scope.config = {
    views: views,
    url: '/api/POS/product/',
    searchField: 'name',
    itemsNumPerView: [6, 12, 24],
    multiselectOptions : multiselectOptions,
  }

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.POS.customer.item.html',
  }, ];

  $scope.configCustomer = {
    views: views,
    url: '/api/POS/customer/',
    searchField: 'name',
    itemsNumPerView: [6, 12, 24],
    multiselectOptions : multiselectOptions,
  }
  //
  //
  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.POS.invoice.item.html',
  }, ];

  $scope.configInvoice = {
    views: views,
    url: '/api/POS/invoice/',
    searchField: 'name',
    itemsNumPerView: [6, 12, 24],
    multiselectOptions : multiselectOptions,
  }






  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    if (action == 'new') {
      $scope.openProductForm();
    }else {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openProductForm(i);
          }else {
            $scope.openProductInfo(i);
          }
        }
      }
    }



  }

  $scope.tableActionCustomer = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.customerDataTable);

    if (action == 'new') {
      $scope.openCustomerForm();
    }else {
      for (var i = 0; i < $scope.data.customerDataTable.length; i++) {
        if ($scope.data.customerDataTable[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openCustomerForm(i);
          }else {
            $scope.openCustomerInfo(i);
          }
        }
      }
    }

  }

  $scope.tableActionInvoice = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.invoiceDataTable);

    if (action == 'new') {
      $scope.createInvoice();
    }else {
      for (var i = 0; i < $scope.data.invoiceDataTable.length; i++) {
        if ($scope.data.invoiceDataTable[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openInvoiceForm(i);
          }else {
            $scope.openInvoiceinfoForm(i);
          }
        }
      }
    }

  }


  $scope.mode='home';

  $scope.tabs = [];
  $scope.searchTabActive = true;
  var dummyDate = new Date();

  var onlyDate = new Date(dummyDate.getFullYear()
                         ,dummyDate.getMonth()
                         ,dummyDate.getDate()
                         ); // 2013-07-30 23:59:59
  $scope.form = {customerName : '', invoiceDate :onlyDate , dewDate :onlyDate }
console.log(onlyDate);

// dummyDate.setDate(dummyDate.getDate() + numberOfDaysToAdd);
// console.log(dummyDate);
$scope.dates = [];
var numberOfDaysToAdd = 7;
d = dummyDate.setDate(dummyDate.getDate() + numberOfDaysToAdd);
$scope.dates.push(new Date(d));



$scope.returndates = [];
var numberOfMonthsToAdd = 3;
for (i=0;i<1;i++){
  d = dummyDate.setMonth(dummyDate.getMonth() + numberOfMonthsToAdd);
  $scope.returndates.push(new Date(d));
  dummyDate=dummyDate;
}
  $scope.cutomerform=true;
  $scope.doSomething = function(){
    $scope.cutomerform =$scope.cutomerform;
  }
  // $scope.products= [
  //   {img:'/static/images/avatar.png',name:"Prabhakar",price:200,gst:"18%",sac:123,stock:10 , pk : 1,description:"a",serialno:12},
  //   {img:'/static/images/avatar2.png',name:"Ankita",price:300,gst:"18%",sac:234,stock:20 , pk : 2,description:"b",serialno:13},
  //   {img:'/static/images/avatar3.png',name:"Swagata",price:400,gst:"18%",sac:245,stock:25 , pk : 3,description:"c",serialno:14},
  //   {img:'/static/images/avatar5.png',name:"Raju",price:500,gst:"18%",sac:264,stock:50 , pk : 4,description:"d",serialno:15},
  //
  // ]
  $http({method : 'GET' , url : '/api/POS/product/'}).
  then(function(response) {
    $scope.products = response.data;
  })


  $scope.createInvoice = function() {
    $scope.mode = 'invoice';
  }
  $scope.goHome = function() {
    $scope.mode = 'home';
  }

  $scope.openCustomerForm = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.customer.form.html',
      size: 'md',
      backdrop : true,
      resolve : {customer : function() {
        if (idx == undefined || idx == null) {
          return {};
        }else {
          return $scope.customers[idx];
        }
      }},
      controller: "controller.POS.customer.form" ,

    }).result.then(function () {

    } , function() {

    });


  }

  // $scope.openCustomerForm();

  $scope.openProductInfo = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.productinfo.form.html',
      size: 'md',
      backdrop : true,
      resolve : {product : function() {
        if (idx == undefined || idx == null) {
          return {};
        }else {
          return $scope.products[idx];
        }
      }},
      controller:"controller.POS.productinfo.form" ,
    }).result.then(function () {

    } , function() {

    });



  }

  $scope.openInvoiceinfoForm = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.invoicesinfo.form.html',
      size: 'md',
      backdrop : true,
      resolve : {invoice : function() {
        if (idx == undefined || idx == null) {
          return {};
        }else {
          return $scope.invoices[idx];
        }
      }},
      controller:"controller.POS.invoicesinfo.form" ,
    }).result.then(function () {

    } , function() {

    });



  }

  $scope.openCustomerInfo = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.customerinfo.form.html',
      size: 'md',
      backdrop : true,
      resolve : {customer : function() {
        if (idx == undefined || idx == null) {
          return {};
        }else {
          return $scope.customers[idx];
        }
      }},
      controller:"controller.POS.customerinfo.form" ,
    }).result.then(function () {

    } , function() {

    });



  }

  $scope.openProductForm = function(idx) {


    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.product.form.html',
      size: 'md',
      backdrop : true,
      resolve : {product : function() {
        if (idx == undefined || idx == null) {
          return {};
        }else {
          return $scope.products[idx];
        }
      }},
      controller: function($scope , product){
        console.log(product);

        if (product.pk != undefined) {
          $scope.mode = 'edit';
          $scope.product = product;
        }else {
          $scope.mode = 'new';
          $scope.product = {'name' : '' , 'hsnCode' :'', 'price' :'', 'displayPicture': emptyFile, 'serialNo' :'', 'description' :'', 'inStock' :0, pk : null }
        }

        $scope.save = function() {
          console.log('entered');
          var f = $scope.product;
          var url = '/api/POS/product/';
          if ($scope.mode == 'new'){
            var method = 'POST';
          }else {
            var method = 'PATCH';
            url += $scope.product.pk +'/';
          }

          var fd = new FormData();
          if (f.displayPicture != emptyFile) {
            fd.append('displayPicture' , f.displayPicture)
          }

          if (f.name.length == 0) {
            Flash.create('warning' , 'Name can not be blank');
            return;
          }
          fd.append('name' , f.name);
          fd.append('hsnCode' , f.hsnCode);
          fd.append('price' , f.price);
          fd.append('serialNo' , f.serialNo);
          fd.append('description' , f.description);
          fd.append('inStock' , f.inStock);
          console.log(f.displayPicture);


          $http({
            method: method,
            url: url,
            data: fd,
            transformRequest: angular.identity,
            headers: {
              'Content-Type': undefined
            }
          }).
          then(function(response) {
            $scope.product.pk = response.data.pk;
            if ($scope.mode == 'new') {
              $scope.form.pk = response.data.pk;
              $scope.mode = 'edit';
            }
            Flash.create('success', 'Saved')
          })
        }

        // $scope.form = {'name' : name , address : {street : '' , state : '' , pincode : '' , country :  'India'}}
      },
    }).result.then(function () {

    } , function() {

    });


  }


  $scope.openInvoiceForm = function(idx) {


    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.invoices.form.html',
      size: 'lg',
      backdrop : true,
      resolve : {invoice : function() {
        if (idx == undefined || idx == null) {
          return {};
        }else {
          return $scope.invoices[idx];
        }
      }},
      controller: 'controller.POS.invoice.form',
    }).result.then(function () {

    } , function() {

    });


  }
  // $scope.openCustomerForm()

  $scope.invoices= [
    {id:"#123",name:"Prabhakar",date:"10/02/10",paid:"true",mode:"cash",amount:230,pk:1},
    {id:"#234",name:"Ankita",date:"12/04/18",paid:"false",mode:"card",amount:500,pk:2},
    {id:"#456",name:"Swagata",date:"10/07/17",paid:"true",mode:"paytm",amount:200,pk:3},
    {id:"#789",name:"Raju",date:"15/05/17",paid:"false",mode:"cash",amount:300,pk:4},

  ]

  $http({method : 'GET' , url : '/api/POS/customer/'}).
  then(function(response) {
    $scope.customers = response.data;
  })

  // $scope.customers= [
  //   {name:"Prabhakar",Email:"prabhakar.paul12@gmail.com",phone:8239758904,Address:"Siliguri",pk:1,id:"#123",date:"10/02/10",paid:"true",mode:"cash",amount:230},
  //   {name:"Ankita",Email:"Ankita@gmail.com",Phone:9931245652,Address:"Goa",pk:2,id:"#234",date:"12/04/18",paid:"false",mode:"card",amount:500},
  //   {name:"Swagata",Email:"Swagata@gmail.com",Phone:7945329454,Address:"Islampur",pk:3,id:"#456",date:"10/07/17",paid:"true",mode:"paytm",amount:200},
  //   {name:"Raju",Email:"raju@gmail.com",Phone:9876543219,Address:"Odissa",pk:4,id:"#789",date:"15/05/17",paid:"false",mode:"cash",amount:300},
  //
  // ]

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
  // $scope.dates = [
  //   "jan-march-2018", "Apr-jun-2018", "jul-Sep-2018","oct-Dec-2018"];
  // $scope.returndates = [
  //     "jan-march-2018", "Apr-jun-2018", "jul-Sep-2018","oct-Dec-2018"];
});



// app.directive('myEnter', function () {
//   return function (scope, element, attrs) {
//       element.bind("keydown keypress", function (event) {
//           if(event.which === 13) {
//               scope.$apply(function (){
//                   scope.$eval(attrs.myEnter);
//               });
//
//               event.preventDefault();
//           }
//       });
//   };
// });
