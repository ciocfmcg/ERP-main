app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.POS', {
      url: "/POS",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/app.POS.default.html',
          controller: 'businessManagement.POS.default',
        }
      }
    })
});

app.controller("controller.POS.invoice.form", function($scope, invoice,$http,Flash) {

  if (invoice.pk != undefined) {
    $scope.mode = 'edit';
    $scope.invoice = invoice;
    $scope.form = invoice;
    console.log($scope.form.products);

    if (typeof $scope.form.products == 'string') {
      $scope.form.products = JSON.parse($scope.form.products)
      console.log($scope.invoice);
    }

  } else {
    $scope.mode = 'new';
    $scope.invoice = {
      name: '',
      id: emptyFile
    }
  }
  $scope.addTableRow = function() {
    $scope.form.products.push({data:"",quantity:1});
    console.log( $scope.form.products);
  }
  $scope.deleteTable = function(index) {
    $scope.form.products.splice(index, 1);
  };

  $scope.subTotal = function() {
       var subTotal = 0;
       angular.forEach($scope.form.products, function(item) {
          if(item.data.productMeta != undefined){
           subTotal += (item.quantity*(item.data.productMeta.taxRate*item.data.price/100 + item.data.price));
         }
       })
       return subTotal.toFixed(2);
   }
   $scope.subTotalTax = function() {
        var subTotalTax = 0;
        angular.forEach($scope.form.products, function(item) {
            if(item.data.productMeta != undefined){
            subTotalTax += (item.data.productMeta.taxRate*item.data.price/100);
          }
        })
        return subTotalTax.toFixed(2);
    }
    $scope.productSearch = function(query) {
      console.log("called");
      return $http.get('/api/POS/product/?name__contains=' + query).
      then(function(response) {
        return response.data;
      })
    }

    $scope.saveInvoiceForm = function() {
      console.log('************');
      console.log($scope.invoice.duedate);
      console.log($scope.form);
      // console.log($scope.products.data.pk);

      var f = $scope.form;
      console.log(f);
      console.log(f.products);
      if (typeof $scope.invoice.duedate == 'object'){
        var date=$scope.invoice.duedate.toJSON().split('T')[0];
      }else {
        var date=$scope.invoice.duedate
      }
      var toSend = {
        invoicedate: date,
        products: JSON.stringify(f.products),
      }

      $http({
        method: 'PATCH',
        url: '/api/POS/invoice/'+f.pk+'/',
        data: toSend
      }).
      then(function(response) {
        // $scope.form.pk = response.data.pk;
        Flash.create('success', 'Saved');
      })
    }


})


app.controller("POS.invoice.item", function($scope) {
  if (typeof $scope.data.products == 'string') {
    $scope.data.products = JSON.parse($scope.data.products);
  }

  console.log();
  if ($scope.$parent.$parent.$parent.customer != undefined) {
    $scope.showControls = false;
  }else {
    $scope.showControls = true;
  }

  $scope.subTotal = function() {
       var subTotal = 0;
       angular.forEach($scope.data.products, function(item) {
           subTotal += (item.quantity*(item.data.productMeta.taxRate*item.data.price/100 + item.data.price));
       })
       return subTotal.toFixed(2);
   }
});

app.controller("controller.POS.productinfo.form", function($scope, product) {

  if (product.pk != undefined) {
    $scope.mode = 'edit';
    $scope.product = product;
  } else {
    $scope.mode = 'new';
    $scope.product = {
      name: '',
      img: emptyFile
    }
  }


  // $scope.products=products;

  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.onClick = function(points, evt) {
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
app.controller("controller.POS.customer.form", function($scope, customer, $http, Flash, $uibModalInstance) {
  console.log(customer);
  if (customer.pk != undefined) {
    $scope.mode = 'edit';
    $scope.customer = customer;
    $scope.invoiceMode = false;
  } else {
    $scope.mode = 'new';
    if (customer.name == undefined) {
      var name = '';
      $scope.invoiceMode = false;
    } else {
      $scope.invoiceMode = true;
      var name = customer.name;
    }
    $scope.customer = {
      'name': name,
      'company': '',
      'email': '',
      'mobile': '',
      'notes': '',
      'pan': '',
      'gst': '',
      'street': '',
      'city': '',
      'state': '',
      'pincode': '',
      'country': 'India',
      'streetBilling': '',
      'cityBilling': '',
      'stateBilling': '',
      'pincodeBilling': '',
      'countryBilling': 'India',
      'sameAsShipping': false,
      pk: null
    }
  }

  $scope.save = function() {
    var f = $scope.customer;
    if (f.name.length == 0) {
      Flash.create('warning', 'Name can not be left blank');
      return;
    }

    if ($scope.invoiceMode) {

    }

    var toSend = {
      name: f.name,
      sameAsShipping: f.sameAsShipping
    }

    var toPut = ['company', 'email', 'mobile', 'notes', 'pan', 'gst', 'street', 'city', 'state', 'pincode', 'country', 'streetBilling', 'cityBilling', 'stateBilling', 'pincodeBilling', 'countryBilling']

    for (var i = 0; i < toPut.length; i++) {
      var val = f[toPut[i]];
      if (val != undefined && val.length > 0) {
        toSend[toPut[i]] = val;
      }
    }

    var url = '/api/POS/customer/';
    if ($scope.mode == 'new') {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += $scope.customer.pk + '/';
    }

    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      $scope.customer.pk = response.data.pk;
      if ($scope.mode == 'new') {
        Flash.create('success', 'Saved');
      } else {
        Flash.create('success', 'Created');
      }
      $scope.mode = 'edit';
      if ($scope.invoiceMode) {
        $uibModalInstance.dismiss('created||' + response.data.pk)
      }
    })
  }

})

app.controller("controller.POS.customerinfo.form", function($scope, customer,$http) {

  if (customer.pk != undefined) {
    $scope.mode = 'edit';
    $scope.customer = customer;
    $scope.form = customer;
    $scope.invoice = customer;
  } else {
    $scope.mode = 'new';
    $scope.customer = {
      name: '',
      email: emptyFile
    }
  }
  console.log($scope.customer);
  console.log("/api/POS/invoice/?customer="+$scope.customer.pk);
  $http({
    method: "GET",
    url: "/api/POS/invoice/?customer="+$scope.customer.pk,
  }).
  then(function(response) {
    $scope.invoices = response.data;
  })

})

app.controller("controller.POS.invoicesinfo.form", function($scope, invoice,$http,Flash) {

  if (invoice.pk != undefined) {
    $scope.mode = 'edit';
    $scope.invoice = invoice;
    $scope.form = invoice;
    if (typeof $scope.invoice.products == 'string') {
      $scope.invoice.products = JSON.parse($scope.invoice.products);
    }

    $scope.form = invoice;
  } else {
    $scope.mode = 'new';
    $scope.invoice = {
      name: '',
      id: emptyFile
    }
  }
  $scope.subTotal = function() {
       var subTotal = 0;
       angular.forEach($scope.form.products, function(item) {
          if(item.data != undefined){
           subTotal += (item.quantity*(item.data.productMeta.taxRate*item.data.price/100 + item.data.price));
         }
       })
       return subTotal.toFixed(2);
   }

   $scope.modeofpayment = ["card", "netBanking", "cash","cheque"];
   $scope.save = function() {

     var f = $scope.form;
     console.log(f);
     if (f.amountRecieved.length == 0) {
       Flash.create('warning', 'Amount can not be left blank');
       return;
     }

     console.log(f.amountRecieved);
     console.log(f.modeOfPayment);
     var toSend = {
       amountRecieved: f.amountRecieved,
       modeOfPayment: f.modeOfPayment
     }
     console.log(toSend);


     // var url = '/api/POS/invoice/';
     // if ($scope.form.pk == undefined)  {
     //   var method = 'POST';
     // } else {
     //   var method = 'PATCH';
     //   url += $scope.form.pk + '/';
     // }
     //
     $http({
       method: 'PATCH',
       url:'/api/POS/invoice/'+f.pk+'/',
       data: toSend
     }).
     then(function(response) {
         Flash.create('success', 'Saved');
     })
   }

})

app.controller("businessManagement.POS.default", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal) {

  $scope.item = '';
  $scope.items = '';
  $scope.items1 = '';
  // $scope.products =[{name:'prabhakar'},{name:'ankita'},{name:'sai'},{name:'swagata'},{name:'pradeep'},{name:'raju'}]

  $scope.productSearch = function(query) {
    console.log("called");
    return $http.get('/api/POS/product/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  }

  $scope.selected = '';
  // $scope.customers =[{name:'prabhakar'},{name:'ankita'},{name:'sai'},{name:'swagata'},{name:'pradeep'},{name:'raju'}]

  $scope.data = {
    tableData: [],
    invoiceDataTable: [],
    customerDataTable: []
  };

  var views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.POS.product.item.html',
  }, ];


  var multiselectOptions = [{
    icon: 'fa fa-plus',
    text: 'new'
  }, ];

  $scope.config = {
    views: views,
    url: '/api/POS/product/',
    searchField: 'name',
    itemsNumPerView: [6, 12, 24],
    multiselectOptions: multiselectOptions,
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
    multiselectOptions: multiselectOptions,
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
    searchField: 'id',
    itemsNumPerView: [6, 12, 24],
    multiselectOptions: multiselectOptions,
  }






  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    if (action == 'new') {
      $scope.openProductForm();
    } else {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openProductForm(i);
            console.log('editing');
          } else {
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
    } else {
      for (var i = 0; i < $scope.data.customerDataTable.length; i++) {
        if ($scope.data.customerDataTable[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openCustomerForm(i);
          } else {
            $scope.openCustomerInfo(i);
          }
        }
      }
    }

  }

  $scope.tableActionInvoice = function(target, action) {
    console.log(target, action);
    console.log($scope.data.invoiceDataTable);

    if (action == 'new') {
      $scope.createInvoice();
    } else {
      for (var i = 0; i < $scope.data.invoiceDataTable.length; i++) {
        if ($scope.data.invoiceDataTable[i].pk == parseInt(target)) {
          if (action == 'edit') {
            $scope.openInvoiceForm(i);
          } else {
            $scope.openInvoiceinfoForm(i);
          }
        }
      }
    }

  }


  $scope.mode='home';
  // $scope.mode = 'invoice'
  $scope.tabs = [];
  $scope.searchTabActive = true;
  var dummyDate = new Date();

  var onlyDate = new Date(dummyDate.getFullYear(), dummyDate.getMonth(), dummyDate.getDate()); // 2013-07-30 23:59:59

  $scope.resetForm = function() {
    $scope.form = {
      customer: '',
      invoiceDate: onlyDate,
      deuDate: onlyDate,
      products: [{
        data: '',quantity:1
      }]
    }
  }

  $scope.resetForm();

  $scope.subTotal = function() {
       var subTotal = 0;
       angular.forEach($scope.form.products, function(item) {
           subTotal += (item.quantity*(item.data.productMeta.taxRate*item.data.price/100 + item.data.price));
       })
       return subTotal.toFixed(2);
   }
   $scope.subTotalTax = function() {
        var subTotalTax = 0;
        angular.forEach($scope.form.products, function(item) {
            subTotalTax += (item.data.productMeta.taxRate*item.data.price/100);
        })
        return subTotalTax.toFixed(2);
    }

  console.log(onlyDate);
  $scope.customerNameSearch = function(query) {
    return $http.get('/api/POS/customer/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.$watch('form.customer', function(newValue, oldValue) {
    console.log(newValue);
    if (typeof newValue == "string" && newValue.length > 0) {
      $scope.showCreateCustomerBtn = true;
      $scope.customerExist = false;
      $scope.showCustomerForm = false;
    } else if (typeof newValue == "object") {
      $scope.customerExist = true;
    } else {
      $scope.showCreateCustomerBtn = false;
      $scope.showCustomerForm = false;
    }

    if (newValue == '') {
      $scope.showCreateCustomerBtn = false;
      $scope.showCustomerForm = false;
      $scope.customerExist = false;
    }

  });

  // $scope.createCustomer = function() {
  //   if ($scope.customerExist) {
  //     $scope.showCustomerForm = true;
  //     $scope.showCreateCustomerBtn = false;
  //     return
  //   }
  //
  //   if (typeof $scope.form.customer == "string" && $scope.form.customer.length > 1) {
  //     var dataToSend = {
  //       name: $scope.form.customer,
  //       user: $scope.me.pk
  //     }
  //     $http({
  //       method: 'POST',
  //       url: '/api/POS/customer/',
  //       data: dataToSend
  //     }).
  //     then(function(response) {
  //       $scope.form.customer = response.data;
  //       Flash.create('success', 'Created');
  //     })
  //   } else {
  //     Flash.create('warning', 'Company name too small')
  //   }
  // }


  var numberOfDaysToAdd = 7;
  d = dummyDate.setDate(dummyDate.getDate() + numberOfDaysToAdd);
  $scope.form.dates=new Date(d).toLocaleDateString();


  var numberOfMonthsToAdd = 3;

  d = dummyDate.setMonth(dummyDate.getMonth() + numberOfMonthsToAdd);
  $scope.form.returndates=new Date(d).toLocaleDateString();



  $http({
    method: 'GET',
    url: '/api/POS/product/'
  }).
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
      backdrop: true,
      resolve: {
        customer: function() {
          if (idx == undefined || idx == null) {
            if ($scope.mode == 'invoice' && typeof $scope.form.customer != 'object') {
              return {
                name: $scope.form.customer
              };
            } else if (typeof $scope.form.customer == 'object') {
              return $scope.form.customer;
            } else {
              return {};
            }
          } else {
            return $scope.customers[idx];
          }
        }
      },
      controller: "controller.POS.customer.form",

    }).result.then(function(d) {
      console.log(d);
    }, function(d) {
      console.log(d);
      if (d.split('||')[0] == 'created') {
        $http({
          method: 'GET',
          url: '/api/POS/customer/' + d.split('||')[1] + '/'
        }).then(function(response) {
          $scope.form.customer = response.data;
        })
      }
    });


  }

  // $scope.openCustomerForm();

  $scope.openProductInfo = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.productinfo.form.html',
      size: 'md',
      backdrop: true,
      resolve: {
        product: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.products[idx];
          }
        }
      },
      controller: "controller.POS.productinfo.form",
    }).result.then(function() {

    }, function() {

    });



  }

  $scope.openInvoiceinfoForm = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.invoicesinfo.form.html',
      size: 'md',
      backdrop: true,
      resolve: {
        invoice: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.invoices[idx];
          }
        }
      },
      controller: "controller.POS.invoicesinfo.form",
    }).result.then(function() {

    }, function() {

    });



  }

  $scope.openCustomerInfo = function(idx) {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.customerinfo.form.html',
      size: 'md',
      backdrop: true,
      resolve: {
        customer: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.customers[idx];
          }
        }
      },
      controller: "controller.POS.customerinfo.form",
    }).result.then(function() {

    }, function() {

    });



  }

  $scope.openProductForm = function(idx) {


    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.product.form.html',
      size: 'md',
      backdrop: true,
      resolve: {
        product: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.products[idx];
          }
        }
      },
      controller: function($scope, product) {
        console.log(product);
        $scope.$watch('product.productMeta' , function(newValue , oldValue) {
          if (typeof newValue == 'object') {
            $scope.showTaxCodeDetails = true;
          }else {
            $scope.showTaxCodeDetails = false;
          }
        })

        $scope.searchTaxCode = function(c) {
          return $http.get('/api/clientRelationships/productMeta/?description__contains='+c).
          then(function(response) {
            return response.data;
          })
        }

        if (product.pk != undefined) {
          $scope.mode = 'edit';
          $scope.product = product;
        } else {
          $scope.mode = 'new';
          $scope.product = {
            'name': '',
            'productMeta': '',
            'price': '',
            'displayPicture': emptyFile,
            'serialNo': '',
            'description': '',
            'inStock': 0,
            'cost':0,
            'logistics':0,


            pk: null
          }
        }

        $scope.save = function() {
          console.log('entered');
          console.log($scope.product.productMeta);
          console.log($scope.product.productMeta.pk);

          var f = $scope.product;
          var url = '/api/POS/product/';
          if ($scope.mode == 'new') {
            var method = 'POST';
          } else {
            var method = 'PATCH';
            url += $scope.product.pk + '/';
          }

          var fd = new FormData();
          if (f.displayPicture != emptyFile && f.displayPicture != null) {
            fd.append('displayPicture', f.displayPicture)
          }

          if (f.name.length == 0) {
            Flash.create('warning', 'Name can not be blank');
            return;
          }
          fd.append('name', f.name);
          fd.append('productMeta', f.productMeta.pk);
          fd.append('price', f.price);
          fd.append('serialNo', f.serialNo);
          fd.append('description', f.description);
          fd.append('inStock', f.inStock);
          fd.append('cost', f.cost);
          fd.append('logistics', f.logistics);


          console.log(f.displayPicture);
          console.log(fd);

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


      },
    }).result.then(function() {

    }, function() {

    });


  }


  $scope.openInvoiceForm = function(idx) {


    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.POS.invoices.form.html',
      size: 'lg',
      backdrop: true,
      resolve: {
        invoice: function() {
          if (idx == undefined || idx == null) {
            return {};
          } else {
            return $scope.invoices[idx];
          }
        }
      },
      controller: 'controller.POS.invoice.form',
    }).result.then(function() {

    }, function() {

    });


  }


  $http({
    method: 'GET',
    url: '/api/POS/customer/'
  }).
  then(function(response) {
    $scope.customers = response.data;
  })

  $http({
    method: 'GET',
    url: '/api/POS/invoice/'
  }).
  then(function(response) {
    $scope.invoices = response.data;
  })



  $scope.labels = ["January", "February", "March", "April", "May", "June", "July"];
  $scope.series = ['Series A', 'Series B'];
  $scope.data = [
    [65, 59, 80, 81, 56, 55, 40],
    [28, 48, 40, 19, 86, 27, 90]
  ];
  $scope.onClick = function(points, evt) {
    console.log(points, evt);
  };

  $scope.labels2 = ["Download Sales", "In-Store Sales", "Mail-Order Sales"];
  $scope.data2 = [300, 500, 100];


  $scope.addRow = function() {
    $scope.form.products.push({data:"",quantity:1});
    console.log( $scope.form.products);

  }

  $scope.delete = function(index) {
    $scope.form.products.splice(index, 1);
  };

  $scope.saveInvoice = function() {
    console.log('************');
    console.log(typeof $scope.form.invoiceDate);
    console.log(typeof $scope.form.deuDate);
    console.log( $scope.form.dates);
    console.log( $scope.form.returndates);
    console.log($scope.form.serialNumber);
    console.log($scope.form.customer.pk);
    console.log($scope.form);
    // console.log($scope.products.data.pk);

    var f = $scope.form;
    if (f.serialNumber.length == 0) {
      Flash.create('warning', 'serialNumber can not be left blank');
      return;
    }

    console.log(f);

    // if ($scope.invoiceMode) {
    //
    // }JSON.stringify(f.invoiceDate).split('T')[0].split('"')[1]
    console.log(f.invoiceDate);
    console.log(f.invoiceDate.toJSON().split('T')[0]);
    var toSend = {
      serialNumber: f.serialNumber,
      invoicedate: f.invoiceDate.toJSON().split('T')[0],
      reference: f.reference,
      duedate: f.deuDate.toJSON().split('T')[0],
      returnquater: $scope.form.returndates,
      returndate: $scope.form.dates,
      products: JSON.stringify(f.products),
      customer: f.customer.pk
    }
    var returnquaterParts=toSend.returnquater.split('/');
    toSend.returnquater=returnquaterParts[2]+'-'+returnquaterParts[1]+'-'+returnquaterParts[0];
    var returndateParts=toSend.returndate.split('/');
    toSend.returndate=returndateParts[2]+'-'+returndateParts[1]+'-'+returndateParts[0];
    console.log(toSend);
    var url = '/api/POS/invoice/';
    if ($scope.form.pk == undefined) {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += $scope.form.pk + '/';
    }

    $http({
      method: method,
      url: url,
      data: toSend
    }).
    then(function(response) {
      $scope.form.pk = response.data.pk;
      Flash.create('success', 'Saved');
    })
  }


});
