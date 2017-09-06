app.controller("businessManagement.clientRelationships.opportunities.list", function($scope, $state, $users, $stateParams, $http, Flash) {

  console.log("loded");
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

});

app.controller("businessManagement.clientRelationships.opportunities.form", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.mode = 'new';

  $scope.wizardClicked = function(indx) {
    console.log(indx);
  }

  $scope.activeWizardTab = 3;
  var steps = [
    {indx: 1 , text : 'contacted'},
    {indx: 2 , text : 'demo'},
    {indx: 3 , text : 'requirements'},
    {indx: 4 , text : 'proposal'},
    {indx: 5 , text : 'negotiation'},
    {indx: 6 , text : 'won'},
  ];

  var relationTypes  = ['onetime' , 'request' , 'days' , 'hours' , 'monthly' , 'yearly']

  $scope.data = {steps : steps ,relationTypes: relationTypes}

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
