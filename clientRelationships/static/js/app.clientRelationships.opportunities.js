
var crmSteps = [
  {indx: 1 , text : 'contacted', display : 'Contacting'},
  {indx: 2 , text : 'demo', display : 'Demo / POC'},
  {indx: 3 , text : 'requirements', display : 'Requirements Hunt'},
  {indx: 4 , text : 'proposal', display : 'Proposal'},
  {indx: 5 , text : 'negotiation', display : 'Negotiation'},
  {indx: 6 , text : 'conclusion', display : 'Won / Lost'},
];

var crmRelationTypes  = ['onetime' , 'request' , 'day' , 'hour' , 'monthly' , 'yearly', 'user']

app.controller("businessManagement.clientRelationships.opportunities.quote", function($scope, $state, $users, $stateParams, $http, Flash,  $uibModalInstance , deal) {


  $scope.searchTaxCode = function(c) {
    return $http.get('/api/clientRelationships/productMeta/?description__contains='+c).
    then(function(response) {
      return response.data;
    })
  }

  $scope.firstQuote = true;

  $scope.deal = deal;
  $scope.data = [];

  console.log($scope.deal);

  $scope.$watch('form.productMeta' , function(newValue , oldValue) {
    if (typeof newValue == 'object') {
      $scope.showTaxCodeDetails = true;
    }else {
      $scope.showTaxCodeDetails = false;
    }
  })

  if ($scope.deal.contracts.length >0) {
    $http({method : 'GET' , url : '/api/clientRelationships/contract/' + $scope.deal.contracts[0] +'/'}).
    then(function(response) {
      $scope.data = JSON.parse(response.data.data);
    });
  }

  $scope.types  = crmRelationTypes;
  $scope.currency = ['inr' , 'usd']

  $scope.resetForm = function() {
    $scope.form = { currency : $scope.deal.currency , type : 'onetime' , quantity : 0 , tax : 0 , rate : 0 , desc : ''};
  }

  $scope.setCurrency = function(cur) {
    $scope.form.currency = cur;
  }

  $scope.setType = function(typ) {
    $scope.form.type = typ;
  }
  $scope.cancel = function(e) {
    $uibModalInstance.dismiss();
  };

  $scope.remove = function(idx) {
    $scope.data.splice(idx , 1);
  }

  $scope.edit = function(idx) {
    var d = $scope.data[idx];
    $scope.form = { currency : d.currency , type : d.type , quantity : d.quantity , tax : d.tax , rate : d.rate , desc : d.desc};
    $scope.data.splice(idx , 1);
  }

  $scope.calculateTotal = function() {
    var total = 0;
    var totalTax = 0;
    var grandTotal = 0;
    for (var i = 0; i < $scope.data.length; i++) {
      $scope.data[i].total = parseInt($scope.data[i].quantity) * parseInt($scope.data[i].rate);
      $scope.data[i].totalTax = $scope.data[i].total * parseInt($scope.data[i].tax)/100;
      $scope.data[i].subtotal = $scope.data[i].totalTax + $scope.data[i].total;
      total += $scope.data[i].total;
      totalTax += $scope.data[i].totalTax;
      grandTotal += $scope.data[i].subtotal;
    }

    $scope.totalTax = totalTax;
    $scope.total = total;
    $scope.grandTotal = grandTotal;

    $scope.deal.calculated = {value : total , tax : totalTax , grand : grandTotal}

  }

  $scope.add = function() {
    if ($scope.form.tax>70) {
      Flash.create('warning' , 'The tax rate is unrealistic');
      return;
    }
    $scope.data.push({currency : $scope.form.currency , type : $scope.form.type , tax: $scope.form.productMeta.taxRate , desc : $scope.form.desc , rate : $scope.form.rate , quantity : $scope.form.quantity, taxCode : $scope.form.productMeta.code})
    $scope.resetForm();
  }

  $scope.resetForm();

  $scope.$watch('data' , function(newValue , oldValue) {
    $scope.calculateTotal();

    var url = '/api/clientRelationships/contract/'
    var method = 'POST';
    if ($scope.deal.contracts.length >0) {
      method = 'PATCH';
      url += $scope.deal.contracts[0] +'/'
    }

    var dataToSend = {data : JSON.stringify($scope.data) , value : parseInt($scope.grandTotal) };
    if (method == 'POST') {
      dataToSend.deal = $scope.deal.pk;
    }

    $http({method : method , url : url , data : dataToSend }).
    then(function(response) {
      if ($scope.deal.contracts.length ==0) {
        $scope.deal.contracts.push(response.data.pk);
      }
      // $scope.deal.contracts[0].data =   JSON.parse($scope.deal.contracts[0].data);
    })

  }, true)

});

app.controller("businessManagement.clientRelationships.opportunities.created", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.clientRelationships.deal.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/clientRelationships/deal/',
    searchField: 'name',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
    drills : [
      {icon : 'fa fa-bars' , name : 'Limit search' , btnClass : 'default' , options : [
        {key : 'created', value : true},
        {key : 'won', value : false},
        {key : 'lost', value : false},
      ]},
      {icon : 'fa fa-home' , name : 'another search' , btnClass : 'default' , options : [
        {key : 'adarsh', value : true},
      ]}
    ]
  }


  $scope.tableAction = function(target, action, mode) {

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'exploreDeal') {
          $scope.$emit('exploreDeal', {
            deal: $scope.data.tableData[i]
          });
        }
      }
    }

  }

});


app.controller("businessManagement.clientRelationships.opportunities.explore", function($scope, $state, $users, $stateParams, $http, Flash, $uibModal, $timeout, $rootScope, $aside) {

  $scope.disableNext = false;
  $scope.pageNo = 0;
  $scope.sms = {text : '' , include : [] , selectAll : false , preventUnselect : false}

  $scope.$watch('sms.selectAll' , function(newValue , oldValue) {
    if ($scope.sms.preventUnselect && !newValue) {
      $scope.sms.preventUnselect = false;
      return;
    }
    for (var i = 0; i < $scope.sms.include.length; i++) {
      $scope.sms.include[i] = newValue;
    }
    if (newValue) {
      $scope.sms.preventUnselect = false;
    }
  })

  $scope.$watch('sms.include' , function(newValue , oldValue) {
    for (var i = 0; i < $scope.sms.include.length; i++) {
      if ($scope.sms.include[i] == false) {
        $scope.sms.selectAll = false;
        $scope.sms.preventUnselect = true;
        return;
      }
    }
    $scope.sms.selectAll = true;
  }, true)

  $scope.sendSMS = function() {
    if ($scope.sms.text == '') {
      Flash.create('danger' , 'No text to send');
      return;
    }
    for (var i = 0; i < $scope.deal.contacts.length; i++) {
      if ($scope.deal.contacts[i].mobile != null && $scope.deal.contacts[i].mobile != undefined && $scope.sms.include[i]) {
        var cleanedNumber = $scope.deal.contacts[i].mobile;

        var numb = cleanedNumber.match(/\d/g);
        cleanedNumber = numb = numb.join("");

        if (cleanedNumber.length == 11 && cleanedNumber[0] == '0') {
          clientRelationships = clientRelationships.substring(1,11)
        }else if (cleanedNumber.substring(0, 2) == '91') {
          clientRelationships = clientRelationships.substring(2)
        }

        $http({method : 'POST' , url : '/api/ERP/sendSMS/' , data : {text : $scope.sms.text , number : cleanedNumber }}).
        then(function(response) {
          $scope.sms.text = '';
          Flash.create('success' , 'Sent');
        });
      }
    }
  }

  $scope.editDeal = function() {
    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.clientRelationships.editDeal.form.html',
      size: 'lg',
      backdrop : true,
      resolve : {
        deal : function() {
          return $scope.deal;
        }
      },
      controller: function($scope , deal){
        $scope.deal = deal;

        $timeout(function () {
            $scope.deal.probability += 0.1;
        }, 1000);
        $scope.setCurrency = function(curr) {
          $scope.deal.currency = curr;
        }

      },
    }).result.then(function () {

    }, function () {
      var deal = $scope.deal;
      var dataToSend = {name : deal.name , probability : deal.probability , requirements : deal.requirements , closeDate : deal.closeDate , currency : deal.currency , value : deal.value}

      var crmUsers = []
      for (var i = 0; i < deal.contacts.length; i++) {
        crmUsers.push(deal.contacts[i].pk)
      }

      if (crmUsers.length!= 0) {
        dataToSend.contacts = crmUsers;
      }else {
        Flash.create('warning' , 'At least one contact is required');
        return;
      }

      if (deal.internalUsers.length != 0) {
        dataToSend.internalUsers = deal.internalUsers;
      }

      $http({method : 'PATCH' , url : '/api/clientRelationships/deal/'+ $scope.deal.pk + '/' , data : dataToSend}).
      then(function(response) {
        $rootScope.$broadcast('dealUpdated', {
          deal: response.data
        });
      });

    });
  }

  $scope.cloneDeal = function() {
    $rootScope.$broadcast('cloneDeal', {
      deal: $scope.deal
    });
  }


  $scope.sortedFeeds = [{
      type: 'note'
    },
    {
      type: 'call'
    },
    {
      type: 'meeting'
    },
    {
      type: 'mail'
    },
    {
      type: 'todo'
    },
  ]

  $scope.noteEditor = {
    text: '',
    doc: emptyFile
  };

  $scope.concludeDeal = function(state) {
    $http({method : 'PATCH' , url : '/api/clientRelationships/deal/' + $scope.deal.pk + '/' , data : {result : state}}).
    then(function(response) {
      $scope.processDealResponse(response.data);
      $rootScope.$broadcast('dealUpdated', {
        deal: response.data
      });

    })
  }


  $scope.saveActivityLog = function() {
    var dataToSend = {
      when: $scope.logger.when,
      deal: $scope.deal.pk
    };
    var internals = []
    for (var i = 0; i < $scope.logger.internalUsers.length; i++) {
      $scope.logger.internalUsers[i]
      internals.push($scope.logger.internalUsers[i]);
    }

    if (internals.length != 0) {
      dataToSend.internalUsers = internals;
    }

    var externals = []
    for (var i = 0; i < $scope.logger.withinCRMUsers.length; i++) {
      externals.push($scope.logger.withinCRMUsers[i].pk);
    }

    if (externals.length != 0) {
      dataToSend.contacts = externals;
    }
    var activityData;
    if ($scope.logger.activityType == 'Email') {
      dataToSend.typ = 'mail';
      if ($scope.logger.subject.length == 0) {
        Flash.create('warning', 'Subject can not be left blank');
        return;
      }
      activityData = {
        subject: $scope.logger.subject
      };
    } else if ($scope.logger.activityType == 'Meeting') {
      dataToSend.typ = 'meeting';
      activityData = {
        duration: $scope.logger.duration,
        location: $scope.logger.location
      };
    } else if ($scope.logger.activityType == 'Call') {
      dataToSend.typ = 'call';
      activityData = {
        duration: $scope.logger.duration
      }
    }
    dataToSend.data = JSON.stringify(activityData);

    if ($scope.logger.comment != '') {
      dataToSend.notes = $scope.logger.comment;
    }

    $http({
      method: 'POST',
      url: '/api/clientRelationships/activity/',
      data: dataToSend
    }).
    then(function(response) {
      $scope.timelineItems.unshift(response.data);
      $scope.resetLogger();
      Flash.create('success', 'Saved');
    }, function(err) {
      Flash.create('danger', 'Error');
    })

  }

  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css : '/static/css/bootstrap.min.css',
    inline: false,
    plugins : 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme : 'modern',
    height : 300,
    toolbar : 'undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
    setup: function (editor ) {
      // editor.addButton();
    },
  };

  $scope.quote = function() {
    console.log("will create a quote");
    $aside.open({
      templateUrl : '/static/ngTemplates/app.clientRelationships.quote.form.html',
      placement: 'right',
      size: 'xl',
      resolve: {
        deal : function() {
          return $scope.deal;
        },
      },
      controller : 'businessManagement.clientRelationships.opportunities.quote'
    })
  }

  $scope.tabs = [{
      name: 'Timeline',
      active: true,
      icon: 'th-large'
    },
    {
      name: 'Activity',
      active: false,
      icon: 'plus'
    },
    {
      name: 'Email',
      active: false,
      icon: 'envelope-o'
    },
    {
      name: 'Call / SMS',
      active: false,
      icon: 'phone'
    },
    {
      name: 'Task',
      active: false,
      icon: 'check-circle-o'
    },
    {
      name: 'Schedule',
      active: false,
      icon: 'clock-o'
    },
  ]

  $scope.resetTaskEditor = function() {
    var dummyDate = new Date()
    $scope.taskEditor = { otherCRMUsers : [] , details : ''};
    $scope.taskEditor.when = new Date(dummyDate.getFullYear()
                           ,dummyDate.getMonth()
                           ,dummyDate.getDate()
                           ,23,59,59); // 2013-07-30 23:59:59
  }

  $scope.resetTaskEditor();

  $scope.resetLogger = function() {
    $scope.logger = {when : new Date() , where : '' , subject : '' , duration : 10 , comment: '', internalUsers : [], withinCRMUsers : [] , location: '', withinCRM : '', activityType: 'Email'};
  }

  $scope.resetLogger();

  $scope.local = {activeTab : 0 , minInfo :false};

  if ($.cookie("minInfo") == undefined) {
    $scope.local.minInfo = false;
  }else {
    $scope.local.minInfo = $.cookie("minInfo");
  }

  $scope.resetEventScheduler = function() {
    $scope.eventScheduler = {internalUsers : [] , when : new Date()  , details : '' , otherCRMUsers : [] , venue : ''}
  }

  $scope.saveEvent = function() {

    if ($scope.eventScheduler.details.length == 0) {
      Flash.create('warning', 'Details can not be empty')
    }

    var crmUsers = [];
    for (var i = 0; i < $scope.eventScheduler.otherCRMUsers.length; i++) {
      crmUsers.push($scope.eventScheduler.otherCRMUsers[i].pk);
    }

    var internalUsers = [];
    for (var i = 0; i < $scope.eventScheduler.internalUsers.length; i++) {
      internalUsers.push($scope.eventScheduler.internalUsers[i]);
    }

    var dataToSend = {
      when: $scope.eventScheduler.when,
      text: $scope.eventScheduler.details,
      eventType: 'Meeting',
      originator: 'CRM',
      venue: $scope.eventScheduler.venue,
      data : JSON.stringify({deal : $scope.deal.pk})
    }

    if (crmUsers.length != 0) {
      dataToSend.clients = crmUsers;
    }

    if (internalUsers.length != 0) {
      dataToSend.followers = internalUsers;
    }

    $http({
      method: 'POST',
      url: '/api/PIM/calendar/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      // $scope.calendar.unshift($scope.cleanCalendarEntry(response.data));
      $scope.fetchCalendarEnteries();
      $scope.resetEventScheduler();
    });
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

  $scope.resetEventScheduler();

  $scope.toggleInfoLevel = function() {
    $scope.local.minInfo = !$scope.local.minInfo;
    $.cookie("minInfo" , $scope.local.minInfo);
  }

  $scope.fetchCalendarEnteries = function() {
    $http({method : 'GET' , url : '/api/PIM/calendar/?originator=CRM&data__contains=' + JSON.stringify({deal : $scope.deal.pk}) }).
    then(function(response) {

      $scope.calendar = response.data;


      for (var i = 0; i < $scope.calendar.length; i++) {
        $scope.calendar[i].when = new Date($scope.calendar[i].when);
        $scope.calendar[i].newDate = false;
        if (i < $scope.calendar.length-1) {
          if ($scope.calendar[i].when.toDateString() != new Date($scope.calendar[i+1].when).toDateString() ) {
            $scope.calendar[i].newDate = true;
            if ($scope.calendar[i].when.toDateString() == new Date().toDateString()) {
              $scope.calendar[i].today = true;
            }
          }
        }
      }
    })
  }

  $scope.moveToNextStage = function() {
    var state = crmSteps[$scope.deal.state+1].text;
    $http({method : 'PATCH' , url : '/api/clientRelationships/deal/' + $scope.deal.pk +'/' , data : {state : state} }).
    then(function(response) {
      $scope.deal.state += 1;
      $rootScope.$broadcast('dealUpdated', {
        deal: response.data
      });
    })
  }

  $scope.exploreContact = function(c) {
    $scope.$emit('exploreContact', {
      contact: c
    });
  }

  $scope.nextPage = function() {
    if ($scope.disableNext) {
      return;
    }
    $scope.pageNo +=1;
    $scope.retriveTimeline();
  }

  $scope.prevPage = function() {
    if ($scope.pageNo == 0) {
      return;
    }
    $scope.pageNo -=1;
    $scope.retriveTimeline();
  }

  $scope.timelineItems = [];

  $scope.saveTask = function() {
    if ($scope.taskEditor.details.length == 0) {
      Flash.create('warning', 'Details can not be empty')
    }

    var crmUsers = [];
    for (var i = 0; i < $scope.taskEditor.otherCRMUsers.length; i++) {
      crmUsers.push($scope.taskEditor.otherCRMUsers[i].pk);
    }

    var dataToSend = {
      when: $scope.taskEditor.when,
      text: $scope.taskEditor.details,
      eventType: 'Reminder',
      originator: 'CRM',
      data : JSON.stringify({deal : $scope.deal.pk})
    }
    if (crmUsers.length != 0) {
      dataToSend.clients = crmUsers;
    }

    $http({
      method: 'POST',
      url: '/api/PIM/calendar/',
      data: dataToSend
    }).
    then(function(response) {
      Flash.create('success', 'Saved');
      // $scope.calendar.unshift($scope.cleanCalendarEntry(response.data));
      $scope.fetchCalendarEnteries();
      $scope.resetTaskEditor();
    });
  }


  $scope.retriveTimeline = function() {
    $http({
      method: 'GET',
      url: '/api/clientRelationships/activity/?deal=' + $scope.deal.pk+'&limit=5&offset=' + $scope.pageNo*5
    }).
    then(function(response) {
      $scope.timelineItems = response.data.results;
      if ($scope.timelineItems.length == 0 && $scope.pageNo != 0) {
        $scope.prevPage();
      }
      $scope.disableNext = response.data.next == null;
      $scope.analyzeTimeline();
    })
  }

  $scope.analyzeTimeline = function() {
    for (var i = 0; i < $scope.timelineItems.length; i++) {
      $scope.timelineItems[i].created = new Date($scope.timelineItems[i].created);
      if (i < $scope.timelineItems.length - 1 && $scope.timelineItems[i].created.getMonth() != new Date($scope.timelineItems[i + 1].created).getMonth()) {
        $scope.timelineItems[i + 1].newMonth = true;
      }
    }
  }

  $scope.data = {steps : crmSteps}

  $scope.processDealResponse = function(data) {
    $scope.deal = data;
    // console.log(data);
    for (var i = 0; i < $scope.data.steps.length; i++) {
      if ($scope.data.steps[i].text == data.state) {
        $scope.deal.state = i;
        break;
      }
    }
    if (typeof $scope.deal.state == 'string') {
      if ($scope.deal.state == 'created') {
        $scope.deal.state = -1;
      }else {
        $scope.deal.state = 0;
      }
    }
    if ($scope.deal.result == 'won' && $scope.deal.state == 5) {
      $scope.deal.state += 1;
    }

    $scope.retriveTimeline();
    $scope.fetchCalendarEnteries();

    for (var i = 0; i < $scope.deal.contacts.length; i++) {
      $scope.sms.include.push(false)
    }


  }

  $scope.fetchDeal = function() {

    $http({method : 'GET' , url : '/api/clientRelationships/deal/' + $scope.tab.data.pk + '/'}).
    then(function(response) {
      $scope.processDealResponse(response.data);
    });

  }

  $scope.fetchDeal();

  $scope.saveNote = function() {

    var fd = new FormData();
    fd.append('typ', 'note');
    fd.append('data', $scope.noteEditor.text);
    fd.append('deal', $scope.deal.pk);

    if ($scope.noteEditor.doc != emptyFile) {
      fd.append('doc', $scope.noteEditor.doc);
    }

    $http({
      method: 'POST',
      url: '/api/clientRelationships/activity/',
      data: fd,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      $scope.timelineItems.unshift(response.data);
      Flash.create('success', 'Saved');
      $scope.noteEditor.text = '';
      $scope.noteEditor.doc = emptyFile;
    })
  }


});

app.controller("businessManagement.clientRelationships.opportunities.list", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.columns = [
    // {icon : 'fa-pencil-square-o' , text : 'Created' , cat : 'created'},
    {icon : 'fa-phone' , text : 'Contacting' ,cat : 'contacted'},
    {icon : 'fa-desktop' , text : 'Demo / POC' , cat : 'demo'},
    {icon : 'fa-bars' , text : 'Requirements' , cat : 'requirements'},
    {icon : 'fa-file-pdf-o' , text : 'Proposal' , cat : 'proposal'},
    {icon : 'fa-money' , text : 'Negotiation' , cat : 'negotiation'},
    {icon : 'fa-check' , text : 'Conclusion' , cat : 'conclusion'},
  ]

  $scope.searchText = '';
  $scope.companySearch= false;
  $scope.resetSearch = function() {
    $scope.searchText = '';
    $scope.fetchDeals();
  }

  $scope.fetchDeals = function() {
    var url = '/api/clientRelationships/deal/?';
    if ($scope.companySearch && $scope.searchText!= '') {
      url += 'company__contains=' +$scope.searchText
    }else if (!$scope.companySearch && $scope.searchText!= '') {
      url += 'name__contains=' +$scope.searchText
    }
    url += '&created=false&board';

    $http({method : 'GET' , url : url}).
    then(function(response) {
      $scope.deals = response.data;
      $scope.data = { contacted : [] , demo : [] , requirements : [] , proposal : [] , negotiation : [] , conclusion : []}
      console.log(response.data);
      for (var i = 0; i < response.data.length; i++) {
        $scope.data[response.data[i].state].push(response.data[i])
      }
    });
  }

  $scope.fetchDeals();
  $scope.isDragging = false;
  $scope.removeFromData = function(pk) {
    for (var key in $scope.data) {
      if ($scope.data.hasOwnProperty(key)) {
        for (var i = 0; i < $scope.data[key].length; i++) {
          if ($scope.data[key][i].pk ==pk) {
            $scope.data[key].splice(i,1);
            return;
          }
        }
      }
    }
  }

  $scope.exploreDeal = function(deal , evt) {
    if ($scope.isDragging) {
      $scope.isDragging = false;
    }else {
      $scope.$emit('exploreDeal', {
        deal: deal
      });
    }
  }

  $scope.$on('draggable:start', function (data) {
    $scope.isDragging=true;
  });

  $scope.$on('dealUpdated', function (evt, data) {
    console.log(data);
    $scope.removeFromData(data.deal.pk);
    $scope.data[data.deal.state].push(data.deal);
  });

  $scope.onDropComplete = function(data , evt , newState) {
    if (data == null) {
      return;
    }
    $scope.removeFromData(data.pk);
    $scope.data[$scope.columns[newState].cat].push(data);

    var dataToSend = {state : $scope.columns[newState].cat}

    $http({method : 'PATCH' , url : '/api/clientRelationships/deal/' + data.pk + '/' , data : dataToSend}).
    then(function(Response) {
    }, function(err) {
      Flash.create('danger' , 'Error while updating')
    });
    console.log("drop complete");
  }


});


app.controller("businessManagement.clientRelationships.opportunities", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.tabs = [];
  $scope.searchTabActive = true;
  $scope.createTabActive = false;

  $scope.$on('cloneDeal', function(event, input) {
    $scope.createTabActive = true;
  });

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

  $scope.$on('editContact', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.addTab({
      "title": "Edit :" + input.contact.name,
      "cancel": true,
      "app": "contactEditor",
      "data": {
        "pk": input.contact.pk,
        contact : input.contact
      },
      "active": true
    })
  });

  $scope.$on('showContactsForm', function(event, input) {
    $scope.addTab({
      title: 'Create contact / company entry',
      cancel: true,
      app: 'contactForm',
      data: {
        pk: -1,
      },
      active: true
    })
  });

  $scope.$on('exploreDeal', function(event, input) {
    $scope.addTab({
      "title": "Details :" + input.deal.name,
      "cancel": true,
      "app": "exploreDeal",
      "data": {
        "pk": input.deal.pk
      },
      "active": true
    })
  });

  $scope.$on('exploreContact', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.addTab({
      "title": "Details :" + input.contact.name,
      "cancel": true,
      "app": "contactExplorer",
      "data": {
        "pk": input.contact.pk
      },
      "active": true
    })
  });

  $scope.tinymceOptions = {
    selector: 'textarea',
    content_css : '/static/css/bootstrap.min.css',
    inline: false,
    plugins : 'advlist autolink link image lists charmap preview imagetools paste table insertdatetime code searchreplace ',
    skin: 'lightgray',
    theme : 'modern',
    height : 300,
    toolbar : 'undo redo | bullist numlist | alignleft aligncenter alignright alignjustify | outdent  indent blockquote | bold italic underline | image link',
    setup: function (editor ) {
      // editor.addButton();
    },
  };


  // $scope.addTab({"title":"Details :Blandit insolens pri ad","cancel":true,"app":"exploreDeal","data":{"pk":5},"active":true})

});

app.controller("businessManagement.clientRelationships.opportunities.form", function($scope, $state, $users, $stateParams, $http, Flash , $timeout , $rootScope) {

  $scope.mode = 'new';

  $scope.$on('cloneDeal', function(event, input) {
    $scope.resetDealEditor();
    console.log("will clone");
    $http({method : 'GET' , url : '/api/clientRelationships/deal/' + input.deal.pk}).
    then(function(response) {
      $scope.dealEditor = response.data;
      $scope.dealEditor.otherCRMUsers = response.data.contacts;
      $scope.dealEditor.state= -1;
      $scope.dealEditor.name += ' (Cloned)'
    })



  });

  $scope.wizardClicked = function(indx) {
    console.log(indx);
  }

  $scope.activeWizardTab = 3;

  $scope.data = {steps : crmSteps }

  $scope.resetDealEditor = function() {
    var dummyDate = new Date();
    $scope.mode = 'new';
    var onlyDate = new Date(dummyDate.getFullYear()
                           ,dummyDate.getMonth()
                           ,dummyDate.getDate()
                           ,23,59,59); // 2013-07-30 23:59:59

    $scope.dealEditor = {otherCRMUsers : [] , internalUsers : [] , name : '' , currency : 'INR' , probability: 0 , state: -1 , closeDate: onlyDate , value : 0 , relation : 'onetime' , company : ''}
  }

  $scope.$watch('dealEditor.otherCRMUsers' , function(newValue , oldValue) {
    if ($scope.dealEditor.otherCRMUsers.length == 1) {
      $http({method : 'GET' , url : '/api/ERP/service/' + $scope.dealEditor.otherCRMUsers[0].company + '/'}).
      then(function(response) {
        $scope.dealEditor.company = response.data;
      });
    }
  }, true);

  $scope.setRelation = function(rl) {
    $scope.dealEditor.relation = rl;
  }

  $scope.saveDeal = function() {
    var d = $scope.dealEditor;
    console.log(d);
    if (d.company == '' || typeof d.company != 'object' || d.company == null) {
      Flash.create('warning' , 'Company can not be blank');
      return;
    }
    if (d.name.length == 0) {
      Flash.create('warning' , 'Deal name can not be blank');
      return;
    }

    var stateTxt;
    if (d.state == -1) {
      stateTxt = 'created';
    }else {
      stateTxt = $scope.data.steps[d.state].text
    }
    var dataToSend = {name : d.name  , probability : d.probability , state : stateTxt , closeDate : d.closeDate , value : d.value , relation : d.relation , currency: d.currency ,company : d.company.pk}

    if (d.requirements != '') {
      dataToSend.requirements = d.requirements;
    }

    var crmUsers = []
    for (var i = 0; i < d.otherCRMUsers.length; i++) {
      crmUsers.push(d.otherCRMUsers[i].pk)
    }

    if (crmUsers.length!= 0) {
      dataToSend.contacts = crmUsers;
    }else {
      Flash.create('warning' , 'At least one contact is required');
      return;
    }

    if (d.internalUsers.length != 0) {
      dataToSend.internalUsers = d.internalUsers;
    }

    var method;
    var url = '/api/clientRelationships/deal/';
    if ($scope.mode == 'edit') {
      method = 'PATCH'
      url += $scope.deal.pk + '/'
    }else {
      method = 'POST'
    }

    $http({method : method , url : url , data : dataToSend}).
    then(function(response) {
      $scope.mode = 'edit';
      $scope.deal = response.data;
      Flash.create('success' , 'Saved');
      if (response.data.state == 'created') {
        return;
      }
      $rootScope.$broadcast('dealUpdated', {
        deal: response.data
      });
    })
  }



  $scope.setCurrency = function(curr) {
    $scope.dealEditor.currency = curr;
  }

  $scope.resetDealEditor();

  $scope.openContactForm = function() {
    $scope.$emit('showContactsForm', {});
  }

});
