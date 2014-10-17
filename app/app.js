// Dependencies
require('angular/angular');
require('angular-cookies/angular-cookies');
require('angular-resource/angular-resource');
require('angular-route/angular-route');
require('angular-sanitize/angular-sanitize');
// var Modernizr = require('foundation/js/vendor/modernizr');
jQuery = require('foundation/js/vendor/jquery');
$ = jQuery;
require('nestable/jquery.nestable');
require('foundation/js/vendor/fastclick');
require('foundation/js/vendor/placeholder');
require('foundation/js/foundation');

// Create Angular App
var app = angular.module('ept', [
  'ngRoute',
  'ngCookies',
  'ngResource',
  'ngSanitize'
]);

// Register Controllers
app.controller('HeaderCtrl', require('./controllers/header'));
app.controller('MainCtrl', require('./controllers/main.js'));
app.controller('BoardsCtrl', require('./controllers/boards.js'));
app.controller('BoardCtrl', require('./controllers/board.js'));
app.controller('NewThreadCtrl', require('./controllers/newThread.js'));
app.controller('PostsCtrl', require('./controllers/posts.js'));
app.controller('ProfileCtrl', require('./controllers/profile.js'));
app.controller('RegistrationCtrl', require('./controllers/registration.js'));
app.controller('CategoriesCtrl', require('./controllers/categories.js'));

// add epochtalk-editor directive
app.directive('epochtalkEditor', require('./directives/editor/editor.js'));
app.directive('pagination', require('./directives/pagination'));
app.directive('categoryEditor', require('./directives/category_editor'));
app.directive('nestableBoards', require('./directives/category_editor/nestable-boards.js'));
app.directive('nestableCategories', require('./directives/category_editor/nestable-categories.js'));

// Set Angular Configs
app.config(require('./config'))
.run(['$rootScope', 'BreadcrumbSvc', function($rootScope, BreadcrumbSvc) {

  $rootScope.$on('$viewContentLoaded', function() {
    $(document).foundation();
  });

  // Dynamically populate breadcrumbs
  $rootScope.$on('$routeChangeSuccess', function() {
    BreadcrumbSvc.update();
  });

}]);


// CSS Styles
require('./css/normalize.css');
require('./css/foundation.css');
require('./css/epochtalk.css');
require('./css/category-editor.css');
require('./css/editor.css');
require('./css/medium-editor.css');
require('./css/default.css');
var cssify = require('cssify');
cssify.byUrl('//netdna.bootstrapcdn.com/font-awesome/4.2.0/css/font-awesome.css');
