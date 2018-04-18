app.config(function($stateProvider) {
  $stateProvider.state('projectManagement.LMS.configure', {
    url: "/configure",
    templateUrl: '/static/ngTemplates/app.LMS.configure.html',
    controller: 'projectManagement.LMS.configure'
  });
});

app.controller("projectManagement.LMS.configure", function($scope, $state, $users, $stateParams, $http, Flash) {

  $scope.data = {
    tableData: [],
    tableBooksData: []
  };

  views = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.subject.item.html',
  }, ];

  bookViews = [{
    name: 'list',
    icon: 'fa-th-large',
    template: '/static/ngTemplates/genericTable/genericSearchList.html',
    itemTemplate: '/static/ngTemplates/app.LMS.book.item.html',
  }, ];


  $scope.config = {
    views: views,
    url: '/api/LMS/subject/',
    searchField: 'title',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }

  $scope.configBooks = {
    views: bookViews,
    url: '/api/LMS/book/',
    searchField: 'title',
    deletable: true,
    itemsNumPerView: [16, 32, 48],
  }


  $scope.tableAction = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableData);

    for (var i = 0; i < $scope.data.tableData.length; i++) {
      if ($scope.data.tableData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Subject :';
          var appType = 'subjectEditor';
        } else if (action == 'details') {
          var title = 'Details :';
          var appType = 'subjectExplorer';
        }

        $scope.subjectData = $scope.data.tableData[i]
        $scope.clickOn = 'subject'
        $http({
          method: 'GET',
          url: '/api/LMS/topic/?subject=' + $scope.subjectData.pk,
        }).
        then(function(response) {
          $scope.subjectData.topicList = response.data
        })

        console.log({
          title: title + $scope.data.tableData[i].title,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        });


        $scope.addTab({
          title: title + $scope.data.tableData[i].title,
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

  $scope.tableActionBooks = function(target, action, mode) {
    console.log(target, action, mode);
    console.log($scope.data.tableBooksData);

    for (var i = 0; i < $scope.data.tableBooksData.length; i++) {
      if ($scope.data.tableBooksData[i].pk == parseInt(target)) {
        if (action == 'edit') {
          var title = 'Edit Book :';
          var appType = 'BookEditor';
        } else if (action == 'details') {
          var title = 'Details :';
          var appType = 'BookExplorer';
          $scope.dataPK = $scope.data.tableBooksData[i].pk
        }
        $scope.booksData = $scope.data.tableBooksData[i]
        $scope.clickOn = 'book'


        console.log({
          title: title + $scope.data.tableBooksData[i].title,
          cancel: true,
          app: appType,
          data: {
            pk: target,
            index: i
          },
          active: true
        });


        $scope.addTab({
          title: title + $scope.data.tableBooksData[i].title,
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




});

app.controller("projectManagement.LMS.configure.form", function($scope, $state, $users, $stateParams, $filter, $uibModal, $http, Flash) {
  $scope.mode = 'topic';
  $scope.hideBook = 'no'
  $scope.secArr = false

  if ($scope.dataPK != undefined) {
    $http({
      method: 'GET',
      url: '/api/PIM/blog/?contentType=book&&header=' + $scope.dataPK,
    }).
    then(function(response) {
      console.log($scope.dataPK);
      if (response.data.length > 0) {
        console.log('editttttt');
        $scope.blogType = 'edit'
        $scope.blogData = response.data[0]
      } else {
        console.log('newwwwwwwwww');
        $scope.blogType = 'new'
        $scope.blogData = {}
      }
    })
  }


  $scope.resetForm = function() {
    $scope.form = {
      title: '',
      description: '',
      dp: emptyFile,
      level: 0,
      shortUrl: '',
      author: '',
      ISSN: '',
      volume: '',
      version: '',
      license: '',
      sections: []
    }
  }
  $scope.resetForm();

  $scope.addSection = function(index, position) {
    console.log('section clickeddddddddddddddddddddddd');
    console.log(index);

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMS.book.section.html',
      size: 'sm',
      backdrop: true,
      resolve: {
        bookData: function() {
          return $scope.bookDetails;
        },
      },
      controller: function($scope, bookData, $uibModalInstance) {
        console.log('bbbbbbbbb', bookData);

        $scope.Sectionform = {
          title: ''
        }
        $scope.cancelSection = function() {
          $uibModalInstance.dismiss()
        }
        $scope.saveSection = function() {
          console.log('clickedddddddddddddddddd');
          console.log($scope.Sectionform.title);
          var secData = {
            title: $scope.Sectionform.title,
            book: bookData.pk
          }
          $http({
            method: 'POST',
            url: '/api/LMS/section/',
            data: secData
          }).
          then(function(response) {
            $uibModalInstance.dismiss(response.data)

          })
        }

      },
    }).result.then(function() {

    }, function(reason) {

      if (reason != undefined) {
        if (typeof reason == 'object') {
          if (position == 'bottom') {
            $scope.form.sections.splice(index + 1, 0, reason)
          } else {
            $scope.form.sections.splice(0, 0, reason)
          }
          $scope.secArr = true
        }
      }

    });
  }
  console.log('typpppppppppp',$scope.blogType);

  $scope.blogPopup = function(bookId) {

    $uibModal.open({
      templateUrl: '/static/ngTemplates/app.LMS.book.blogForm.html',
      size: 'md',
      backdrop: true,
      resolve: {
        blogData: function() {
          return $scope.blogData;
        },
        bookId: function() {
          return bookId;
        },
      },
      controller: function($scope, blogData,bookId, $uibModalInstance) {
        console.log('bbbbbbbbb', blogData , bookId);

        if (blogData.pk) {
          $scope.blogForm = blogData
        } else {
          $scope.blogForm = {
            contentType: 'book',
            tags: [],
            shortUrl: '',
            ogimage: emptyFile,
            ogimageUrl: '',
            description: '',
            tagsCSV: '',
            section: '',
            author: ''
          }
        }
        console.log($scope.blogForm);
        $scope.cancelBlog = function() {
          $uibModalInstance.dismiss()
        }
        $scope.saveBlog = function() {
          console.log('clickedddddddddddddddddd');
          console.log($scope.blogForm);

          var tags = [];
          for (var i = 0; i < $scope.blogForm.tags.length; i++) {
            tags.push($scope.blogForm.tags[i].pk)
          }

          var fd = new FormData();

          if ($scope.blogForm.ogimage == emptyFile && ($scope.blogForm.ogimageUrl == '' || $scope.blogForm.ogimageUrl == undefined)) {
            Flash.create('danger', 'Either the OG image file OR og image url is required')
            return;
          }
          if ($scope.blogForm.shortUrl == '' || $scope.blogForm.tagsCSV == '' || $scope.blogForm.section == '' || $scope.blogForm.author == '' || $scope.blogForm.description == '') {
            Flash.create('danger', 'Please check the All SEO related fields');
            return;
          }

          if ($scope.blogForm.ogimage != emptyFile && typeof $scope.blogForm.ogimage != 'string' && $scope.blogForm.ogimage != null) {
            fd.append('ogimage', $scope.blogForm.ogimage);

          } else {
            fd.append('ogimageUrl', $scope.blogForm.ogimageUrl);
          }


          fd.append('shortUrl', $scope.blogForm.shortUrl);
          fd.append('tagsCSV', $scope.blogForm.tagsCSV);
          fd.append('section', $scope.blogForm.section);
          fd.append('author', $scope.blogForm.author);
          fd.append('description', $scope.blogForm.description);
          fd.append('header' , bookId)
          fd.append('contentType', 'book');
          fd.append('tags' , tags);

          if ($scope.blogForm.pk) {
            method = 'PATCH';
            url = '/api/PIM/blog/' + $scope.blogForm.pk + '/';
          } else {
            method = 'POST';
            url = '/api/PIM/blog/';
          }

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
            if ($scope.blogForm.pk) {
              Flash.create('success', 'Updated');
            } else {
              Flash.create('success', 'Created');
            }
            $uibModalInstance.dismiss(response.data)
          });

        }

      },
    }).result.then(function() {

    }, function(reason) {

      if (reason != undefined) {
        $scope.blogType = 'edit'
        $scope.blogData = reason
      }

    });
  }


  $scope.secMove = function(index, position) {
    console.log('clickkkkkkk', index, position);
    if ($scope.form.sections.length > 1) {
      var a = $scope.form.sections[index]
      if (position == 'up') {
        if (index > 0) {
          $scope.form.sections.splice(index, 1)
          $scope.form.sections.splice(index - 1, 0, a)
        }
      } else {
        if (index < $scope.form.sections.length - 1) {
          $scope.form.sections.splice(index, 1)
          $scope.form.sections.splice(index + 1, 0, a)
        }
      }
    }
  }
  $scope.saveSecSeq = function() {
    for (var i = 0; i < $scope.form.sections.length; i++) {
      $http({
        method: 'PATCH',
        url: '/api/LMS/section/' + $scope.form.sections[i].pk + '/',
        data: {
          sequence: i
        }
      }).
      then(function(response) {
        Flash.create('success', 'Saved');
      })
    }
  }
  $scope.subjectSearch = function(query) {
    return $http.get('/api/LMS/subject/?title__contains=' + query).
    then(function(response) {
      return response.data;
    })
  };

  $scope.bookShow = true
  $scope.subjectShow = true
  $scope.topicShow = true
  $scope.form.subject = '';
  // console.log('**********************',action,appType);
  if ($scope.clickOn != undefined) {
    console.log('***********', $scope.clickOn);
    if ($scope.clickOn == 'book') {
      $scope.form = $scope.booksData
      console.log('kkkkkkkkkkkkkkkk', $scope.form);
      $scope.form.sections = $filter('orderBy')($scope.booksData.sections, 'sequence')
      $scope.bookDetails = $scope.booksData
      $scope.mode = 'book';
      $scope.bookShow = true
      $scope.subjectShow = false
      $scope.topicShow = false
      if ($scope.form.sections.length > 0) {
        $scope.secArr = true
      }
    }
    if ($scope.clickOn == 'subject') {
      $scope.form = $scope.subjectData
      $scope.mode = 'subject';
      $scope.bookShow = false
      $scope.subjectShow = true
      $scope.topicShow = false
    }
    console.log($scope.form);
  }
  $scope.save = function() {

    var toSend = new FormData();
    var method = 'POST'
    var url = '/api/LMS/' + $scope.mode + '/'
    if ($scope.form.pk) {
      var method = 'PATCH'
      var url = '/api/LMS/' + $scope.mode + '/' + $scope.form.pk + '/'
    }
    console.log('fileeeeeeeeeeeeeee', typeof $scope.form.dp, $scope.form);
    if ($scope.form.title.length == 0) {
      Flash.create('warning', 'Title is required');
      return;
    }
    toSend.append('title', $scope.form.title)
    toSend.append('description', $scope.form.description)


    if ($scope.mode == 'subject') {
      if ($scope.form.dp != emptyFile && typeof $scope.form.dp != 'string') {
        toSend.append('dp', $scope.form.dp)
      }
      toSend.append('level', $scope.form.level)
    } else if ($scope.mode == 'book') {
      if (typeof $scope.form.subject != 'object') {
        Flash.create('warning', 'Subject is required');
        return;
      }
      toSend.append('subject', $scope.form.subject.pk)
      if ($scope.form.dp != emptyFile && typeof $scope.form.dp != 'string') {
        toSend.append('dp', $scope.form.dp)
      }
      if ($scope.form.shortUrl != null && $scope.form.shortUrl.length > 0) {
        toSend.append('shortUrl', $scope.form.shortUrl)
      }
      if ($scope.form.author != null && $scope.form.author.length > 0) {
        toSend.append('author', $scope.form.author)
      }
      if ($scope.form.ISSN != null && $scope.form.ISSN.length > 0) {
        toSend.append('ISSN', $scope.form.ISSN)
      }
      if ($scope.form.volume != null && $scope.form.volume.length > 0) {
        toSend.append('volume', $scope.form.volume)
      }
      if ($scope.form.version != null && $scope.form.version.length > 0) {
        toSend.append('version', $scope.form.version)
      }
      if ($scope.form.license != null && $scope.form.license.length > 0) {
        toSend.append('license', $scope.form.license)
      }
    } else {
      if (typeof $scope.form.subject != 'object') {
        Flash.create('warning', 'Subject is required');
        return;
      }
      toSend.append('subject', $scope.form.subject.pk)
    }

    $http({
      method: method,
      url: url,
      data: toSend,
      transformRequest: angular.identity,
      headers: {
        'Content-Type': undefined
      }
    }).
    then(function(response) {
      if ($scope.mode == 'book') {
        $scope.hideBook = 'yes'
        $scope.bookDetails = response.data
        $scope.bookDetails.sections = $filter('orderBy')($scope.bookDetails.sections, 'sequence')
        console.log('bookkkkkkkkkkkkkkkk', $scope.bookDetails);
        if ($scope.form.pk) {
          Flash.create('success', 'Book Is updated');
        } else {
          Flash.create('success', 'Book Is Created');
        }
      } else {
        if ($scope.form.pk) {
          Flash.create('success', 'updated');
        } else {
          $scope.resetForm();
          Flash.create('success', 'Saved');
        }
      }

    })

  }



});
