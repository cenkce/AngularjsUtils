/**
 * Created by cenkce on 1/25/16.
 */


angular.module('cenkce.utils').service('utils.sharer', Sharer);
Sharer.$inject = ['$q'];

function Sharer($q) {
    var _promise =  $q;
    this.fbfeed = function(caption, description, pic, link){
        var defer = _promise.defer();

        FB.ui({
            method: 'feed',
            link: link,
            picture:pic,
            description:description,
            caption: caption,
        }, function(response){
            defer.resolve(response);
        }, function(response){
            defer.reject(response);
        });

        return defer.promise;
    };

    this.fbshare = function(link){
        var defer = _promise.defer();

        FB.ui({
            method: 'share',
            href: link
        }, function(response){
            defer.resolve(response);
        }, function(response){
            defer.reject(response);
        });

        return defer.promise;
    };

    this.twshare = function(desc, link){
        var url = "http://twitter.com/home?status="+desc+" "+link;
        var openwin = window.open(url, '', 'height=600,width=800,resizable=true,scrollbars=yes,toolbar=no,menubar=no,location=no');

        if (window.focus) {
            openwin.focus();
        }
    };
};
