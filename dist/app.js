/*!
 * angularjs-components
 * https://github.com/cenkce/angularjs-utils#readme
 * Version: 0.1.0 - 2016-02-23T13:01:13.622Z
 * License: MIT
 */


(function (angular) { 
'use strict';
var module = angular.module('cenkce.utils', ['ng']);

/**
 * Created by cenkce on 1/25/16.
 */


angular.module('cenkce.utils').service('cenkce.utils.sharer', Sharer);
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
            (_unbinds.shilt())();
        }
    };

    this.$on = function (scope, event, handler) {
        _unbinds.push(scope.$on(event, handler));
    };

    this.$watch = function (scope, event, handler) {
        _unbinds.push(scope.$watch(event, handler));
    };
};

/**
 * Created by cenkce on 1/22/16.
 */

CropperApplication.$inject = ['cenkce.utils.imageFileReader', '$rootScope', '$window', '$q'];

var CropServiceEvents = {
    imageLoaded :'cropper:image-loaded',
    imageSelected:'cropper:image-selected',
    EXIFFetched:'cropper:exif-fetched',
    completed:'cropper:completed',
    cropped:'cropper:cropped'
};

function CropperApplication(imageReader, $rootScope, $window, $q){
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
        _image = new Image,
        _element = angular.element('<div></div>');

    if(typeof Cropper === 'undefined')
        throw new Error('Croppperjs is not found.');

    /**
     * Sets dirty state
     * @param value
     */
    function setDirty(value) {
        _isDirty = value;
    }

    function create(source){
        setDirty(true);
        var defer = $q.defer();

        var img = new Image;
        img.src = source;

        img.onload = function () {
            //var img = new Image;

            if($window.EXIF === undefined)
                throw new Error('exif-js cannot be found.');

            //IOS auto rotation hack
            _image.src = _that.drawImage(img);

            _image.onload = function () {
                _element.append(_image);
                _cropper = new Cropper(_image, _config);
                setDirty(false);

                //detects image orientation and rotates it
                _that.autoRotate(this.src);
                defer.resolve('cenkce');
            };
        };

        return defer.promise;
    }

    this.getImage = function () {
        var image = new Image();
        image.src = _image.src;
        return image;
    }

    this.autoRotate = function (source) {
        EXIF.getData(source, function() {
            //defer.notify({message:CropServiceEvents.EXIFFetched});

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

        });
    }

    /**
     * Returns cropperjs html container element
     * @returns {*|Object}
     */
    this.getElement = function () {
        return _element;
    };

    /**
     * Sets cropperjs config
     * @param config
     */
    this.setConfig = function (config) {
        _config = angular.copy(config);
    };

    /**
     * Return cropperjs config
     */
    this.getConfig = function () {
        angular.copy(_config);
    };

    /**
     * Returns an image data object with base64 data
     *
     * {
     *   //Base64 data
     *   url:'',
     *   //Headerless Base64 data
     *   base64:''
     * }
     * @param w
     * @param h
     * @returns {*}
     */
    this.exportData = function (w, h) {
        if(!_cropper)
            return;

        var prefix = ';base64,';
        var data   = {};
        var img    = new Image();

        var canvas = _cropper.getCroppedCanvas({width:w, height:h});
        data.url   = canvas.toDataURL("image/jpeg", 1.0);

        img.src = data.url;

        if(!data.url)
            return false;

        data.idx = data.url.indexOf(prefix);

        if (data.idx >= 0) {
            data.base64 = data.url.substring(data.idx + prefix.length);
        }

        //data.fileName = generateUUID()+'.jpg';
        return data;
    };

    /**
     * Draw an image via canvas element
     * @param image
     * @returns {string}
     */
    this.drawImage = function(image) {
        var tempCanvas = document.createElement('canvas');
        tempCanvas.width = image.naturalWidth;
        tempCanvas.height = image.naturalHeight;

        var ctx = tempCanvas.getContext("2d");
        ctx.drawImage(image, 0, 0);

        return tempCanvas.toDataURL();
    };

    /**
     * Sets cropperjs zoom
     * @param value
     */
    this.zoomTo = function (value) {
        if(_cropper)
            _cropper.zoomTo(value);
    };

    /**
     * Sets cropperjs rotate
     * @param degree
     */
    this.rotate = function (degree) {
        if(_cropper)
            _cropper.rotate(degree);
    };

    /**
     * Returns Cropperjs instance
     * @returns {cropper}
     */
    this.getCropper = function () {
        return _cropper;
    };

    /**
     * Loads an image from File object
     * @param files
     * @returns {promise|*|module.exports.currentlyUnhandled.promise|AnimateRunner.promise|qFactory.Deferred.promise|vd.g.promise}
     */
    this.loadFromFileObject = function(files){
        var defer = $q.defer();

        _config.cropend = function (e, action) {
        };

        if(files.length > 1)
            throw new Error('Multi-files are not supported');

        imageReader.read(files).then(function (data) {
            if(!data[0].url){
                defer.reject('File data is not readable');
            }

            create(data[0].url).then(
                function (data) {
                    defer.resolve(data);
                },
                function (data) {
                    defer.reject(data);
                },
                function (data) {
                    defer.notify(data);
                }
            );
        });

        return defer.promise;
    };

    /**
     * Loads an image from url
     * @param url
     * @returns {promise}
     */
    this.loadFromUrl = function(url){

        _config.cropend = function (e, action) {
        };

        var p = create(url).then(
            function (data) {
                return data;
            },
            function (data) {
                return data;
            },
            function (data) {
                return data;
            }
        );

        return p;
    };
}


CropperComponent.$inject = ['cenkce.utils.cropperApp'];

function CropperComponent($cropper){
    var _btn;

    return {
        restrict: 'A',
        controller: ['$scope', function ($scope) {
            $scope.cropper        = {};
            $scope.cropper.zoomTo = 0;
            $scope.zoom           = 0;

            $scope.$watch('zoom', function (newV, oldV) {
                if(newV)
                    $cropper.zoomTo(newV);
            });

            $scope.$parent.exportCroppedData = function (w, h) {
                return $cropper.exportData(w, h);
            };

            $scope.$parent.fileBrowse = function () {
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
                $scope.addPreview($cropper.getElement());
                $cropper.loadFromFileObject(e.target.files).then(
                    //completed
                    function (data) {
                    },
                    //error
                    function (data) {
                    },
                    //messages
                    function (data) {
                        if(data.message == CropServiceEvents.imageLoaded) {
                        } else if(data.message == CropServiceEvents.completed) {
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

angular.module('cenkce.utils').service('cenkce.utils.cropperApp', CropperApplication);
angular.module('cenkce.utils').directive('cropper', CropperComponent);
angular.module('cenkce.utils').directive('cropperPreview', CropperComponentPreview);

/**
 * Created by cenkce on 1/25/16.
 */

angular.module('cenkce.utils').service('cenkce.uitls.ga', GAnalytics);

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
angular.module('cenkce.utils').service('cenkce.utils.generateUUID', generateUUID);
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

//TODO:refactor to file-reader
function ImageFileReader(p) {
    var $q = p;
    this.read = function(files) {
        var reader = new FileReader(),
            filesData = [],
            prefix = ';base64,';

        var promises = [];

        for (var i = 0, f; f = files[i]; i++) {
            // process for only image files.
            if (!f.type.match('image.*')) {
                throw new Error('file must be image');
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

angular.module('cenkce.utils').service('cenkce.utils.imageFileReader', ImageFileReader);

}(window.angular));