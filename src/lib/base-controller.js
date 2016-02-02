/**
 * Created by cenkce on 1/8/16.
 */


angular.module('cenkce.utils').factory('utils.baseController', BaseController);

BaseController.$inject = ['$scope'];

/**
 * Base controller class.
 * @param $scope
 * @param $route
 * @constructor
 */
function BaseController($scope) {
    var page = [];
    var unbinds = [];

    //Auto unbinds event hadlers when scope is destroyed
    $scope.$on('$destroy', function () {
        for(var u in unbinds){
            unbinds[u].call();
        }
    });

    this.$on = function (scope, event, handler) {
        unbinds.push(scope.$on(event, handler));
    };

    this.$watch = function (scope, event, handler) {
        unbinds.push(scope.$watch(event, handler));
    };
};
