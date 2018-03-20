// <<<<<<< HEAD
app.config(function($stateProvider) {
  $stateProvider.state('businessManagement.warehouse.contract', {
    url: "/contract",
    templateUrl: '/static/ngTemplates/app.warehouse.contract.html',
    controller: 'businessManagement.warehouse.contract'
  });
});

app.controller("businessManagement.warehouse.contract.quote", function($scope, $state, $users, $stateParams, $http, Flash, $uibModalInstance, quoteData, ) {
  $scope.quote = quoteData;
  $scope.firstQuote = false;
  $scope.types = crmRelationTypes;
  $scope.total = $scope.quote.value;
  $scope.data = $scope.quote.data;

  $scope.resetForm = function() {
    $scope.form = {
      type: 'onetime',
      quantity: 0,
      tax: 0,
      rate: 0,
      desc: '',
      productMeta: ''
    };
  }
  $scope.searchTaxCode = function(c) {
    return $http.get('/api/clientRelationships/productMeta/?description__contains=' + c).
    then(function(response) {
      return response.data;
    })
  }
  $scope.$watch('form.productMeta', function(newValue, oldValue) {
    if (typeof newValue == 'object') {
      $scope.showTaxCodeDetails = true;
    } else {
      $scope.showTaxCodeDetails = false;
    }
  })
  $scope.setType = function(typ) {
    $scope.form.type = typ;
  }
  $scope.cancel = function(e) {
    $uibModalInstance.dismiss();
  };
  $scope.remove = function(idx) {
    $scope.data.splice(idx, 1);
  }
  $scope.edit = function(idx) {
    var d = $scope.data[idx];
    $scope.form = {
      type: d.type,
      quantity: d.quantity,
      tax: d.tax,
      rate: d.rate,
      desc: d.desc
    };
    $http({
      method: 'GET',
      url: '/api/clientRelationships/productMeta/?code=' + d.taxCode
    }).
    then(function(response) {
      $scope.form.productMeta = response.data[0];
    })
    $scope.data.splice(idx, 1);
  }
  $scope.calculateTotal = function() {
    var total = 0;
    var totalTax = 0;
    var grandTotal = 0;
    for (var i = 0; i < $scope.data.length; i++) {
      $scope.data[i].total = parseInt($scope.data[i].quantity) * parseInt($scope.data[i].rate);
      $scope.data[i].totalTax = $scope.data[i].total * parseInt($scope.data[i].tax) / 100;
      $scope.data[i].subtotal = $scope.data[i].totalTax + $scope.data[i].total;
      total += $scope.data[i].total;
      totalTax += $scope.data[i].totalTax;
      grandTotal += $scope.data[i].subtotal;
    }

    $scope.totalTax = totalTax;
    $scope.total = total;
    $scope.grandTotal = grandTotal;
    $scope.quote.calculated = {
      value: total,
      tax: totalTax,
      grand: grandTotal
    }

  }

  $scope.add = function() {
    console.log('entered');
    if ($scope.form.tax > 70) {
      Flash.create('warning', 'The tax rate is unrealistic');
      return;
    }
    $scope.data.push({
      type: $scope.form.type,
      tax: $scope.form.productMeta.taxRate,
      desc: $scope.form.desc,
      rate: $scope.form.rate,
      quantity: $scope.form.quantity,
      taxCode: $scope.form.productMeta.code
    })
    $scope.resetForm();
  }
  $scope.resetForm();
  $scope.$watch('data', function(newValue, oldValue) {
    $scope.calculateTotal();
  }, true)

});


// app.controller("businessManagement.warehouse.contract.notification", function($scope, $state, $users, $stateParams, $http, Flash, $sce, $aside , quote , deal , $uibModalInstance) {
//   $scope.quote = quote;
//   // $scope.deal = deal;
//   $scope.send = function() {
//     var contacts = []
//     for (var i = 0; i < $scope.contacts.length; i++) {
//       if ($scope.contacts[i].checked) {
//         contacts.push($scope.contacts[i].pk);
//       }
//     }
//
//     var internal = []
//     for (var i = 0; i < $scope.internalUsers.length; i++) {
//       internal.push($scope.internalUsers[i]);
//     }
//
//     var toSend = {
//       sendEmail : $scope.sendEmail,
//       sendSMS : $scope.sendSMS,
//       internal : internal,
//       contacts : contacts,
//       type : $scope.notificationType,
//       contract : $scope.quote.pk
//     }
//     $http({method : 'POST' , url : '/api/clientRelationships/sendNotification/' , data : toSend}).
//     then(function() {
//
//     }, function() {
//       $scope.reset();
//     })
//   }
//
//
//
//
//   $scope.cancel = function(e) {
//     $uibModalInstance.dismiss();
//   };
//
//   $scope.reset = function() {
//     for (var i = 0; i < $scope.contacts.length; i++) {
//       $scope.deal.contacts[i].checked = false;
//     }
//     $scope.notificationType = 'Please select';
//     $scope.sendEmail = false;
//     $scope.sendSMS = false;
//     $scope.internalUsers = [];
//   }
//
//   $scope.reset();
//
//
// });


app.controller("businessManagement.warehouse.contract.explore", function($scope, $state, $users, $stateParams, $http, Flash, $sce, $aside, $timeout, $uibModal) {

  $scope.changeStatus = function(status , indx) {
    $scope.contract.invoice[indx].status = status;

    if (status == 'billed') {
      $uibModal.open({
        template: '<div style="padding:30px;"><div class="form-group"><label>Due Date</label>'+
            '<div class="input-group" >'+
                '<input type="text" class="form-control" show-weeks="false" uib-datepicker-popup="dd-MMMM-yyyy" ng-model="contract.dueDate" is-open="status.opened" />' +
                '<span class="input-group-btn">'+
                  '<button type="button" class="btn btn-default" ng-click="status.opened = true;"><i class="glyphicon glyphicon-calendar"></i></button>'+
                '</span>'+
              '</div><p class="help-block">Auto set based on Deal due period.</p>'+
          '</div></div>',
        size: 'sm',
        backdrop : true,
        resolve : {
          contract : function() {
            return $scope.contract.invoice[indx];
          },
          // deal : function() {
          //   return $scope.deal;
          // }
        },
        controller: function($scope , contract){
          $scope.contract = contract;
          var dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + contract.duePeriod);
          if ($scope.contract.dueDate == null) {
            $scope.contract.dueDate = dueDate;
          }
          // $scope.deal = deal;
        },
      }).result.then(function () {

      }, (function(indx, status) {
        return function () {
          console.log(indx);
          console.log($scope.contract.invoice[indx].dueDate);

          $http({method : 'PATCH' , url : '/api/warehouse/invoice/' + $scope.contract.invoice[indx].pk + '/' , data : {status : status , dueDate : $scope.contract.invoice[indx].dueDate.toISOString().substring(0, 10) }}).
          then(function(response) {
            $http({method : 'GET' , url : '/api/clientRelationships/downloadInvoice/?saveOnly=1&contract=' + response.data.pk}).
            then(function(response) {
              Flash.create('success' , 'Saved')
            }, function(err) {
              Flash.create('danger' , 'Error occured')
            })
          })



        }
      })(indx, status));



    }else if (status == 'dueElapsed') {

      var sacCode = 998311;
      var c = $scope.contract.invoice[indx];
      for (var i = 0; i < c.data.length; i++) {
        if (c.data[i].taxCode == sacCode) {
          return;
        }
      }

      var fineAmount = $scope.contract.invoice[indx].value * $scope.deal.duePenalty*(1/100)

      $http({method : 'GET' , url : '/api/clientRelationships/productMeta/?code='+ sacCode}).
      then((function(indx) {
        return function(response) {
          var quoteInEditor = $scope.contract.invoice[indx]
          var productMeta = response.data[0];
          var subTotal = fineAmount*(1+productMeta.taxRate/100)
          quoteInEditor.data.push({currency : $scope.deal.currency , type : 'onetime' , tax: productMeta.taxRate, desc : 'Late payment processing charges' , rate : fineAmount , quantity : 1, taxCode : productMeta.code , totalTax : fineAmount*(productMeta.taxRate/100), subtotal : subTotal })

          quoteInEditor.value += subTotal
          var url = '/api/warehouse/invoice/' + quoteInEditor.pk + '/'
          var method = 'PATCH'
          var dataToSend = {deal : $scope.deal.pk , data : JSON.stringify(quoteInEditor.data) , value : quoteInEditor.value};
          $http({method : method , url : url , data : dataToSend}).
          then(function(response) {
            $http({method : 'GET' , url : '/api/clientRelationships/downloadInvoice/?saveOnly=1&contract=' + response.data.pk}).
            then(function(response) {
              Flash.create('success' , 'Saved')
            }, function(err) {
              Flash.create('error' , 'Error occured')
            })
          })
        }
      })(indx))


    }else {

      $http({method : 'PATCH' , url : '/api/warehouse/invoice/' + $scope.contract.invoice[indx].pk + '/' , data : {status : status}}).
      then(function(response) {

      })

    }


  }


  // $scope.sendNotification = function(indx){
  //
  //   $scope.quote = $scope.contract.invoice[indx];
  //
  //   $aside.open({
  //     templateUrl : '/static/ngTemplates/app.clientRelationships.quote.notification.html',
  //     placement: 'right',
  //     size: 'lg',
  //     backdrop : false,
  //     resolve: {
  //       quote : function() {
  //         return $scope.quote;
  //       },
  //       // deal : function() {
  //       //   return $scope.contracts;
  //       // },
  //     },
  //     controller : 'businessManagement.warehouse.contract.notification'
  //   })
  // }

  $scope.contract = $scope.tab.data;
  console.log('invoice');
  $scope.fetchInvoice = function() {
    $scope.contract.invoice = [];
    $http({
      method: 'GET',
      url: '/api/warehouse/invoice/'
    }).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        if (response.data[i].contract == $scope.contract.pk) {
          response.data[i].data = JSON.parse(response.data[i].data);
          $scope.contract.invoice.push(response.data[i]);
        }
      }
    })
  }
  $scope.fetchInvoice();
  console.log($scope.contract);
  console.log($scope.contract.invoice);

  $scope.contactSearch = function() {
    return $http.get('/api/warehouse/contact/').
    then(function(response) {
      $scope.contract.contact = response.data;
    })
  };
  $scope.contactSearch();

  $scope.editQuote = function(idx) {
    if (typeof idx == 'number') {
      $scope.quoteInEditor = $scope.contract.invoice[idx];
    } else {
      $scope.quoteInEditor = {
        data: [],
        value: 0,
        doc: null,
        status: 'quoted',
        details: '',
        pk: null
      }
    }
    console.log('in quote');
    $aside.open({
      templateUrl: '/static/ngTemplates/app.warehouse.quote.form.html',
      placement: 'right',
      size: 'xl',
      resolve: {
        quoteData: function() {
          return $scope.quoteInEditor;
        },
      },
      controller: 'businessManagement.warehouse.contract.quote'
    }).result.then(function() {

    }, function() {
      console.log('submitting');
      console.log($scope.contract.pk);
      console.log($scope.contract);
      var method;
      var url = '/api/warehouse/invoice/'
      if ($scope.quoteInEditor.pk == null) {
        method = 'POST'
      } else {
        method = 'PATCH'
        url += $scope.quoteInEditor.pk + '/'
      }

      if ($scope.quoteInEditor.data.length == 0) {
        return;
      }
      var dataToSend = {
        contract: $scope.contract.pk,
        data: JSON.stringify($scope.quoteInEditor.data),
        value: $scope.quoteInEditor.calculated.value,
        status: $scope.quoteInEditor.status
      };
      console.log($scope.quoteInEditor);
      console.log(dataToSend);
      console.log(url);
      console.log(method);
      $http({
        method: method,
        url: url,
        data: dataToSend
      }).
      then(function(response) {
        response.data.data = JSON.parse(response.data.data);
        if ($scope.contract.invoice.length == 0) {
          $scope.contract.invoice.push(response.data);
        } else {
          for (var i = 0; i < $scope.contract.invoice.length; i++) {
            if ($scope.contract.invoice[i].pk == response.data.pk) {
              $scope.contract.invoice[i] = response.data;
            } else {
              $scope.contract.invoice.push(response.data);
            }
          }
        }
        $scope.fetchInvoice();
      })
      // $scope.fetchInvoice();
      console.log($scope.quoteData);
    });

  }

});

app.controller("businessManagement.warehouse.contract.item", function($scope, $state, $users, $stateParams, $http, Flash) {


});

app.controller('businessManagement.warehouse.contract', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.contract.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/warehouse/contract/',
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
          var title = 'Edit contract : ';
          var appType = 'contractEditor';
        } else if (action == 'details') {
          var title = 'Contract Details : ';
          var appType = 'contractExplorer';
        }
        console.log("sampleee");
        console.log($scope.data.tableData[i]);
        $scope.addTab({
          title: title + $scope.data.tableData[i].pk,
          cancel: true,
          app: appType,
          // data: {
          //   pk: target,
          //   index: i,
          //   contract : $scope.data.tableData[i]
          // },
          data: $scope.data.tableData[i],
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


app.controller("businessManagement.warehouse.contract.form", function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $timeout) {

  $scope.getRandomColor = function() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  $scope.initializeCanvas = function() {




    console.log("canvas" + $scope.id);
    var canvas = document.getElementById("canvas" + $scope.id);

    canvas.removeEventListener('click', function() {

    });


    c = canvas.getContext("2d");
    console.log(c);
    boxSize = 40;
    boxes = Math.floor(1200 / boxSize);
    $scope.arr = [];
    $scope.arrays = [];
    $scope.selectedCompaniesArea = [];
    $scope.selectingAreas = [];
    $scope.selectingColour = $scope.getRandomColor();
    if (typeof $scope.contract.areas == 'object') {
      console.log($scope.contract.areas.contractSpace.length);
      for (var i = 0; i < $scope.contract.areas.contractSpace.length; i++) {
        console.log('pushing');
        $scope.arrays.push({
          'array': []
        })
      }
      console.log($scope.arrays);

    }
    var w = (canvas.width / boxSize);
    var h = (canvas.height / boxSize);
    drawBox();
    // canvas.addEventListener('click', handleClick);
    // canvas.addEventListener('mousemove', handleClick);
    // var value = 0;
    function drawBox() {
      c.beginPath();
      c.fillStyle = "#87CEFA";
      c.lineWidth = 1;
      c.strokeStyle = '#eeeeee';
      for (var row = 0; row < boxes; row++) {
        for (var column = 0; column < boxes; column++) {
          var x = row * boxSize;
          var y = column * boxSize;
          c.rect(x, y, boxSize, boxSize);
          c.fill();
          c.stroke();
        }
      }

    }

    var state = new Array(h);
    for (var y = 0; y < h; ++y) {
      state[y] = new Array(w);
    }

    canvas.addEventListener('click', handleClick);

    function fill(s, gx, gy) {
      c.fillStyle = s;
      c.fillRect(gx * boxSize, gy * boxSize, boxSize, boxSize);
    }
    if ($scope.spaceData) {
      console.log('entered');
      $scope.arr = JSON.parse($scope.contract.areas.areas);
      for (var i = 0; i < $scope.arr.length; i++) {
        var gx = $scope.arr[i].row
        var gy = $scope.arr[i].col
        state[gy][gx] = true;
        fill('white', gx, gy);
      }
      if ($scope.contract.occupancy.length > 0) {
        $scope.selectingAreas = $scope.contract.occupancy
        if (typeof $scope.selectingAreas == 'string') {
          $scope.selectingAreas = JSON.parse($scope.selectingAreas)
        }
      }
      for (var i = 0; i < $scope.contract.areas.contractSpace.length; i++) {
        console.log('infoooooooo');
        $scope.arrays[i].array = $scope.contract.areas.contractSpace[i];
        if (typeof $scope.arrays[i].array.occupancy == 'string') {
          $scope.arrays[i].array.occupancy = JSON.parse($scope.arrays[i].array.occupancy)
        }
        console.log($scope.selectingAreas, '.....');
        console.log($scope.arrays[i].array.occupancy);
        if (JSON.stringify($scope.arrays[i].array.occupancy) == JSON.stringify($scope.selectingAreas)) {
          console.log('equallllll');
          // JSON.stringify($scope.selectingAreas)
          $scope.arrays.splice(i, 1);
        }

      }
      for (var i = 0; i < $scope.arrays.length; i++) {
        $scope.selectedContractColour = $scope.getRandomColor();
        $scope.selectedCompaniesArea.push({
          color: $scope.selectedContractColour,
          company: $scope.arrays[i].array.company.name
        })
        for (var j = 0; j < $scope.arrays[i].array.occupancy.length; j++) {
          var gx = $scope.arrays[i].array.occupancy[j].row
          var gy = $scope.arrays[i].array.occupancy[j].col
          state[gy][gx] = true;
          fill($scope.selectedContractColour, gx, gy);
          // console.log(gx,gy,'values');
        }
        console.log($scope.selectedContractColour);

      }
      // for (var i = 0; i < $scope.selectingAreas.length; i++) {
      //   $scope.selectedContractColour = $scope.selectingColour;
      //   $scope.selectedCompaniesArea.push({color: $scope.selectedContractColour,company:$scope.contract.company.name})
      //   for (var j = 0; j < $scope.arrays[i].array.occupancy.length; j++) {
      //     var gx=$scope.arrays[i].array.occupancy[j].row
      //     var gy=$scope.arrays[i].array.occupancy[j].col
      //     state[gy][gx] = true;
      //     fill($scope.selectedContractColour, gx , gy );
      //     // console.log(gx,gy,'values');
      //   }
      //   console.log($scope.selectedContractColour);
      //
      // }
      if ($scope.selectingAreas.length > 0) {
        $scope.selectedContractColour = $scope.selectingColour;
        $scope.selectedCompaniesArea.push({
          color: $scope.selectedContractColour,
          company: $scope.contract.company.name
        })
        for (var i = 0; i < $scope.selectingAreas.length; i++) {
          var gx = $scope.selectingAreas[i].row
          var gy = $scope.selectingAreas[i].col
          state[gy][gx] = true;
          fill($scope.selectedContractColour, gx, gy);
          // console.log(gx,gy,'values');
        }
      }
      // if (true) {
      //
      // }
      // if ($scope.contract.occupancy.length >0){
      //   if ($scope.contract.areas.pk==$scope.areasData) {
      //     $scope.array = JSON.parse($scope.contract.occupancy);
      //   }else {
      //     $scope.array = [];
      //   }
      // }
      console.log($scope.arrays, 'remaining');
      console.log($scope.selectingAreas, 'selecting arraysssssssssssssss');
    }
    // for (var i = 0; i < $scope.arr.length; i++) {
    //   var gx=$scope.arr[i].row
    //   var gy=$scope.arr[i].col
    //   state[gy][gx] = true;
    //   fill('white', gx , gy );
    // }
    // for (var i = 0; i < $scope.array.length; i++) {
    //   var gx=$scope.array[i].row
    //   var gy=$scope.array[i].col
    //   state[gy][gx] = true;
    //   fill('green', gx , gy );
    // }
    // $scope.selectingArea = [ ];

    function handleClick(e) {
      console.log('333', $scope.arrays);
      $scope.clicked = true;
      // get mouse click position
      e.preventDefault()
      var mx = e.offsetX;
      var my = e.offsetY;
      // calculate grid square numbers
      var gx = ~~(mx / boxSize);
      var gy = ~~(my / boxSize);
      // console.log(gx,gy);
      // make sure we're in bounds
      if (gx < 0 || gx >= w || gy < 0 || gy >= h) {
        return;
      }
      state[gy][gx] = true;
      for (var i = 0; i < $scope.arr.length; i++) {
        if ($scope.arr[i].row == gx && $scope.arr[i].col == gy) {
          console.log('data', gx, gy);
          for (var j = 0; j < $scope.arrays.length; j++) {
            for (var k = 0; k < $scope.arrays[j].array.occupancy.length; k++) {
              if ($scope.arrays[j].array.occupancy[k].row == gx && $scope.arrays[j].array.occupancy[k].col == gy) {
                console.log('arrays there');
                return
              }
              // $scope.selectedArea.push($scope.arrays[j].array.occupancy[k]);
            }
            // if($scope.array[j].row==gx && $scope.array[j].col==gy){
            //   console.log('there');
            //   $scope.array.splice(j,1);
            //   console.log('after splice');
            //   console.log($scope.array);
            //   fill('white', gx, gy);
            //   return;
            // }
          }
          console.log('0000000000000');
          for (var j = 0; j < $scope.selectingAreas.length; j++) {
            console.log('aaaaaaaaaaaaaaaaaaaaa');
            if ($scope.selectingAreas[j].row == gx && $scope.selectingAreas[j].col == gy) {
              console.log('selecting');
              $scope.selectingAreas.splice(j, 1);
              fill('white', gx, gy);
              return
            }
          }
          console.log('not there');
          state[gy][gx] = true;
          fill($scope.selectingColour, gx, gy);
          $scope.selectingAreas.push({
            row: gx,
            col: gy
          });


          // console.log('66666666666',$scope.selectedArea);
          // state[gy][gx] = true;
          //
          // fill('green', gx, gy);
          // for (var j = 0; j < $scope.array.length; j++) {
          //   if ($scope.array[j].row == gx  &&  $scope.array[j].col == gy) {
          //     return;
          //   }
          // }
          // $scope.array.push({
          //   row: gx,
          //   col: gy
          // });
        }

      }
      console.log($scope.selectingAreas);
      $scope.canvasData = canvas;
      $scope.dataURL = $scope.canvasData.toDataURL();

    }



  }


  // $scope.contract = {company : '' , rate : 0 , dueDays : 0 ,quantity : 0 ,contractPaper : emptyFile ,billingFrequency : 0 ,billingDates : '' ,unitType : 'sqft' ,otherDocs : emptyFile ,occupancy: '',areas:'' }
  $scope.resetForm = function() {
    $scope.contract = {
      company: '',
      rate: 0,
      dueDays: 0,
      quantity: 0,
      contractPaper: emptyFile,
      billingFrequency: 0,
      billingDates: '',
      unitType: 'sqrt',
      otherDocs: emptyFile,
      occupancy: '',
      areas: '',
      occupancy_screenshort: ''
    }
  }
  $scope.dates = []
  for (var i = 1; i < 29; i++) {
    $scope.dates.push(i.toString());
  }
  $scope.addDate = function(date) {
    $scope.contract.billingDates += $scope.contract.billingDates == '' ? date : ',' + date;
  }
  if ($scope.tab == undefined || $scope.tab.data == undefined) {
    $scope.mode = 'new';
    $scope.resetForm();
    console.log('in new');
  } else {
    $scope.mode = 'edit';
    $scope.contract = $scope.tab.data
    $scope.areasData = $scope.contract.areas.pk
    console.log('edited form');
  }

  if ($scope.mode == 'new') {
    $scope.id = '0';
  } else {
    $scope.id = $scope.contract.pk;
  }

  // $timeout(function() {
  //   $scope.initializeCanvas();
  // }, 1000)



  $scope.serviceSearch = function(query) {
    return $http.get('/api/warehouse/service/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };
  $scope.spaceSearch = function(query) {
    return $http.get('/api/warehouse/space/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.$watch('contract.areas', function(newValue, oldValue) {
    console.log('cecking', newValue.pk);
    // if (newValue.pk==$scope.tab.data.areas.pk) {
    //   $scope.sameData=true;
    //
    // }
    if (typeof newValue == 'object') {
      $scope.spaceData = true;
      $timeout(function() {
        $scope.initializeCanvas();
      }, 1000)

    } else {
      $scope.spaceData = false;
    }
  })




  $scope.save = function() {
    console.log('entered');
    if ($scope.clicked) {
      console.log($scope.dataURL);
      console.log($scope.dataURL.length);
      $scope.contract.occupancy_screenshort = $scope.dataURL;
    }
    var f = $scope.contract;
    console.log($scope.selectingAreas);
    if (f.company.length == 0) {
      Flash.create('warning', 'Company can not be blank');
      return;
    } else if (typeof f.company != "object") {
      Flash.create('warning', "Company doesn't exist!");
      return;
    }

    if (f.areas.length != 0) {
      if (typeof f.areas != 'object') {
        Flash.create('warning', "No Such Space Available");
        return;
      } else {
        if ($scope.selectingAreas.length == 0) {
          Flash.create('warning', "Please Select Some Area");
          return;
        }
      }
    } else {
      Flash.create('warning', "Space Can't be Null");
      return;
    }

    var url = '/api/warehouse/contract/';
    if ($scope.mode == 'new') {
      var method = 'POST';
    } else {
      var method = 'PATCH';
      url += $scope.tab.data.pk + '/'; // $scope.tab.data.service.pk +'/';
    }

    var tosend = new FormData();
    if (f.contractPaper != emptyFile && f.contractPaper != null) {
      tosend.append('contractPaper', f.contractPaper)
    }
    if (f.otherDocs != emptyFile && f.otherDocs != null) {
      tosend.append('otherDocs', f.otherDocs)
    }
    if (f.billingFrequency != f.billingDates.split(',').length) {
      Flash.create('warning', 'BillingDates count Should Be Equal To BillingFrequency ');
      return;
    }
    tosend.append('company', f.company.pk);
    tosend.append('billingFrequency', f.billingFrequency);
    tosend.append('billingDates', f.billingDates);
    tosend.append('rate', f.rate);
    tosend.append('quantity', f.quantity);
    tosend.append('unitType', f.unitType);
    tosend.append('dueDays', f.dueDays);
    tosend.append('areas', f.areas.pk);
    tosend.append('occupancy', JSON.stringify($scope.selectingAreas));
    tosend.append('occupancy_screenshort', f.occupancy_screenshort);
    console.log(tosend);

    $http({
      method: method,
      url: url,
      data: tosend,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      if ($scope.mode == 'new') {
        $scope.contract.pk = response.data.pk;
        Flash.create('success', 'Created');
        $scope.selectedCompaniesArea = [];
        $scope.resetForm();
      } else {
        Flash.create('success', 'Saved')
      }
      console.log('sampleee');
      console.log(response.data);
    })
  };

});
// =======
// app.config(function($stateProvider){
//   $stateProvider.state('businessManagement.warehouse.contract', {
//     url: "/contract",
//     templateUrl: '/static/ngTemplates/app.warehouse.contract.html',
//     controller: 'businessManagement.warehouse.contract'
//   });
// });
//
// app.controller("businessManagement.warehouse.contract.quote", function($scope, $state, $users, $stateParams, $http, Flash,  $uibModalInstance , quoteData,) {
//   $scope.quote = quoteData;
//   $scope.firstQuote = false;
//   $scope.types  = crmRelationTypes;
//   $scope.total = $scope.quote.value;
//   $scope.data = $scope.quote.data;
//
//   $scope.resetForm = function() {
//     $scope.form = {type : 'onetime' , quantity : 0 , tax : 0 , rate : 0 , desc : '' , productMeta : ''};
//   }
//   $scope.searchTaxCode = function(c) {
//     return $http.get('/api/clientRelationships/productMeta/?description__contains='+c).
//     then(function(response) {
//       return response.data;
//     })
//   }
//   $scope.$watch('form.productMeta' , function(newValue , oldValue) {
//     if (typeof newValue == 'object') {
//       $scope.showTaxCodeDetails = true;
//     }else {
//       $scope.showTaxCodeDetails = false;
//     }
//   })
//   $scope.setType = function(typ) {
//     $scope.form.type = typ;
//   }
//   $scope.cancel = function(e) {
//     $uibModalInstance.dismiss();
//   };
//   $scope.remove = function(idx) {
//     $scope.data.splice(idx , 1);
//   }
//   $scope.edit = function(idx) {
//     var d = $scope.data[idx];
//     $scope.form = {type : d.type , quantity : d.quantity , tax : d.tax , rate : d.rate , desc : d.desc};
//     $http({method : 'GET' , url : '/api/clientRelationships/productMeta/?code='+d.taxCode}).
//     then(function(response) {
//       $scope.form.productMeta = response.data[0];
//     })
//     $scope.data.splice(idx , 1);
//   }
//   $scope.calculateTotal = function() {
//     var total = 0;
//     var totalTax = 0;
//     var grandTotal = 0;
//     for (var i = 0; i < $scope.data.length; i++) {
//       $scope.data[i].total = parseInt($scope.data[i].quantity) * parseInt($scope.data[i].rate);
//       $scope.data[i].totalTax = $scope.data[i].total * parseInt($scope.data[i].tax)/100;
//       $scope.data[i].subtotal = $scope.data[i].totalTax + $scope.data[i].total;
//       total += $scope.data[i].total;
//       totalTax += $scope.data[i].totalTax;
//       grandTotal += $scope.data[i].subtotal;
//     }
//
//     $scope.totalTax = totalTax;
//     $scope.total = total;
//     $scope.grandTotal = grandTotal;
//     $scope.quote.calculated = {value : total , tax : totalTax , grand : grandTotal}
//
//   }
//
//   $scope.add = function() {
//     console.log('entered');
//     if ($scope.form.tax>70) {
//       Flash.create('warning' , 'The tax rate is unrealistic');
//       return;
//     }
//     $scope.data.push({type : $scope.form.type , tax: $scope.form.productMeta.taxRate , desc : $scope.form.desc , rate : $scope.form.rate , quantity : $scope.form.quantity, taxCode : $scope.form.productMeta.code})
//     $scope.resetForm();
//   }
//   $scope.resetForm();
//   $scope.$watch('data' , function(newValue , oldValue) {
//     $scope.calculateTotal();
//   }, true)
//
// });
// app.controller("businessManagement.warehouse.contract.explore", function($scope, $state, $users, $stateParams, $http, Flash, $sce, $aside, $timeout, $uibModal) {
//   $scope.contract = $scope.tab.data;
//   console.log('invoice');
//   $scope.fetchInvoice = function() {
//     $scope.contract.invoice=[];
//     $http({method : 'GET' , url : '/api/warehouse/invoice/'}).
//     then(function(response){
//       for (var i=0;  i<response.data.length; i++){
//         if(response.data[i].contract==$scope.contract.pk){
//           response.data[i].data = JSON.parse(response.data[i].data );
//           $scope.contract.invoice.push(response.data[i]);
//         }
//       }
//     })
//   }
//   $scope.fetchInvoice();
//   console.log($scope.contract);
//   console.log($scope.contract.invoice);
//
//   $scope.contactSearch = function() {
//     return $http.get( '/api/warehouse/contact/').
//     then(function(response){
//       $scope.contract.contact=response.data;
//     })
//   };
//   $scope.contactSearch();
//
//   $scope.editQuote = function(idx) {
//     if (typeof idx == 'number') {
//       $scope.quoteInEditor = $scope.contract.invoice[idx];
//     }else {
//       $scope.quoteInEditor = {data : [] , value : 0 , doc : null , status : 'quoted'  , details: '' , pk : null}
//     }
//     console.log('in quote');
//     $aside.open({
//       templateUrl : '/static/ngTemplates/app.warehouse.quote.form.html',
//       placement: 'right',
//       size: 'xl',
//       resolve: {
//         quoteData : function() {
//           return $scope.quoteInEditor;
//         },
//       },
//       controller : 'businessManagement.warehouse.contract.quote'
//     }).result.then(function () {
//
//     }, function () {
//       console.log('submitting');
//       console.log($scope.contract.pk);
//       console.log($scope.contract);
//       var method;
//       var url = '/api/warehouse/invoice/'
//       if ($scope.quoteInEditor.pk == null) {
//         method = 'POST'
//       }else {
//         method = 'PATCH'
//         url += $scope.quoteInEditor.pk +'/'
//       }
//
//       if ($scope.quoteInEditor.data.length == 0) {
//         return;
//       }
//       var dataToSend = {contract : $scope.contract.pk , data : JSON.stringify($scope.quoteInEditor.data) , value : $scope.quoteInEditor.calculated.value , status : $scope.quoteInEditor.status };
//       console.log($scope.quoteInEditor);
//       console.log(dataToSend);
//       console.log(url);
//       console.log(method);
//       $http({method : method , url : url , data : dataToSend}).
//       then(function(response) {
//         response.data.data = JSON.parse(response.data.data );
//         if ($scope.contract.invoice.length == 0) {
//           $scope.contract.invoice.push(response.data);
//         }else {
//           for (var i = 0; i < $scope.contract.invoice.length; i++) {
//             if ($scope.contract.invoice[i].pk == response.data.pk) {
//               $scope.contract.invoice[i] = response.data;
//             }else {
//               $scope.contract.invoice.push(response.data);
//             }
//           }
//         }
//         $scope.fetchInvoice();
//       })
//       // $scope.fetchInvoice();
//       console.log($scope.quoteData);
//     });
//
//   }
//
//   $scope.changeStatus = function(status , indx) {
//     $scope.contract.invoice[indx].status = status;
//
//     if (status == 'billed') {
//       $uibModal.open({
//         template: '<div style="padding:30px;"><div class="form-group"><label>Due Date</label>'+
//             '<div class="input-group" >'+
//                 '<input type="text" class="form-control" show-weeks="false" uib-datepicker-popup="dd-MMMM-yyyy" ng-model="contract.dueDate" is-open="status.opened" />' +
//                 '<span class="input-group-btn">'+
//                   '<button type="button" class="btn btn-default" ng-click="status.opened = true;"><i class="glyphicon glyphicon-calendar"></i></button>'+
//                 '</span>'+
//               '</div><p class="help-block">Auto set based on Deal due period.</p>'+
//           '</div></div>',
//         size: 'sm',
//         backdrop : true,
//         resolve : {
//           contract : function() {
//             return $scope.contract.invoice[indx];
//           },
//           deal : function() {
//             return $scope.deal;
//           }
//         },
//         controller: function($scope , contract, deal){
//           $scope.contract = contract;
//           var dueDate = new Date();
//           dueDate.setDate(dueDate.getDate() + deal.duePeriod);
//           if ($scope.contract.dueDate == null) {
//             $scope.contract.dueDate = dueDate;
//           }
//           $scope.deal = deal;
//         },
//       }).result.then(function () {
//
//       }, (function(indx, status) {
//         return function () {
//           console.log(indx);
//           console.log($scope.contract.invoice[indx].dueDate);
//
//           $http({method : 'PATCH' , url : '/api/warehouse/invoice/' + $scope.contract.invoice[indx].pk + '/' , data : {status : status , dueDate : $scope.contract.invoice[indx].dueDate.toISOString().substring(0, 10) }}).
//           then(function(response) {
//             $http({method : 'GET' , url : '/api/clientRelationships/downloadInvoice/?saveOnly=1&contract=' + response.data.pk}).
//             then(function(response) {
//               Flash.create('success' , 'Saved')
//             }, function(err) {
//               Flash.create('danger' , 'Error occured')
//             })
//           })
//
//
//
//         }
//       })(indx, status));
//
//
//
//     }else if (status == 'dueElapsed') {
//
//       var sacCode = 998311;
//       var c = $scope.contract.invoice[indx];
//       for (var i = 0; i < c.data.length; i++) {
//         if (c.data[i].taxCode == sacCode) {
//           return;
//         }
//       }
//
//       var fineAmount = $scope.contract.invoice[indx].value * $scope.deal.duePenalty*(1/100)
//
//       $http({method : 'GET' , url : '/api/clientRelationships/productMeta/?code='+ sacCode}).
//       then((function(indx) {
//         return function(response) {
//           var quoteInEditor = $scope.contract.invoice[indx]
//           var productMeta = response.data[0];
//           var subTotal = fineAmount*(1+productMeta.taxRate/100)
//           quoteInEditor.data.push({currency : $scope.deal.currency , type : 'onetime' , tax: productMeta.taxRate, desc : 'Late payment processing charges' , rate : fineAmount , quantity : 1, taxCode : productMeta.code , totalTax : fineAmount*(productMeta.taxRate/100), subtotal : subTotal })
//
//           quoteInEditor.value += subTotal
//           var url = '/api/warehouse/invoice/' + quoteInEditor.pk + '/'
//           var method = 'PATCH'
//           var dataToSend = {deal : $scope.deal.pk , data : JSON.stringify(quoteInEditor.data) , value : quoteInEditor.value};
//           $http({method : method , url : url , data : dataToSend}).
//           then(function(response) {
//             $http({method : 'GET' , url : '/api/clientRelationships/downloadInvoice/?saveOnly=1&contract=' + response.data.pk}).
//             then(function(response) {
//               Flash.create('success' , 'Saved')
//             }, function(err) {
//               Flash.create('error' , 'Error occured')
//             })
//           })
//         }
//       })(indx))
//
//
//     }else {
//
//       $http({method : 'PATCH' , url : '/api/warehouse/invoice/' + $scope.contract.invoice[indx].pk + '/' , data : {status : status}}).
//       then(function(response) {
//
//       })
//
//     }
//
//
//   }
//
// });
//
// app.controller("businessManagement.warehouse.contract.item", function($scope, $state, $users, $stateParams, $http, Flash) {
//
//
// });
//
// app.controller('businessManagement.warehouse.contract', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
//   $scope.data = {
//     tableData: []
//   };
//
//   views = [{
//     name: 'list',
//     icon: 'fa-th-large',
//     template: '/static/ngTemplates/genericTable/genericSearchList.html',
//     itemTemplate: '/static/ngTemplates/app.warehouse.contract.item.html',
//   }, ];
//
//
//   $scope.config = {
//     views: views,
//     url: '/api/warehouse/contract/',
//     searchField: 'name',
//     deletable: true,
//     itemsNumPerView: [16, 32, 48],
//   }
//
//
//   $scope.tableAction = function(target, action, mode) {
//     console.log(target, action, mode);
//     console.log($scope.data.tableData);
//
//     for (var i = 0; i < $scope.data.tableData.length; i++) {
//       if ($scope.data.tableData[i].pk == parseInt(target)) {
//         if (action == 'edit') {
//           var title = 'Edit contract : ';
//           var appType = 'contractEditor';
//         } else if (action == 'details') {
//           var title = 'Contract Details : ';
//           var appType = 'contractExplorer';
//         }
//         console.log("sampleee");
//         console.log($scope.data.tableData[i]);
//         $scope.addTab({
//           title: title + $scope.data.tableData[i].pk,
//           cancel: true,
//           app: appType,
//           // data: {
//           //   pk: target,
//           //   index: i,
//           //   contract : $scope.data.tableData[i]
//           // },
//           data:$scope.data.tableData[i],
//           active: true
//         })
//       }
//     }
//
//   }
//
//
//   $scope.tabs = [];
//   $scope.searchTabActive = true;
//
//   $scope.closeTab = function(index) {
//     $scope.tabs.splice(index, 1)
//   }
//
//   $scope.addTab = function(input) {
//     console.log(JSON.stringify(input));
//     $scope.searchTabActive = false;
//     alreadyOpen = false;
//     for (var i = 0; i < $scope.tabs.length; i++) {
//       if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
//         $scope.tabs[i].active = true;
//         alreadyOpen = true;
//       } else {
//         $scope.tabs[i].active = false;
//       }
//     }
//     if (!alreadyOpen) {
//       $scope.tabs.push(input)
//     }
//   }
// });
//
//
// app.controller("businessManagement.warehouse.contract.form", function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions, $timeout) {
//
//   $scope.getRandomColor = function() {
//     var letters = '0123456789ABCDEF';
//     var color = '#';
//     for (var i = 0; i < 6; i++) {
//       color += letters[Math.floor(Math.random() * 16)];
//     }
//     return color;
//   }
//
//   $scope.initializeCanvas = function() {
//
//
//
//
//     console.log("canvas" + $scope.id);
//     var canvas = document.getElementById("canvas" + $scope.id);
//
//     canvas.removeEventListener('click', function() {
//
//     });
//
//
//     c = canvas.getContext("2d");
//     console.log(c);
//     boxSize = 40;
//     boxes = Math.floor(1200 / boxSize);
//     $scope.arr = [];
//     $scope.arrays=[ ];
//     $scope.selectedCompaniesArea = [ ];
//     $scope.selectingAreas = [ ];
//     $scope.selectingColour = $scope.getRandomColor();
//     if (typeof $scope.contract.areas == 'object') {
//       console.log($scope.contract.areas.contractSpace.length);
//       for (var i = 0; i < $scope.contract.areas.contractSpace.length; i++) {
//         console.log('pushing');
//         console.log(i);
//         $scope.arrays.push({'array':[ ]})
//       }
//       console.log($scope.arrays);
//
//     }
//     var w = (canvas.width / boxSize);
//     var h = (canvas.height / boxSize);
//     drawBox();
//     // canvas.addEventListener('click', handleClick);
//     // canvas.addEventListener('mousemove', handleClick);
//     // var value = 0;
//     function drawBox() {
//       c.beginPath();
//       c.fillStyle = "#87CEFA";
//       c.lineWidth = 1;
//       c.strokeStyle = '#eeeeee';
//       for (var row = 0; row < boxes; row++) {
//         for (var column = 0; column < boxes; column++) {
//           var x = row * boxSize;
//           var y = column * boxSize;
//           c.rect(x, y, boxSize, boxSize);
//           c.fill();
//           c.stroke();
//         }
//       }
//
//     }
//
//     var state = new Array(h);
//     for (var y = 0; y < h; ++y) {
//       state[y] = new Array(w);
//     }
//
//     canvas.addEventListener('click', handleClick);
//
//     function fill(s, gx, gy) {
//       c.fillStyle = s;
//       c.fillRect(gx * boxSize, gy * boxSize, boxSize, boxSize);
//     }
//     if ($scope.spaceData) {
//       console.log('entered');
//       $scope.arr = JSON.parse($scope.contract.areas.areas);
//       for (var i = 0; i < $scope.arr.length; i++) {
//         var gx=$scope.arr[i].row
//         var gy=$scope.arr[i].col
//         state[gy][gx] = true;
//         fill('white', gx , gy );
//       }
//       if ($scope.contract.occupancy.length > 0) {
//         if ($scope.contract.areas.pk==$scope.areasData) {
//           $scope.selectingAreas = $scope.contract.occupancy
//           if (typeof $scope.selectingAreas == 'string') {
//             $scope.selectingAreas = JSON.parse($scope.selectingAreas)
//           }
//         }else {
//             $scope.selectingAreas = [];
//         }
//       }
//       console.log($scope.selectingAreas);
//       for (var i = 0; i < $scope.contract.areas.contractSpace.length; i++) {
//         console.log('infoooooooo');
//         console.log($scope.contract.areas.contractSpace.length);
//         console.log($scope.arrays.length);
//         $scope.arrays[i].array = $scope.contract.areas.contractSpace[i];
//         if (typeof $scope.arrays[i].array.occupancy == 'string'){
//           $scope.arrays[i].array.occupancy=JSON.parse($scope.arrays[i].array.occupancy)
//         }
//         console.log($scope.selectingAreas,'.....');
//         console.log($scope.arrays[i].array.occupancy);
//       }
//       for (var i = 0; i < $scope.arrays.length; i++) {
//         if (JSON.stringify($scope.arrays[i].array.occupancy) == JSON.stringify($scope.selectingAreas)) {
//           console.log('equallllll');
//           $scope.arrays.splice(i,1);
//         }
//       }
//       for (var i = 0; i < $scope.arrays.length; i++) {
//         $scope.selectedContractColour = $scope.getRandomColor();
//         $scope.selectedCompaniesArea.push({color: $scope.selectedContractColour,company:$scope.arrays[i].array.company.name})
//         for (var j = 0; j < $scope.arrays[i].array.occupancy.length; j++) {
//           var gx=$scope.arrays[i].array.occupancy[j].row
//           var gy=$scope.arrays[i].array.occupancy[j].col
//           state[gy][gx] = true;
//           fill($scope.selectedContractColour, gx , gy );
//           // console.log(gx,gy,'values');
//         }
//         console.log($scope.selectedContractColour);
//
//       }
//       // for (var i = 0; i < $scope.selectingAreas.length; i++) {
//       //   $scope.selectedContractColour = $scope.selectingColour;
//       //   $scope.selectedCompaniesArea.push({color: $scope.selectedContractColour,company:$scope.contract.company.name})
//       //   for (var j = 0; j < $scope.arrays[i].array.occupancy.length; j++) {
//       //     var gx=$scope.arrays[i].array.occupancy[j].row
//       //     var gy=$scope.arrays[i].array.occupancy[j].col
//       //     state[gy][gx] = true;
//       //     fill($scope.selectedContractColour, gx , gy );
//       //     // console.log(gx,gy,'values');
//       //   }
//       //   console.log($scope.selectedContractColour);
//       //
//       // }
//       if ($scope.selectingAreas.length > 0) {
//         $scope.selectedContractColour = $scope.selectingColour;
//         $scope.selectedCompaniesArea.push({color: $scope.selectedContractColour,company:$scope.contract.company.name})
//         for (var i = 0; i < $scope.selectingAreas.length; i++) {
//           var gx=$scope.selectingAreas[i].row
//           var gy=$scope.selectingAreas[i].col
//           state[gy][gx] = true;
//           fill($scope.selectedContractColour, gx , gy );
//           // console.log(gx,gy,'values');
//         }
//       }
//       // if (true) {
//       //
//       // }
//       // if ($scope.contract.occupancy.length >0){
//       //   if ($scope.contract.areas.pk==$scope.areasData) {
//       //     $scope.array = JSON.parse($scope.contract.occupancy);
//       //   }else {
//       //     $scope.array = [];
//       //   }
//       // }
//       console.log($scope.arrays,'remaining');
//       console.log($scope.selectingAreas,'selecting arraysssssssssssssss');
//     }
//     // for (var i = 0; i < $scope.arr.length; i++) {
//     //   var gx=$scope.arr[i].row
//     //   var gy=$scope.arr[i].col
//     //   state[gy][gx] = true;
//     //   fill('white', gx , gy );
//     // }
//     // for (var i = 0; i < $scope.array.length; i++) {
//     //   var gx=$scope.array[i].row
//     //   var gy=$scope.array[i].col
//     //   state[gy][gx] = true;
//     //   fill('green', gx , gy );
//     // }
//     // $scope.selectingArea = [ ];
//
//     function handleClick(e) {
//       console.log('333',$scope.arrays);
//       $scope.clicked = true;
//       // get mouse click position
//       e.preventDefault()
//       var mx = e.offsetX;
//       var my = e.offsetY;
//       // calculate grid square numbers
//       var gx = ~~(mx / boxSize);
//       var gy = ~~(my / boxSize);
//       // console.log(gx,gy);
//       // make sure we're in bounds
//       if (gx < 0 || gx >= w || gy < 0 || gy >= h) {
//         return;
//       }
//       state[gy][gx] = true;
//       for (var i = 0; i < $scope.arr.length; i++) {
//         if ($scope.arr[i].row == gx && $scope.arr[i].col == gy) {
//           console.log('data',gx,gy);
//           for (var j = 0; j < $scope.arrays.length; j++) {
//             for (var k = 0; k < $scope.arrays[j].array.occupancy.length; k++) {
//               if($scope.arrays[j].array.occupancy[k].row==gx && $scope.arrays[j].array.occupancy[k].col==gy){
//                 console.log('arrays there');
//                 return
//               }
//               // $scope.selectedArea.push($scope.arrays[j].array.occupancy[k]);
//             }
//             // if($scope.array[j].row==gx && $scope.array[j].col==gy){
//             //   console.log('there');
//             //   $scope.array.splice(j,1);
//             //   console.log('after splice');
//             //   console.log($scope.array);
//             //   fill('white', gx, gy);
//             //   return;
//             // }
//           }
//           console.log('0000000000000');
//           for (var j = 0; j < $scope.selectingAreas.length; j++) {
//             console.log('aaaaaaaaaaaaaaaaaaaaa');
//             if ($scope.selectingAreas[j].row == gx && $scope.selectingAreas[j].col == gy) {
//               console.log('selecting');
//               $scope.selectingAreas.splice(j,1);
//               fill('white', gx, gy);
//               return
//             }
//           }
//           console.log('not there');
//           state[gy][gx] = true;
//           fill($scope.selectingColour, gx, gy);
//           $scope.selectingAreas.push({
//             row: gx,
//             col: gy
//           });
//
//
//           // console.log('66666666666',$scope.selectedArea);
//           // state[gy][gx] = true;
//           //
//           // fill('green', gx, gy);
//           // for (var j = 0; j < $scope.array.length; j++) {
//           //   if ($scope.array[j].row == gx  &&  $scope.array[j].col == gy) {
//           //     return;
//           //   }
//           // }
//           // $scope.array.push({
//           //   row: gx,
//           //   col: gy
//           // });
//         }
//
//       }
//       console.log($scope.selectingAreas);
//       $scope.canvasData = canvas;
//       $scope.dataURL = $scope.canvasData.toDataURL();
//
//     }
//
//
//
//   }
//
//
//   // $scope.contract = {company : '' , rate : 0 , dueDays : 0 ,quantity : 0 ,contractPaper : emptyFile ,billingFrequency : 0 ,billingDates : '' ,unitType : 'sqft' ,otherDocs : emptyFile ,occupancy: '',areas:'' }
//   $scope.resetForm=function(){
//     $scope.contract = {company : '' , rate : 0 , dueDays : 0 ,quantity : 0 ,contractPaper : emptyFile ,billingFrequency : 0 ,billingDates : '' ,unitType : 'sqrt' ,otherDocs : emptyFile ,occupancy: '' ,areas:'' ,occupancy_screenshort:''}
//   }
//   $scope.dates=[]
//   for (var i = 1; i < 29; i++) {
//     $scope.dates.push(i.toString());
//   }
//   $scope.addDate=function(date){
//     $scope.contract.billingDates +=$scope.contract.billingDates == ''? date : ','+date;
//   }
//   if ($scope.tab == undefined || $scope.tab.data == undefined) {
//     $scope.mode = 'new';
//     $scope.resetForm();
//     console.log('in new');
//   }else {
//     $scope.mode = 'edit';
//     $scope.contract = $scope.tab.data
//     $scope.areasData=$scope.contract.areas.pk
//     console.log('edited form');
//   }
//
//   if ($scope.mode == 'new') {
//     $scope.id = '0';
//   }else{
//     $scope.id = $scope.contract.pk;
//   }
//
//   // $timeout(function() {
//   //   $scope.initializeCanvas();
//   // }, 1000)
//
//
//
//   $scope.serviceSearch = function(query) {
//     return $http.get( '/api/warehouse/service/?name__contains=' + query).
//     then(function(response){
//       return response.data;
//     })
//   };
//   $scope.spaceSearch = function(query) {
//     return $http.get( '/api/warehouse/space/?name__contains=' + query).
//     then(function(response){
//       return response.data;
//     })
//   };
//
//   $scope.$watch('contract.areas' , function(newValue , oldValue) {
//     console.log('cecking',newValue.pk);
//     // if (newValue.pk==$scope.tab.data.areas.pk) {
//     //   $scope.sameData=true;
//     //
//     // }
//     if (typeof newValue == 'object') {
//       $scope.spaceData = true;
//       $timeout(function() {
//         $scope.initializeCanvas();
//       }, 1000)
//
//     }else {
//       $scope.spaceData = false;
//     }
//   })
//
//
//
//
//   $scope.save= function(){
//     console.log('entered');
//     if ($scope.clicked) {
//       console.log($scope.dataURL);
//       console.log($scope.dataURL.length);
//       $scope.contract.occupancy_screenshort = $scope.dataURL;
//     }
//     var f = $scope.contract;
//     console.log($scope.selectingAreas);
//     if (f.company.length == 0) {
//       Flash.create('warning' , 'Company can not be blank');
//       return;
//     }else if (typeof f.company != "object") {
//       Flash.create('warning' , "Company doesn't exist!");
//       return;
//     }
//
//     if (f.areas.length != 0) {
//       if (typeof f.areas != 'object') {
//         Flash.create('warning',"No Such Space Available");
//         return;
//       }else {
//         if ($scope.selectingAreas.length == 0) {
//           Flash.create('warning',"Please Select Some Area");
//           return;
//         }
//       }
//     }else {
//       Flash.create('warning',"Space Can't be Null");
//       return;
//     }
//
//     var url = '/api/warehouse/contract/';
//     if ($scope.mode == 'new'){
//       var method = 'POST';
//     }else {
//       var method = 'PATCH';
//       url += $scope.tab.data.pk +'/';    // $scope.tab.data.service.pk +'/';
//     }
//
//     var tosend = new FormData();
//     if (f.contractPaper != emptyFile && f.contractPaper != null) {
//       tosend.append('contractPaper' , f.contractPaper)
//     }
//     if (f.otherDocs != emptyFile && f.otherDocs != null) {
//       tosend.append('otherDocs' , f.otherDocs)
//     }
//     if (f.billingFrequency != f.billingDates.split(',').length){
//       Flash.create('warning' , 'BillingDates count Should Be Equal To BillingFrequency ');
//       return;
//     }
//     tosend.append('company' , f.company.pk);
//     tosend.append('billingFrequency' , f.billingFrequency);
//     tosend.append('billingDates' , f.billingDates);
//     tosend.append('rate' , f.rate);
//     tosend.append('quantity' , f.quantity);
//     tosend.append('unitType' , f.unitType);
//     tosend.append('dueDays' , f.dueDays);
//     tosend.append('areas' , f.areas.pk);
//     tosend.append('occupancy' , JSON.stringify($scope.selectingAreas));
//     tosend.append('occupancy_screenshort' , f.occupancy_screenshort);
//     console.log(tosend);
//
//     $http({
//       method: method,
//       url: url,
//       data: tosend,
//       transformRequest: angular.identity,
//       headers: {
//         'Content-Type': undefined
//       }
//     }).
//     then(function(response) {
//       if ($scope.mode == 'new') {
//         $scope.contract.pk = response.data.pk;
//         Flash.create('success', 'Created');
//         $scope.selectedCompaniesArea = [ ];
//         $scope.resetForm();
//       }else{
//         Flash.create('success', 'Saved')
//       }
//       console.log('sampleee');
//       console.log(response.data);
//     })
//   };
//
// });
// >>>>>>> 20c361fdeb1f8a000ef15776e239c2834a00463c
