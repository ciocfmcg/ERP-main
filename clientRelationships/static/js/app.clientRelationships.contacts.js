app.controller("businessManagement.clientRelationships.contacts", function($scope , $state , $users ,  $stateParams , $http , Flash) {

  $scope.data = {tableData : []};

  views = [{name : 'list' , icon : 'fa-th-large' ,
      template : '/static/ngTemplates/genericTable/genericSearchList.html' ,
      itemTemplate : '/static/ngTemplates/app.clientRelationships.contacts.item.html',
    },
  ];

  var options = {
    main : {icon : 'fa-pencil', text: 'edit'} ,
    };

  $scope.config = {
    views : views,
    url : '/api/clientRelationships/contact/',
    searchField: 'name',
    deletable : true,
    itemsNumPerView : [16,32,48],
  }


  $scope.tableAction = function(target , action , mode){
    console.log(target , action , mode);
    console.log($scope.data.tableData);

    if (action == 'edit') {
      for (var i = 0; i < $scope.data.tableData.length; i++) {
        if ($scope.data.tableData[i].pk == parseInt(target)){
          $scope.addTab({title : 'Edit Contact : ' + $scope.data.tableData[i].name , cancel : true , app : 'contactEditor' , data : {pk : target, index : i} , active : true})
        }
      }
    }

  }


  $scope.tabs = [];
  $scope.searchTabActive = true;

  $scope.closeTab = function(index){
    $scope.tabs.splice(index , 1)
  }

  $scope.addTab = function( input ){
    console.log(JSON.stringify(input));
    $scope.searchTabActive = false;
    alreadyOpen = false;
    for (var i = 0; i < $scope.tabs.length; i++) {
      if ($scope.tabs[i].data.pk == input.data.pk && $scope.tabs[i].app == input.app) {
        $scope.tabs[i].active = true;
        alreadyOpen = true;
      }else{
        $scope.tabs[i].active = false;
      }
    }
    if (!alreadyOpen) {
      $scope.tabs.push(input)
    }
  }

  // $scope.addTab({"title":"Edit Contact : first","cancel":true,"app":"contactEditor","data":{"pk":1,"index":0},"active":true})



})

app.controller("businessManagement.clientRelationships.contacts.item", function($scope , $state , $users ,  $stateParams , $http , Flash) {




});


app.controller("businessManagement.clientRelationships.contacts.form", function($scope , $state , $users ,  $stateParams , $http , Flash) {

  if (typeof $scope.tab != 'undefined') {
    $scope.form = $scope.data.tableData[$scope.tab.data.index]
    $scope.mode = 'edit';
  }else {
    $scope.mode = 'new';
    $scope.form = {company : undefined , name : '' , email : '' , mobile : '' , mobileSecondary: '' , emailSecondary : '' , designation : '' , notes : '' , linkedin : '' , facebook: '' , dp : emptyFile , male : true}
  }


  $scope.companyAdvanceOptions = false;
  $scope.showCreateCompanyBtn = false;
  $scope.companyExist = false;
  $scope.showCompanyForm = false;

  $scope.me = $users.get('mySelf');

  $scope.companySearch = function(query) {
    return $http.get('/api/ERP/service/?name__contains=' + query).
    then(function(response){
      return response.data;
    })
  };

  $scope.$watch('form.company' , function(newValue , oldValue) {
    console.log(newValue);
    if (typeof newValue == "string" && newValue.length >0) {
      $scope.showCreateCompanyBtn = true;
      $scope.companyExist = false;
      $scope.showCompanyForm = false;
    }else if (typeof newValue == "object") {
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
      Flash.create('warning' , "Company's basic details missing")
      return
    }

    if ($scope.form.company.address != null && typeof $scope.form.company.address == 'object') {
      var method = 'POST';
      var url = '/api/ERP/address/'
      if (typeof $scope.form.company.address.pk == 'number') {
        method = 'PATCH'
        url += $scope.form.company.address.pk +'/'
      }
      $http({method : method , url : url, data: $scope.form.company.address }).
      then(function(response) {
        $scope.form.company.address = response.data;
        var dataToSend = $scope.form.company;
        dataToSend.address = response.data.pk;

        $http({method : 'PATCH' , url : '/api/ERP/service/'+ $scope.form.company.pk + '/' , data : dataToSend}).
        then(function(response) {
          $scope.form.company = response.data;
          Flash.create('success' , 'Saved');
        });
      })
    }else{

      var dataToSend = $scope.form.company;

      $http({method : 'PATCH' , url : '/api/ERP/service/'+ $scope.form.company.pk + '/' , data : dataToSend}).
      then(function(response) {
        $scope.form.company = response.data;
        Flash.create('success' , 'Saved');
      });

    }



  }

  $scope.createCompany = function() {
    if($scope.companyExist){
      $scope.showCompanyForm = true;
      $scope.showCreateCompanyBtn = false;
      return
    }

    if (typeof $scope.form.company == "string" && $scope.form.company.length >1) {
      var dataToSend = {
        name : $scope.form.company,
        user: $scope.me.pk
      }
      $http({method: 'POST' , url: '/api/ERP/service/' , data : dataToSend}).
      then(function(response) {
        $scope.form.company = response.data;
        Flash.create('success' , 'Created');
      })
    }else {
      Flash.create('warning' , 'Company name too small')
    }
  }

  $scope.createContact = function() {
    var url = '/api/clientRelationships/contact/';
    var method = 'POST'

    if ($scope.mode == 'edit') {
      url += $scope.form.pk + '/';
      method = 'PATCH'
    }

    var fd = new FormData();
    fd.append('name', $scope.form.name);
    fd.append('male', $scope.form.male);

    if ($scope.form.company != null && typeof $scope.form.company == 'object') {
      fd.append( 'company' , $scope.form.company.pk);
    }

    if ($scope.form.email != '' && $scope.form.email != null) {
      fd.append('email', $scope.form.email);
    }

    if ($scope.form.mobile != '' && $scope.form.mobile != null) {
      fd.append('mobile', $scope.form.mobile);
    }

    if ($scope.form.emailSecondary != '' && $scope.form.emailSecondary != null) {
      fd.append('emailSecondary', $scope.form.emailSecondary);
    }

    if ($scope.form.facebook != '' && $scope.form.facebook != null) {
      fd.append('facebook', $scope.form.facebook);
    }

    if ($scope.form.linkedin != '' && $scope.form.linkedin != null) {
      fd.append('linkedin', $scope.form.linkedin);
    }

    if ($scope.form.notes != '' && $scope.form.notes != null) {
      fd.append('notes', $scope.form.notes);
    }

    if ($scope.form.designation != '' && $scope.form.designation != null) {
      fd.append('designation', $scope.form.designation);
    }

    if ($scope.form.mobileSecondary != '' && $scope.form.mobileSecondary != null) {
      fd.append('mobileSecondary', $scope.form.mobileSecondary);
    }

    if ($scope.form.dp != emptyFile && $scope.form.dp != null && typeof $scope.form.dp != 'string'){
      fd.append('dp' , $scope.form.dp)
    }

    $http({method : method , url : url , data : fd , transformRequest: angular.identity, headers: {'Content-Type': undefined}}).
    then(function(response) {
      $scope.form = response.data;
      Flash.create('success' , 'Saved')
    })



  }

})
