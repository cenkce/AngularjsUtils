/**
 * Created by cenkce on 1/8/16.
 */


angular.module('cenkce.utils').factory('cenkce.utils.baseController', BaseController);

BaseController.$inject = ['$scope'];

/**
 * Base controller class.
 * @param $scope
 * @param $route
 * @constructor
 */
function BaseController($scope) {
    var _unbinds = [], _that = this;

    //Auto unbinds event hadlers when scope is destroyed
    $scope.$on('$destroy', function () {
        _that.clearEventHandlers();
    });

    this.clearEventHandlers = function () {
        for(var u in _unbinds){
            _unbinds[u].call();
        }
    };

    this.unbindAll = function () {
        while(_unbinds.length > 0){
            (_unbinds.shift())();
        }
    };

    this.$on = function (scope, event, handler) {
        _unbinds.push(scope.$on(event, handler));
    };

    this.$watch = function (scope, event, handler) {
        _unbinds.push(scope.$watch(event, handler));
    };
};
