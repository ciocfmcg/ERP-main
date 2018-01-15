// you need to first configure the states for this app

app.config(function($stateProvider) {

  $stateProvider
    .state('businessManagement.clientRelationships', {
      url: "/clientRelationships",
      views: {
        "": {
          templateUrl: '/static/ngTemplates/genericAppBase.html',
        },
        "menu@businessManagement.clientRelationships": {
          templateUrl: '/static/ngTemplates/genericMenu.html',
          controller: 'controller.generic.menu',
        },
        "@businessManagement.clientRelationships": {
          templateUrl: '/static/ngTemplates/app.clientRelationships.default.html',
          controller: 'businessManagement.clientRelationships.default',
        }
      }
    })
    .state('businessManagement.clientRelationships.contacts', {
      url: "/contacts",
      templateUrl: '/static/ngTemplates/app.clientRelationships.contacts.html',
      controller: 'businessManagement.clientRelationships.contacts'
    })
    .state('businessManagement.clientRelationships.opportunities', {
      url: "/opportunities",
      templateUrl: '/static/ngTemplates/app.clientRelationships.opportunities.html',
      controller: 'businessManagement.clientRelationships.opportunities'
    })
    .state('businessManagement.clientRelationships.relationships', {
      url: "/relationships",
      templateUrl: '/static/ngTemplates/app.clientRelationships.relationships.html',
      controller: 'businessManagement.clientRelationships.relationships'
    })

});




app.controller("businessManagement.clientRelationships.default", function($scope, $state, $users, $stateParams, $http, Flash) {

  

})

app.directive('companyField', function() {
  return {
    templateUrl: '/static/ngTemplates/companyInputField.html',
    restrict: 'E',
    replace: true,
    scope: {
      data: '=',
    },
    controller: function($scope, $state, $http, Flash) {
      $scope.companySearch = function(query) {
        return $http.get('/api/ERP/service/?name__contains=' + query).
        then(function(response) {
          return response.data;
        })
      };
    },
  };
});


app.directive('clientsField', function() {
  return {
    templateUrl: '/static/ngTemplates/clientsInputField.html',
    restrict: 'E',
    replace: true,
    scope: {
      data: '=',
      url: '@',
      col: '@',
      label: '@',
      company: '='
    },
    controller: function($scope, $state, $http, Flash) {
      $scope.d = {
        user: undefined
      };
      if (typeof $scope.col != 'undefined') {
        $scope.showResults = true;
      } else {
        $scope.showResults = false;
      }
      $scope.$watch('company', function(newValue, oldValue) {
        if (typeof $scope.company == 'undefined') {
          $scope.companySearch = '';
        } else {
          $scope.companySearch = '&company=' + $scope.company;
        }
      });

      // $scope.user = undefined;
      $scope.userSearch = function(query) {
        return $http.get($scope.url + '?name__contains=' + query + $scope.companySearch).
        then(function(response) {
          return response.data;
        })
      };

      $scope.removeUser = function(index) {
        $scope.data.splice(index, 1);
      }

      $scope.addUser = function() {
        for (var i = 0; i < $scope.data.length; i++) {
          if ($scope.data[i].pk == $scope.d.user.pk) {
            Flash.create('danger', 'User already a member of this group')
            return;
          }
        }
        $scope.data.push($scope.d.user);
        $scope.d.user = undefined;
      }
    },
  };
});


app.directive('crmNote', function() {
  return {
    templateUrl: '/static/ngTemplates/app.clientRelationships.noteBubble.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      onDelete: '&',
    },
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window) {

    },
  };
});

app.directive('crmCall', function() {
  return {
    templateUrl: '/static/ngTemplates/app.clientRelationships.callBubble.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      onDelete: '&',
    },
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window, $sce) {
      $scope.data.notesHtml = $sce.trustAsHtml($scope.data.notes);
      var parsedData = JSON.parse($scope.data.data);
      $scope.data.duration = parsedData.duration;
    },
  };
});

app.directive('crmMeeting', function() {
  return {
    templateUrl: '/static/ngTemplates/app.clientRelationships.meetingBubble.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      onDelete: '&',
    },
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window, $sce) {
      $scope.data.notesHtml = $sce.trustAsHtml($scope.data.notes);
      var parsedData = JSON.parse($scope.data.data);
      $scope.data.location = parsedData.location;
      $scope.data.duration = parsedData.duration;
    },
  };
});

app.directive('crmMail', function() {
  return {
    templateUrl: '/static/ngTemplates/app.clientRelationships.emailBubble.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      onDelete: '&',
    },
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window, $sce) {
      $scope.data.subject = JSON.parse($scope.data.data).subject;
      $scope.data.notesHtml = $sce.trustAsHtml($scope.data.notes);
    },
  };
});




app.directive('crmTodo', function() {
  return {
    templateUrl: '/static/ngTemplates/app.clientRelationships.todoBubble.html',
    restrict: 'E',
    transclude: true,
    replace: true,
    scope: {
      data: '=',
      onDelete: '&',
    },
    controller: function($scope, $http, $timeout, $users, $aside, $interval, $window) {

    },
  };
});
