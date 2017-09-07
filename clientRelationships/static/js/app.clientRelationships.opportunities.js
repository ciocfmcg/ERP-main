var crmSteps = [
  {indx: 1 , text : 'contacted'},
  {indx: 2 , text : 'demo'},
  {indx: 3 , text : 'requirements'},
  {indx: 4 , text : 'proposal'},
  {indx: 5 , text : 'negotiation'},
  {indx: 6 , text : 'won'},
];

var crmRelationTypes  = ['onetime' , 'request' , 'days' , 'hours' , 'monthly' , 'yearly']

app.controller("businessManagement.clientRelationships.opportunities.explore", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.disableNext = false;
  $scope.pageNo = 0;

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

  $scope.local = {activeTab : 0};
  $scope.changeTab = function(index) {
    for (var i = 0; i < $scope.tabs.length; i++) {
      $scope.tabs[i].active = false;
    }
    $scope.tabs[index].active = true;
    $scope.local.activeTab = index;
  }
  $scope.changeTab(0);

  $scope.resetEventScheduler = function() {
    $scope.eventScheduler = {internalUsers : [] , when : new Date()  , details : '' , otherCRMUsers : [] , venue : ''}
  }

  $scope.resetEventScheduler();


  $scope.cleanCalendarEntry = function(data) {
    var cleaned = []
    for (var j = 0; j < data.clients.length; j++) {
      if (data.clients[j].pk != $scope.contact.pk) {
        cleaned.push(data.clients[j]);
      }
    }
    data.clients = cleaned;
    return data;
  }

  $scope.fetchCalendarEnteries = function() {
    $http({method : 'GET' , url : '/api/PIM/calendar/?originator=CRM&clients__in=[' + $scope.contact.pk+ ']'}).
    then(function(response) {
      for (var i = 0; i < response.data.length; i++) {
        response.data[i] = $scope.cleanCalendarEntry(response.data[i]);
      }

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

  $scope.data = {steps : crmSteps ,relationTypes: crmRelationTypes}

  $scope.fetchDeal = function() {

    $http({method : 'GET' , url : '/api/clientRelationships/deal/' + $scope.tab.data.pk + '/'}).
    then(function(response) {
      $scope.deal = response.data;
      for (var i = 0; i < $scope.data.steps.length; i++) {
        if ($scope.data.steps[i].text == response.data.state) {
          $scope.deal.state = i;
          break;
        }
      }
    });

  }

  $scope.fetchDeal();



});

app.controller("businessManagement.clientRelationships.opportunities.list", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.columns = [
    {icon : 'fa-pencil-square-o' , text : 'Created' , cat : 'created'},
    {icon : 'fa-phone' , text : 'Contacted' ,cat : 'contacted'},
    {icon : 'fa-desktop' , text : 'Demo' , cat : 'demo'},
    {icon : 'fa-bars' , text : 'Requirements' , cat : 'requirements'},
    {icon : 'fa-file-pdf-o' , text : 'Proposal' , cat : 'proposal'},
    {icon : 'fa-money' , text : 'Negotiation' , cat : 'negotiation'},
  ]

  $scope.searchText = '';
  $scope.companySearch= false;
  $scope.resetSearch = function() {
    $scope.searchText = '';
    $scope.fetchDeals();
  }

  $scope.fetchDeals = function() {
    var url = '/api/clientRelationships/deal/';
    if ($scope.companySearch && $scope.searchText!= '') {
      url += '?company__contains=' +$scope.searchText
    }else if (!$scope.companySearch && $scope.searchText!= '') {
      url += '?name__contains=' +$scope.searchText
    }

    $http({method : 'GET' , url : url}).
    then(function(response) {
      $scope.deals = response.data;
      $scope.data = {created : [] , contacted : [] , demo : [] , requirements : [] , proposal : [] , negotiation : []}
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


  $scope.addTab({"title":"Details :old name 3","cancel":true,"app":"exploreDeal","data":{"pk":3},"active":true})

});

app.controller("businessManagement.clientRelationships.opportunities.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.mode = 'new';

  $scope.wizardClicked = function(indx) {
    console.log(indx);
  }

  $scope.activeWizardTab = 3;

  $scope.data = {steps : crmSteps ,relationTypes: crmRelationTypes}

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
