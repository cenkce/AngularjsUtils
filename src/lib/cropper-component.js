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
    function drawImage(image) {
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
     * @returns {{}|*|cropper|$scope.cropper|Cropper.cropper|j.cropper}
     */
    this.getCropper = function () {
        return _cropper;
    };

    /**
     * Loads an image from File object
     * @param files
     * @returns {promise|*|module.exports.currentlyUnhandled.promise|AnimateRunner.promise|qFactory.Deferred.promise|vd.g.promise}
     */
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

            var img = new Image;
            img.src = data[0].url;

            img.onload = function () {
                //var img = new Image;
                setDirty(false);

                //IOS auto rotation hack
                _image.src = drawImage(img);

                _image.onload = function () {
                    //var container = angular.element('<div></div>);
                    //defer.notify({message:CropServiceEvents.imageLoaded, complete: function () {
                        console.log('completed');

                        _element.append(_image);
                        _cropper = new Cropper(_image, {
                            dragMode: 'move',
                            scalable:false,
                            aspectRatio: 1,
                            restore: false,
                            minCropBoxWidth:200,
                            minCropBoxHeight:200,
                            checkOrientation : false,
                            guides: false,
                            toggleDragModeOnDblclick:false,
                            center: false,
                            highlight: false,
                            cropBoxMovable: false,
                            cropBoxResizable: false,
                            cropend: function (e, action) {
                            }});


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

                            //defer.notify({message:CropServiceEvents.completed, complete: function () {
                                defer.resolve();
                            //}});
                        });
/*
                    }, cancel: function () {
                        defer.reject();
                    }});*/
                    //Creates new Cropper instance and injects hacked image to
                };
            };
        });

        return defer.promise;
    }
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
                console.log('zoom');
                if(newV)
                    $cropper.zoomTo(newV);
            });

            $scope.$parent.exportCroppedData = function (w, h) {
                return $cropper.exportData(w, h);
            };

            $scope.$parent.fileBrowse = function () {
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
                $scope.addPreview($cropper.getElement());
                $cropper.load(e.target.files).then(
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
