app.config(function($stateProvider){
  $stateProvider.state('businessManagement.warehouse.contact', {
    url: "/contact",
    templateUrl: '/static/ngTemplates/app.warehouse.contact.html',
    controller: 'businessManagement.warehouse.contact'
  });
});

app.controller("businessManagement.warehouse.contact.explore", function($scope, $state, $users, $stateParams, $http, Flash) {
  if ($scope.data != undefined) {
    $scope.contact = $scope.data.tableData[$scope.tab.data.index]
  }
  $scope.editContact = function() {
    $scope.$emit('editContact' , {contact : $scope.contact})
  }

});

app.controller("businessManagement.warehouse.contact.item", function($scope, $state, $users, $stateParams, $http, Flash) {


});

app.controller('businessManagement.warehouse.contact', function($scope, $http, $aside, $state, Flash, $users, $filter, $permissions) {
  $scope.data = {
    tableData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.warehouse.contact.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/warehouse/contact/',
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
          var title = 'Edit Contact : ';
          var appType = 'contactEditor';
        } else if (action == 'details') {
          var title = 'Contact Details : ';
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


  $scope.$on('exploreContact', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.addTab({
      "title": "Contact Details : " + input.contact.name,
      "cancel": true,
      "app": "contactExplorer",
      "data": {
        "pk": input.contact.pk
      },
      "active": true
    })
  });


  $scope.$on('editContact', function(event, input) {
    console.log("recieved");
    console.log(input);
    $scope.addTab({
      "title": "Contact Edit : " + input.contact.name,
      "cancel": true,
      "app": "contactEditor",
      "data": {
        "pk": input.contact.pk,
        contact : input.contact
      },
      "active": true
    })
  });


});



app.controller("businessManagement.warehouse.contact.form", function($scope, $state, $users, $stateParams, $http, Flash) {
  // $scope.form = {company: undefined,name: '',email: '',mobile: '',designation: '',notes: '',}
  $scope.resetForm = function() {
    $scope.mode = 'new';
    $scope.form = {company: undefined,name: '',email: '',mobile: '',designation: '',notes: '',}
  }
  if (typeof $scope.tab != 'undefined' && $scope.tab.data.pk != -1) {
    if ($scope.tab.data.index == undefined) {
      $scope.form = $scope.tab.data.contact;
    }else {
      $scope.form = $scope.data.tableData[$scope.tab.data.index];
    }
    $scope.mode = 'edit';
  } else {
    $scope.resetForm();
  }
  $scope.companyAdvanceOptions = false;
  $scope.showCreateCompanyBtn = false;
  $scope.companyExist = false;
  $scope.showCompanyForm = false;

  // $scope.me = $users.get('mySelf');

  $scope.companySearch = function(query) {
    return $http.get('/api/warehouse/service/?name__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.$watch('form.company', function(newValue, oldValue) {
    console.log(newValue);
    if (typeof newValue == "string" && newValue.length > 0) {
      $scope.showCreateCompanyBtn = true;
      $scope.companyExist = false;
      $scope.showCompanyForm = false;
    } else if (typeof newValue == "object") {
      $scope.companyExist = true;
    } else {
      $scope.showCreateCompanyBtn = false;
      $scope.showCompanyForm = false;
    }

    if (newValue == '') {
      $scope.showCreateCompanyBtn = false;
      $scope.showCompanyForm = false;
      $scope.companyExist = false;
    }

  });

  $scope.updateCompanyDetails = function() {
    if (typeof $scope.form.company != "object") {
      Flash.create('warning', "Company's basic details missing")
      return
    }
    var dataToSend = $scope.form.company;
    $http({
      method: 'PATCH',
      url: '/api/warehouse/service/' + $scope.form.company.pk + '/',
      data: dataToSend
    }).
    then(function(response) {
      $scope.form.company = response.data;
      Flash.create('success', 'Saved');
    });
  }
  $scope.createCompany = function() {
    if ($scope.companyExist) {
      $scope.showCompanyForm = true;
      $scope.showCreateCompanyBtn = false;
      return
    }
    if (typeof $scope.form.company == "string" && $scope.form.company.length > 1) {
      var dataToSend = {
        name: $scope.form.company,
        // user: $scope.me.pk
      }
      $http({
        method: 'POST',
        url: '/api/warehouse/service/',
        data: dataToSend
      }).
      then(function(response) {
        $scope.form.company = response.data;
        Flash.create('success', 'Created');
        console.log($scope.form.company);
      })
    } else {
      Flash.create('warning', 'Company name too small')
    }
  }

  $scope.createContact = function() {
    console.log(typeof $scope.form.company);
    if ($scope.form.name == '') {
      Flash.create('warning', 'Name can not be empty!');
      return
    }
    if ($scope.form.company == undefined || typeof $scope.form.company != "object") {
      Flash.create('warning', 'Company does not exist!');
      return
    }
    var url = '/api/warehouse/contact/';
    var method = 'POST';
    if ($scope.mode == 'edit') {
      url += $scope.form.pk + '/';
      method = 'PATCH';
    }
    console.log($scope.form.name);
    console.log(method);
    var f = $scope.form;
    var fd={name : f.name ,company : f.company.pk ,};
    if ($scope.form.mobile != '' && $scope.form.mobile != null){
      fd.mobile=f.mobile;
    }
    if ($scope.form.email != '' && $scope.form.email != null){
      fd.email=f.email;
    }
    if ($scope.form.designation != '' && $scope.form.designation != null){
      fd.designation=f.designation;
    }
    if ($scope.form.notes != '' && $scope.form.notes != null){
      fd.notes=f.notes;
    }
    console.log(fd);
    console.log(typeof fd.company);
    $http({method: method,url: url,data: fd}).
    then(function(response){
      $scope.form = response.data;
      console.log('test');
      console.log($scope.form);
      console.log($scope.form.company);
      console.log(typeof $scope.form.company);
      console.log('end');
      if ($scope.mode == 'new') {
        $scope.form.pk = response.data.pk;
        $scope.mode = 'edit';
        Flash.create('success', 'Created')
      }else {
        Flash.create('success', 'Saved')
      }
    })
  }
})
