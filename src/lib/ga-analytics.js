/**
 * Created by cenkce on 1/25/16.
 */

angular.module('cenkce.utils').service('cenkce.ga', GAnalytics);

GAnalytics.$inject = ['$window'];

function GAnalytics($window) {
    var _ga = $window.ga;

    this.page = function (page) {
        _ga('send', {
            hitType: 'pageview',
            page: page
        });
    };

    this.event = function (category, action, label) {
        _ga('send', {
            hitType: 'event',
            eventCategory: category,
            eventAction: action,
            eventLabel: label
        });
    };
};
