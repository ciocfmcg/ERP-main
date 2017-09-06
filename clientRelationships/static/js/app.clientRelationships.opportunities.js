app.controller("businessManagement.clientRelationships.opportunities", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.clientRelationships.opportunities.item.html',
  }, ];

  $scope.config = {
    views: views,
    url: '/api/clientRelationships/contact/',
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
          var title = 'Edit Contact :';
          var appType = 'contactEditor';
        } else if (action == 'details') {
          var title = 'Details :';
          var appType = 'contactExplorer';
        }
        $scope.addTab({
          title: title + $scope.data.tableData[i].name,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        })
      }
    }

  }


  $scope.tabs = [];
  $scope.searchTabActive = false;

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
    $scope.dealEditor = {otherCRMUsers : [] , internalUsers : [] , name : '' , currency : '' , probability: 0 , state: -1 , closeDate: new Date() , value : 0 , relation : ''}
  }

  $scope.setRelation = function(rl) {
    $scope.dealEditor.relation = rl;
  }

  $scope.saveDeal = function() {
    console.log($scope.dealEditor);
  }



  $scope.setCurrency = function(curr) {
    $scope.dealEditor.currency = curr;
  }

  $scope.resetDealEditor();

  $scope.openContactForm = function() {
    $scope.$emit('showContactsForm', {});
  }

});
