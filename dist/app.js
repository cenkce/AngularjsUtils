/*!
 * angularjs-components
 * https://github.com/cenkce/angularjs-utils#readme
 * Version: 0.1.0 - 2016-02-03T13:36:01.547Z
 * License: MIT
 */


(function (angular) { 
'use strict';
var module = angular.module('cenkce.utils', ['ng']);

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

/**
 * Created by cenkce on 1/22/16.
 */

CropperService.$inject = ['cenkce.imageFileReader', '$rootScope', '$window', '$q'];

var CropServiceEvents = {
    imageLoaded :'cropper:image-loaded',
    imageSelected:'cropper:image-selected',
    EXIFFetched:'cropper:exif-fetched',
    completed:'cropper:completed',
    cropped:'cropper:cropped'
};

function CropperService(imageReader, $rootScope, $window, $q){
    var _that = this, _cropper = $window.cropper, waitingRotation = 0, temp, _isDirty = false,
        _config = {
            dragMode: 'move',
            scalable:false,
            aspectRatio: 1,
            restore: false,
            minCropBoxWidth:230,
            checkOrientation : false,
            guides: false,
            toggleDragModeOnDblclick:false,
            center: false,
            highlight: false,
            cropBoxMovable: false,
            cropBoxResizable: false
        },
        _image = new Image;

    if(typeof Cropper === 'undefined')
        throw new Error('Croppperjs is not found.');

    function setDirty(value){
        _isDirty = value;
    }

    this.setElement = function (image) {
        _image = image;
    };

    this.getElement = function () {
        return _image;
    };

    this.setConfig = function (config) {
        _config = angular.copy(config);
    };

    this.getConfig = function () {
        angular.copy(_config);
    };

    this.exportData = function () {
        if(!_cropper)
            return;

        var prefix = ';base64,';
        var data   = {};
        var img    = new Image();

        var canvas = _cropper.getCroppedCanvas({width:w, height:h});
        data.url = canvas.toDataURL("image/jpeg", 1.0);

        img.src = data.url;

        if(!data.url)
            return false;

        data.idx = data.url.indexOf(prefix);

        if (data.idx >= 0) {
            data.base64 = data.url.substring(data.idx + prefix.length);
        }

        data.fileName = generateUUID()+'.jpg';
        return data;
    };

    function drawImage(image) {
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = image.naturalWidth;
        tempCanvas.height = image.naturalHeight;

        var ctx = tempCanvas.getContext("2d");
        ctx.drawImage(image, 0, 0);

        return tempCanvas.toDataURL();
    };

    this.zoomTo = function (value) {
        _cropper.zoomTo(value);
    };

    this.rotate = function (degree) {
        _cropper.rotate(degree);
    };

    this.getCropper = function () {
        return _cropper;
    };

    this.load = function(files){
        setDirty(true);
        var defer = $q.defer();

        _config.cropend = function (e, action) {
        };

        if(files.length > 1)
            throw new Error('Multi-files are not supported');

        if($window.EXIF === undefined)
            throw new Error('exif-js cannot be found.');

        imageReader.read(files).then(function (data) {
            if(!data[0].url){
                throw new Error('File data is not readable');
            }

            _image.src = data[0].url;

            _image.onload = function () {
                //var img = new Image;
                setDirty(false);

                //IOS auto rotation hack
                _image.src = drawImage(_image);

                _image.onload = function () {
                    defer.notify({message:CropServiceEvents.imageLoaded, complete: function () {
                        _cropper = new Cropper(_image, _config);

                        _that.zoomTo(0.5);

                        //detects image orientation and rotates it by orientation.
                        EXIF.getData(files[0], function() {
                            defer.notify({message:CropServiceEvents.EXIFFetched});

                            switch(this.exifdata.Orientation){
                                case 8:
                                    _cropper.rotate(-90);
                                    break;
                                case 3:
                                    _cropper.rotate(180);
                                    break;
                                case 6:
                                    _cropper.rotate(90);
                                    break;
                                default:

                                    break;
                            }

                            defer.notify({message:CropServiceEvents.completed, complete: function () {
                                defer.resolve();
                            }});
                        });

                    }, cancel: function () {
                        defer.reject();
                    }});
                    //Creates new Cropper instance and injects hacked image to
                };
            };

            _image.src = data[0].url;
        });

        return defer.promise;
    }
}

CropperComponent.$inject = ['cenkce.cropperService'];

function CropperComponent($cropper){
    var _btn, _image = new Image;
    $cropper.setElement(_image);
    return {
        restrict: 'A',
        controller: ['$scope', function ($scope) {
            $scope.$watch('zoom', function (newV, oldV) {
                if(newV)
                    $scope.zoomTo(newV);
            });

            $scope.zoomTo = function (val) {
                $cropper.zoomTo(val);
            };

            $scope.exportCroppedData = function (w, h) {
                $cropper.exportData();
            };

            $scope.fileBrowse = function () {
                console.log('browse');
                _btn[0].click();
            };
        }],
        controllerAs:'cropperCtrl',
        scope:true,
        link: function ($scope, elem, attrs) {
            //File input
            _btn = elem.find('input[type=file]');

            //file input is not found.
            if(_btn.length == 0){
                _btn = angular.element('<input type=\'file\' style="display: none;" >');
                elem.append(_btn);
            }
            //file input source is changed by user
            _btn.bind('change', function (e) {
                $cropper.load(e.target.files).then(
                    //completed
                    function (data) {
                       console.log('completed');
                    },
                    //error
                    function (data) {

                    },
                    //messages
                    function (data) {
                        console.log('messages : ',data);
                        if(data.message == CropServiceEvents.imageLoaded) {
                            $scope.addPreview($cropper.getElement());
                            data.complete();
                        } else if(data.message == CropServiceEvents.completed) {
                            data.complete();
                        }
                    }
                );
            });

            $scope.$on('$destroy', function () {
                _btn.unbind('change');
                _btn = null;
            });
        }
    }
}

function CropperComponentPreview(){
    return {
        requie:'?cropper',
        restrict:'A',
        link: function ($scope, elem, attrs) {
            $scope.addPreview = function(element){
                elem.html('');
                elem.append(element);
            }
        }
    }
};

angular.module('cenkce.utils').service('cenkce.cropperService', CropperService);
angular.module('cenkce.utils').directive('cropper', CropperComponent);
angular.module('cenkce.utils').directive('cropperPreview', CropperComponentPreview);

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

/**
 * Created by cenkce on 2/1/16.
 */
angular.module('cenkce.utils').service('cenkce.generateUUID', generateUUID);
function generateUUID() {
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x3|0x8)).toString(16);
    });
    return uuid;
};
/**
 * Created by cenkce on 1/23/16.
 */

ImageFileReader.$inject = ['$q'];

function ImageFileReader(p) {
    var $q = p;
    this.read = function(files) {
        var reader = new FileReader(),
            filesData = [],
            prefix = ';base64,';

        var promises = [];

        for (var i = 0, f; f = files[i]; i++) {
            // Only process image files.
            if (!f.type.match('image.*')) {
                throw new Error('type must be image');
                continue;
            }

            var defer = $q.defer();
            promises.push(defer.promise);

            (function (defer, f) {
                reader.onload = function(e) {
                    var data = {};
                    var idx;

                    if(reader.readyState == FileReader.DONE) {
                        data.url = e.target.result;
                        data.idx = data.url.indexOf(prefix);

                        if (data.idx >= 0) {
                            data.base64 = data.url.substring(data.idx + prefix.length);
                        }

                        data.fileName = f.name;
                    }

                    defer.resolve(data);
                };

            })(defer, f);

            reader.readAsDataURL(f);
        }

        return $q.all(promises);
    };
};

angular.module('cenkce.utils').service('cenkce.imageFileReader', ImageFileReader);

}(window.angular));